---
name: form-submission
description: Build a secure form-submission flow for the landing page — client + server validation, an international phone field with country code (E.164), persistence straight to a Turso table, and invisible Google reCAPTCHA v3 with the required "protected by reCAPTCHA" disclosure by the submit button. Use when building or wiring any lead/contact/enquiry form, adding form validation, capturing phone numbers, saving submissions to a database, or adding spam/bot protection.
---

# Form submission (validate → reCAPTCHA → Turso)

End-to-end secure form flow. Pairs with `turso-backend` (the DB client + secrets
live there; this skill adds the table, validation, phone handling, and reCAPTCHA).
Wires into the existing `LeadModal` / CTA forms.

Pipeline on submit: **client validate → get reCAPTCHA token → Server Action →
server validate → verify reCAPTCHA → validate/normalize phone → insert to Turso.**

## ⛔ Intake gate — confirm before building

Ask via `AskUserQuestion`:
1. **Fields** — exact list (name, phone, email, message, group size…) and which
   are required vs optional.
2. **Phone** — needed? If yes, default country (e.g. India `IN`) and whether to
   require a valid number or just store what's typed. (Default: validate.)
3. **Turso** — confirm the cloud DB from `turso-backend` is set up (URL + token in
   env). If not, run `turso-backend` setup first.
4. **reCAPTCHA keys** — does the user have a Google reCAPTCHA **v3** site key +
   secret key? If not, point them to https://www.google.com/recaptcha/admin to
   create a v3 key for their domain(s) + `localhost`.
5. **Badge** — hide the reCAPTCHA badge (then the disclosure text is **mandatory**
   next to the submit button) or show Google's default badge? Default: hide +
   disclosure.
6. **On success** — keep the existing WhatsApp redirect, show a thank-you state,
   or both?

## Dependencies & env

```bash
npm i zod libphonenumber-js react-phone-number-input
# @libsql/client + server-only come from turso-backend
```

`.env.local` (gitignored). The **site key is public** (it must reach the browser,
so `NEXT_PUBLIC_`); the **secret key is server-only**:

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...           # server-only, never NEXT_PUBLIC_
# plus TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from turso-backend
```

## 1. Turso table (migration)

`src/db/migrations/0002_leads.sql` — apply with
`turso db shell <db> < src/db/migrations/0002_leads.sql`.

```sql
CREATE TABLE IF NOT EXISTS leads (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  email           TEXT,
  phone_e164      TEXT,                 -- normalized: +<country><number>
  phone_country   TEXT,                 -- ISO 3166 alpha-2 (e.g. "IN")
  message         TEXT,
  source          TEXT,                 -- which form/CTA
  recaptcha_score REAL,                 -- 0.0–1.0 from v3
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
```

## 2. Validation schema (shared, Zod)

One schema, used to validate on the server (authoritative) and to drive client
hints. `src/lib/lead-schema.ts`:

```ts
import { z } from "zod";

export const LeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.union([z.string().email().max(200), z.literal("")]).optional(),
  phone: z.string().trim().optional(),       // E.164 from the phone input
  message: z.string().max(2000).optional(),
  company: z.string().optional(),            // honeypot — must stay empty
  token: z.string().min(1),                  // reCAPTCHA token
});
export type LeadInput = z.infer<typeof LeadSchema>;
```

## 3. International phone with country code

Use the `react-phone-number-input` field → returns an **E.164** string
(`+919876543210`); validate with `libphonenumber-js`.

```tsx
"use client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";   // then restyle to match tokens

// value is E.164 or undefined; defaultCountry sets the initial dial code
<PhoneInput international defaultCountry="IN" value={phone} onChange={setPhone}
  className="field" placeholder="Phone number" />
```

Server-side normalization + validation (never trust the client):

```ts
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

let phoneE164: string | null = null, country: string | null = null;
if (data.phone) {
  if (!isValidPhoneNumber(data.phone)) return { ok: false, error: "Enter a valid phone number." };
  const p = parsePhoneNumber(data.phone);
  phoneE164 = p.number;            // E.164
  country = p.country ?? null;     // ISO country
}
```

## 4. reCAPTCHA v3 — load + execute (client)

Invisible: no checkbox. Load the script once, then `execute` on submit to mint a
token tied to an `action`.

```tsx
"use client";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;
// once, high in the tree:
<Script src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`} strategy="afterInteractive" />

// in the submit handler, before calling the action:
const token: string = await new Promise((res) =>
  (window as any).grecaptcha.ready(() =>
    (window as any).grecaptcha.execute(SITE_KEY, { action: "submit" }).then(res)));
// send `token` along with the form fields to the Server Action
```

## 5. Server Action — verify + persist

`src/app/actions/submit-lead.ts`:

```ts
"use server";
import { db } from "@/db/client";
import { LeadSchema } from "@/lib/lead-schema";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

async function verifyRecaptcha(token: string, action: string) {
  const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY!, response: token }),
  });
  const d = await r.json();                       // { success, score, action, ... }
  if (!d.success || d.action !== action) return null;
  return d.score as number;                       // 0.0–1.0
}

export async function submitLead(input: unknown) {
  const parsed = LeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const data = parsed.data;
  if (data.company) return { ok: true };          // honeypot: drop silently

  const score = await verifyRecaptcha(data.token, "submit");
  if (score === null || score < 0.5) return { ok: false, error: "Could not verify you’re human." };

  let phoneE164: string | null = null, country: string | null = null;
  if (data.phone) {
    if (!isValidPhoneNumber(data.phone)) return { ok: false, error: "Enter a valid phone number." };
    const p = parsePhoneNumber(data.phone);
    phoneE164 = p.number; country = p.country ?? null;
  }

  await db.execute({
    sql: `INSERT INTO leads (name, email, phone_e164, phone_country, message, source, recaptcha_score)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [data.name, data.email || null, phoneE164, country, data.message || null, "lead-modal", score],
  });
  return { ok: true };
}
```

Tune the score threshold (`0.5` is a sane start; lower = more lenient). Keep the
`action` name identical on client and server, or verification fails.

## 6. The required disclosure (when the badge is hidden)

Hiding the v3 badge is allowed **only if** you show Google's branding in the
flow. Hide it in `globals.css`:

```css
.grecaptcha-badge { visibility: hidden; }
```

…and place this **next to the submit button** (mandatory, with both links):

```tsx
<p className="text-xs text-mist">
  This site is protected by reCAPTCHA and the Google{" "}
  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a> and{" "}
  <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Terms of Service</a> apply.
</p>
```

If the user opts to keep the visible badge, this text is optional — but harmless
to keep.

## Security & correctness rules

- **Server validation is authoritative** — re-validate everything in the Server
  Action; client validation is only UX.
- **Secret key is server-only.** Only the site key is `NEXT_PUBLIC_`.
- **Parameterized SQL only** (`{ sql, args }`) — never interpolate input.
- **Verify reCAPTCHA `success`, `action`, AND `score`** — checking only `success`
  defeats the point (v3 always "succeeds"; the score is the signal).
- **Honeypot + score** together; add IP rate-limiting if abuse appears.
- Store phone as **E.164**; keep the ISO country separately.
- Don't log full submissions with PII in production.

## Checklist

- [ ] `leads` migration applied to the **cloud** Turso DB
- [ ] `zod` + `libphonenumber-js` + phone input installed
- [ ] Site key `NEXT_PUBLIC_`, secret key server-only, both in gitignored env
- [ ] Phone validated + normalized to E.164 server-side
- [ ] reCAPTCHA token minted client-side; server verifies success+action+score
- [ ] Badge hidden → disclosure text with both Google links by the submit button
- [ ] Server Action: schema-validated, honeypot, parameterized insert
- [ ] `npm run build` clean; submit a test → row lands in Turso with a score
