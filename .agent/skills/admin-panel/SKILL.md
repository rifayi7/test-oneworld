---
name: admin-panel
description: Build a secure, role-based admin panel / CMS for a Next.js App Router site backed by Turso — DB-stored user accounts with scrypt passwords, an HMAC-signed session cookie verified in proxy/middleware, Admin/Editor/Viewer RBAC, and a CRUD-per-resource UI (sidebar shell + list table + view/create/edit pages) that is mobile-friendly (stacked cards, not horizontal scroll). Use when adding an /admin area, dashboard, CMS, content management, protected admin routes, user management, role-based access, or CRUD screens to manage DB content.
---

# Admin panel (auth → RBAC → CRUD UI)

A production-shaped admin for a Next.js App Router app. Pairs with `turso-backend`
(the DB client + secrets) and `form-submission` (public writes). It adds: login,
sessions, role-based access, and a consistent CRUD UI for every managed entity.

Pipeline: **proxy guards /admin → login (email+password, scrypt) → signed session
cookie → server resolves user+role → role-gated server actions (parameterized SQL)
→ revalidate the public site.**

## ⛔ Intake gate — confirm before building

Ask via `AskUserQuestion` (or proceed with the defaults in **bold** and state them):

1. **Which entities** get a managed CRUD (e.g. packages, items, gallery, leads)?
   Which are editable vs read-only (leads/submissions are usually read-only)?
2. **Role model** — default **Admin / Editor / Viewer** (Admin = full + manage
   users; Editor = edit content + view leads; Viewer = read-only). Confirm names
   and per-role permissions.
3. **Who sees PII** (leads/submissions) — **all signed-in roles** or editors+only?
4. **Secrets** — `AUTH_SECRET` (sign cookies; `openssl rand -hex 32`) and the
   Turso creds from `turso-backend`. Never `NEXT_PUBLIC_`.
5. **First admin** — bootstrap via a one-off CLI script (below). Never ship a
   shared plaintext password as the gate.
6. **Images/files** — manage by **URL/path string** (point at `/public`), or add
   real upload (object storage)? Default: URL/path; upload is a separate add.

## Architecture (route + module map)

```
src/proxy.ts                       # Next 16 "proxy" (was middleware): guards /admin/*
src/lib/roles.ts                   # PURE role model — safe in client AND server
src/lib/users.ts                   # server-only: scrypt + user DB queries (re-exports roles)
src/lib/admin-auth.ts              # Web Crypto session sign/verify (node + edge)
src/db/admin.ts                    # server-only admin reads (incl. unpublished) + by-id
src/app/admin/login/page.tsx       # OUTSIDE the (panel) group — no shell, no loop
src/app/admin/actions.ts           # "use server" — login/logout + guarded CRUD
src/app/admin/(panel)/layout.tsx   # auth gate + <AdminShell> (sidebar)
src/app/admin/(panel)/page.tsx     # overview
src/app/admin/(panel)/<entity>/    # page.tsx (list) · new · [id] (view) · [id]/edit
src/components/admin/AdminShell.tsx        # sidebar + mobile drawer
src/components/admin/ResponsiveTable.tsx   # table on md+, cards on mobile
src/components/admin/<entity>/...          # <Entity>Table + <Entity>Form
scripts/create-admin.mjs           # bootstrap the first admin
```

Use a **route group `(panel)`** so the authenticated pages share a layout/shell
while `/admin/login` stays outside it — otherwise the layout's auth-redirect
loops on the login page itself.

## 1. Sessions — sign in BOTH runtimes (Web Crypto, no Node APIs)

`proxy.ts` runs on Edge; server actions run on Node. The session signer must work
in both, so use `crypto.subtle` HMAC — no `node:crypto`, no `Buffer`. Token =
`<uid>.<exp>.<hmac(uid.exp, AUTH_SECRET)>`. The proxy only verifies the signature
(no DB); role checks happen later in Node where the DB is reachable.

```ts
// src/lib/admin-auth.ts  (importable by proxy AND actions)
export const ADMIN_COOKIE = "admin_session";
const enc = new TextEncoder();
async function hmac(msg: string, key: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return [...new Uint8Array(s)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function createSessionToken(uid: number) {
  const exp = String(Date.now() + 7 * 864e5);
  return `${uid}.${exp}.${await hmac(`${uid}.${exp}`, process.env.AUTH_SECRET!)}`;
}
export async function readSession(token?: string | null): Promise<number | null> {
  if (!token) return null;
  const [uid, exp, sig] = token.split(".");
  if (!uid || !exp || Number(exp) < Date.now()) return null;
  const ok = sig === (await hmac(`${uid}.${exp}`, process.env.AUTH_SECRET ?? ""));
  return ok && Number.isInteger(+uid) ? +uid : null;   // use a constant-time compare in practice
}
```

Cookie: `httpOnly`, `sameSite:"lax"`, `secure` in prod, `path:"/"`, `maxAge`.
`proxy.ts` matches `/admin/:path*`, lets `/admin/login` through, else
`readSession` → redirect to login.

## 2. Users + RBAC — and the server-only/client boundary (the #1 gotcha)

scrypt via `node:crypto` (no native deps). Store `salt:hash`; constant-time
compare. **Split the role model out of the server-only module:** a client
component that needs `ROLES`/labels/types must NOT import them from a file that
starts with `import "server-only"` — that throws at build. Put the pure model in
its own file; the server module re-exports it.

```ts
// src/lib/roles.ts  — NO "server-only": safe in client + server
export const ROLES = ["admin", "editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];
export interface User { id: number; email: string; name: string | null; role: Role; created_at: string }
export const canEditContent = (r: Role) => r === "admin" || r === "editor";
export const canManageUsers  = (r: Role) => r === "admin";

// src/lib/users.ts  — "server-only": scrypt + DB; re-exports the pure model
import "server-only"; import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
export { ROLES, canEditContent, canManageUsers } from "./roles";
export type { Role, User } from "./roles";
// hashPassword/verifyLogin/getUserById/listUsers/createUser/updateUser*/deleteUser/countAdmins …
```

`users` table: `email UNIQUE, name, password_hash, role, created_at`. Bootstrap
the first admin with `scripts/create-admin.mjs <email> <password>` (hashes with
the same scrypt params) — never a hardcoded shared password.

## 3. Guarded server actions

Every mutation is `"use server"`, resolves the live user from the DB, checks the
role, uses **parameterized SQL only**, then `revalidatePath("/")` so the public
site updates. Client validation is UX; the server is authoritative.

```ts
async function requireUser()   { const u = await getCurrentUser(); if (!u) redirect("/admin/login"); return u; }
async function requireEditor() { const u = await requireUser(); if (!canEditContent(u.role)) throw new Error("Forbidden"); return u; }
async function requireAdmin()  { const u = await requireUser(); if (!canManageUsers(u.role)) throw new Error("Forbidden"); return u; }
```

**Guardrails:** can't delete your own account; can't delete or demote the **last
admin**. Login sets the cookie; logout deletes it.

## 4. Ordered lists — resequence so `sort` is never duplicated

When a `sort`/order field is user-editable, setting a value must push the others
down, and the list should stay contiguous `0,1,2,…`. After every create/edit/
delete, renumber in one batched transaction. The just-saved row wins ties so it
lands where the user asked.

```ts
async function resequence(table: "items" | "gallery", scope: string | null, targetId = 0) {
  const db = getDb();
  const where = scope !== null ? "WHERE scope_col = ?" : "";
  const args = scope !== null ? [scope, targetId] : [targetId];
  const rows = await db.execute({ sql: `SELECT id FROM ${table} ${where} ORDER BY sort ASC, (id = ?) DESC, id ASC`, args });
  await db.batch(rows.rows.map((r, i) => ({ sql: `UPDATE ${table} SET sort = ? WHERE id = ?`, args: [i, Number(r.id)] })));
}
```
`table` must be a **fixed literal** (never user input). On INSERT, capture
`res.lastInsertRowid` as the target. Also run it (no target) after deletes to
close gaps. Normalize existing rows once via a script.

## 5. CRUD-per-resource UI

Each managed entity gets four routes — a Rails-like CRUD, not one giant page:

- `…/<entity>/page.tsx` — **list** (a table; View/Edit/Delete + a "New" button)
- `…/<entity>/new/page.tsx` — **create** form
- `…/<entity>/[id]/page.tsx` — **view** one (read-only; `await params`; `notFound()`)
- `…/<entity>/[id]/edit/page.tsx` — **edit** form

A single `<EntityForm item?>` powers create+edit: a hidden `id` when editing, one
`upsert` action that INSERTs when id is absent and UPDATEs when present, then
`router.push(listUrl)`. **Role-aware:** Viewers see list + view only; the
`new`/`edit` routes redirect non-editors; the list hides Edit/Delete/New for them.

## 6. UI system — reuse the site tokens, utilitarian not cinematic

- **Shell** (`AdminShell`): fixed sidebar on `md+`, a slide-in **drawer** on
  mobile (close on Escape, lock body scroll, `role="dialog"`, a close button,
  `aria-current` on the active link). Top bar shows the user + role badge,
  "View site", and logout.
- **Content width**: don't over-constrain — fill the column (avoid a tight
  `max-w-*` that wastes the screen); keep comfortable gutters.
- **Theme**: reuse the project's role tokens (`bg-ink`, `bg-surface` white cards,
  `text-bone`, `text-mist`, `text-accent`, `border-border`) — a clean dashboard,
  NOT the marketing theme. Shared `inputClass`/`labelClass`; forms show a
  transient idle/saving/saved/error status.
- **Mobile tables**: NEVER ship a horizontally-scrolling table as the mobile
  answer. Use the `ResponsiveTable` primitive (see `references/responsive-table.tsx`):
  a real `<table>` on `md+`, a **stacked card list** on mobile where each row is a
  card (a `primary` column as the title, the rest as `label → value`, actions in a
  footer). Long values wrap; tap targets are ≥ `px-2 py-1`; interactive elements
  get `focus-visible:ring-2 focus-visible:ring-accent`.

## Security & correctness rules (non-negotiable)

- **Parameterized SQL only** (`{ sql, args }`). Interpolate only fixed literal
  table/column names, never user input.
- **Secrets are server-only** — `AUTH_SECRET`, DB token; never `NEXT_PUBLIC_`.
- **Authorize every action on the server** by re-reading the user + role from the
  DB. Client gating is cosmetic.
- **Hash passwords** (scrypt/argon2/bcrypt) with a per-user salt; constant-time
  compare; never log or store plaintext.
- **Session cookie**: `httpOnly`, signed, expiring, `secure` in prod. Proxy
  verifies signature; pages/actions enforce roles.
- **server-only boundary**: DB/password modules are `import "server-only"`; the
  pure role model lives in its own importable-anywhere file.
- **Don't lock out admins**: block deleting/demoting the last admin and self-delete.
- Consider `noindex` on `/admin`; rotate any secret that ever entered a transcript.

## Checklist

- [ ] `AUTH_SECRET` + Turso creds in gitignored `.env.local`; never `NEXT_PUBLIC_`
- [ ] `users` table migrated; first admin seeded via the bootstrap script
- [ ] `admin-auth` signs/verifies in node + edge (Web Crypto, no Buffer)
- [ ] `proxy.ts` guards `/admin/*`; `/admin/login` outside the `(panel)` group
- [ ] Role model split into a non-server-only file; client imports it from there
- [ ] Every action: role-guarded + parameterized + `revalidatePath`
- [ ] Ordered lists resequence to contiguous `0..n` on create/edit/delete
- [ ] Each entity has list + new + view + edit; Viewers are read-only
- [ ] `ResponsiveTable` used — cards on mobile, no horizontal scroll
- [ ] Drawer a11y (Esc/scroll-lock/close/aria-current) + focus-visible rings
- [ ] Last-admin / self-delete guardrails; `npm run build` clean; a test edit shows on the site
