---
name: turso-backend
description: Add Turso (libSQL/SQLite) as the backend for a Next.js landing page's dynamic content — read content like tour packages/pricing from the DB, and persist writes like lead/form submissions. Covers one-time Turso CLI + env setup, a server-only libSQL client singleton, SQL migrations, reads in Server Components (with revalidation), and writes via Server Actions with validation + parameterized queries. Use when wiring a form to a database, making content editable without a redeploy, storing leads/submissions, or adding any persistence to the site.
---

# Turso backend (libSQL) for the landing page

Turso is hosted **libSQL** (a SQLite fork). It fits this stack: tiny, edge-close,
SQL, and it talks to Next.js Server Components / Server Actions over HTTP — no
connection pool to manage. Use it for the two dynamic needs:

- **Reads** — content that should change without a redeploy (tour **packages**,
  pricing, seat counts). Today these live hardcoded in `content.ts`; move the
  dynamic ones to the DB and read them server-side.
- **Writes** — **form / lead submissions** from the CTA flow, persisted instead
  of only opening WhatsApp.

## ⛔ Intake gate — confirm before writing any code

Ask via `AskUserQuestion`; this touches secrets, data shape, and hosting.

Required inputs:
1. **What data** goes in the DB now — list the tables (e.g. `leads`,
   `packages`) and the fields each needs. Get the real shape, not a guess.
2. **Read vs write per entity** — is it editable content read on the page
   (packages), captured input (leads), or both?
3. **Freshness for read content** — can it be cached/revalidated (ISR, e.g.
   every 60s) or must it be live per request? (Affects performance — see
   `web-performance`.)
4. **Hosting / runtime** — Node runtime (default; use `@libsql/client`) or Edge
   runtime (use `@libsql/client/web`). Confirm where this deploys.
5. **Cloud credentials (REQUIRED, always ask).** Always use a **hosted Turso
   cloud** database — ask the user for the cloud `TURSO_DATABASE_URL`
   (`libsql://…turso.io`) and `TURSO_AUTH_TOKEN`. **Never** set up a local file
   DB (`file:…`), embedded replica, or `:memory:`. If they don't have the
   credentials yet, point them at the provisioning steps in §1 so they can
   create the cloud DB and get the URL + token — then proceed with those.
6. **Existing flow to keep** — the current `LeadModal` opens WhatsApp. Persist to
   DB *and* keep WhatsApp, or replace it? Confirm.

Echo the table list + fields + read/write/freshness back before generating.

## 1. One-time setup (provisioning + secrets)

> **Always a hosted cloud DB.** This skill never uses a local file (`file:local.db`),
> embedded replica, or `:memory:` database — they don't persist for a deployed
> site. Always ask the user for the cloud `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
> (or have them create one with the commands below).

Run by the user (token must not enter the chat transcript):

```bash
# Install CLI (macOS): brew install tursodatabase/tap/turso ; turso auth login
turso db create <project-name>
turso db show --url <project-name>          # → TURSO_DATABASE_URL  (libsql://...)
turso db tokens create <project-name>       # → TURSO_AUTH_TOKEN    (secret)
```

Store in `.env.local` (already gitignored via `.env*` — verify with
`git check-ignore .env.local`). **Server-only — never `NEXT_PUBLIC_`:**

```
TURSO_DATABASE_URL=libsql://<db>-<org>.turso.io
TURSO_AUTH_TOKEN=<secret>
```

Install the client: `npm i @libsql/client`. (Optional typed layer: Drizzle ORM
via `drizzle-orm/libsql` — only if the user wants an ORM; raw SQL is fine here.)

## 2. Server-only client singleton

`src/db/client.ts` — created once, never imported into a Client Component.

```ts
import "server-only";              // hard-fails the build if imported client-side
import { createClient } from "@libsql/client";  // "@libsql/client/web" on Edge runtime

// Both are required — this is always a hosted cloud DB, never a local file.
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) throw new Error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN missing");

export const db = createClient({ url, authToken });
```

`npm i server-only` if not present. The env vars have no `NEXT_PUBLIC_` prefix,
so they never reach the browser bundle — keep it that way. Both vars are
mandatory; do not fall back to a local `file:` URL if they're missing — fail
loudly and ask the user for the cloud credentials instead.

## 3. Schema & migrations

Keep SQL in `src/db/migrations/*.sql`, checked into git, applied with the CLI.

```sql
-- src/db/migrations/0001_init.sql
CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  group_size  INTEGER,
  source      TEXT,                       -- which CTA / section
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS packages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  price       INTEGER,                     -- store minor units (paise/cents)
  blurb       TEXT,
  sort        INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1   -- 0/1 boolean
);
```

Apply: `turso db shell <project-name> < src/db/migrations/0001_init.sql`.
New changes go in a new numbered file; never edit an applied migration.

## 4. Reads — dynamic content in Server Components

Fetch in a Server Component (or a typed helper). Decide freshness explicitly.

```ts
// src/db/queries.ts
import "server-only";
import { db } from "./client";

export async function getPublishedPackages() {
  const r = await db.execute(
    "SELECT slug, title, price, blurb FROM packages WHERE published = 1 ORDER BY sort"
  );
  return r.rows as unknown as { slug: string; title: string; price: number; blurb: string }[];
}
```

```tsx
// in a Server Component section
export const revalidate = 60;   // ISR: re-fetch at most every 60s (or `0` for live)
const packages = await getPublishedPackages();
```

- **Prefer `revalidate` (ISR) over fully dynamic** for content that changes
  rarely — keeps TTFB fast. Only go live-per-request when seat counts etc. must
  be exact.
- Keep static brand copy in `content.ts`; only move the *changes-without-deploy*
  fields to the DB. Don't DB-ify everything.

## 5. Writes — form submissions via Server Action

```ts
// src/app/actions/submit-lead.ts
"use server";
import { db } from "@/db/client";

export async function submitLead(formData: FormData) {
  // Honeypot: a hidden field bots fill but humans don't.
  if (formData.get("company")) return { ok: true };       // silently drop bots

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  if (!name || !/^[+0-9 ()-]{7,}$/.test(phone)) {
    return { ok: false, error: "Name and a valid phone are required." };
  }

  // ALWAYS parameterized — never string-concat user input into SQL.
  await db.execute({
    sql: "INSERT INTO leads (name, phone, email, source) VALUES (?, ?, ?, ?)",
    args: [name, phone, email, "lead-modal"],
  });
  return { ok: true };
}
```

Wire it into the existing `LeadModal` form (`<form action={submitLead}>` or call
it from the submit handler). Per the intake decision, you can persist **and**
still open WhatsApp — do the DB insert first, then the `wa.me` redirect.

## Security & correctness rules (non-negotiable)

- **Parameterized queries only** (`{ sql, args: [...] }`). Never interpolate user
  input into SQL — that's injection.
- **Auth token is server-only.** No `NEXT_PUBLIC_`; never import `db/client.ts`
  into a Client Component; rely on `import "server-only"` to enforce it.
- **Validate every input** server-side (don't trust the client). Length-cap
  strings; whitelist formats (phone/email).
- **Spam defense** on public writes: honeypot field + basic rate limiting (per
  IP/session). Consider a captcha only if abuse appears.
- **Never log** full submissions with PII to stdout in production.
- **Migrations are append-only** and committed; the DB token is not.
- Booleans are `0/1` integers in SQLite; dates as ISO `TEXT` via `datetime('now')`.

## Checklist

- [ ] Turso DB created; `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` in gitignored `.env.local`
- [ ] `@libsql/client` + `server-only` installed
- [ ] `db/client.ts` is server-only; no `NEXT_PUBLIC_` on secrets
- [ ] Migration committed and applied via `turso db shell`
- [ ] Reads use `revalidate`/ISR unless they must be live
- [ ] Writes go through a Server Action: validated + honeypot + parameterized
- [ ] `LeadModal` wired (persist; keep/replace WhatsApp per intake)
- [ ] `npm run build` clean; submit a test lead and confirm the row lands
