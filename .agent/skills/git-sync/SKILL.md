---
name: git-sync
description: Commit and sync work to the remote (GitLab/GitHub) safely. Handles one-time personal-access-token setup, pre-push checks (build, lint, tests if present), concise commits, pull-rebase, and pushing to main. Use whenever the user wants to push, pull, commit, sync, or save work to the remote — and proactively offer to push after any significant change.
---

# Git sync

Commit + push/pull workflow tuned to this user: they push often, target **main**
directly, want **short commit messages**, and want to be **asked to push after
every significant change**. Always build/lint before pushing.

> Remote in this project is **GitLab**
> (`gitlab.com/talrop/...`). GitLab uses `oauth2` as the credential username with
> the PAT as the password. For a GitHub project, swap the host and use the PAT as
> password with any username. Detect the host with `git remote get-url origin`.

## ⛔ One-time setup gate — authentication (do this before the first push)

The goal: `git push` works non-interactively without ever printing the token or
committing it. Pick ONE method. **Never paste the PAT into chat if avoidable** —
it would land in the transcript. Prefer having the user run the store command
themselves (via the `!` prefix) or populate a gitignored file directly.

Before setting up, confirm with the user:
1. Which host (GitLab here) and which account.
2. They have created a **fine-grained / scoped PAT** with `write_repository`
   (GitLab) or `repo`→contents read/write (GitHub) scope, and an **expiry set**.
3. Which storage method below they want.

### Method A — macOS Keychain (recommended: encrypted, non-interactive)

User runs this themselves so the token never enters the transcript:
```bash
git config --global credential.helper osxkeychain
printf "protocol=https\nhost=gitlab.com\nusername=oauth2\npassword=PASTE_PAT_HERE\n" \
  | git credential-osxkeychain store
```
After this, `git push` just works. Token lives encrypted in Keychain.

### Method B — gitignored env file (the "PAT in a file" approach)

`.env` and `.env.*` and `*.local` are already gitignored in this repo, so a PAT
file is safe **as long as it stays gitignored**. Store it OUTSIDE the repo when
possible (`~/.config/tourify/.env`) to remove any chance of committing it.
```bash
# ~/.config/tourify/.env   (chmod 600)
GIT_PAT=xxxxxxxxxxxxxxxxxxxx
```
Then configure git's plaintext store once (token cached in `~/.git-credentials`,
chmod 600, outside the repo):
```bash
git config --global credential.helper store
printf "https://oauth2:%s@gitlab.com\n" "$GIT_PAT" >> ~/.git-credentials
```

### Setup safety rules (never violate)
- The token file MUST be gitignored or outside the repo. Verify before writing:
  `git check-ignore <file>` should echo the path. If it doesn't, add it to
  `.gitignore` FIRST.
- Never `echo`/print the token in command output or commit messages.
- Never embed the token in the repo's `.git/config` or a tracked file.
- Recommend a fine-grained PAT with minimal scope and an expiry date.
- If a token is ever exposed (printed, committed), tell the user to **revoke it
  immediately** on the host and issue a new one.

## The push workflow (the loop)

Run this whenever the user confirms a push (or you proactively ask and they say
yes):

1. **Review what changed** — `git status` then `git diff` (and `git diff
   --staged`). Understand the change before committing; don't commit blindly.
2. **Secret scan** — eyeball the diff for tokens, API keys, `.env` contents,
   passwords. If anything sensitive is staged, STOP and tell the user.
3. **Pre-push checks** (see below) — build + lint must pass.
4. **Stage** — `git add -A` is fine here (user wants everything pushed), but only
   after the secret scan and after confirming no junk/large files slipped in that
   aren't gitignored.
5. **Commit** — concise message (format below).
6. **Sync** — `git pull --rebase origin main` to avoid non-fast-forward
   rejections. If it conflicts, STOP and surface the conflict (never auto-resolve
   silently; never `--force`).
7. **Push** — `git push origin main`. On first push of a branch, add `-u`.
8. Report the result (commit hash + one-line summary).

## Pre-push checks (always, before every push)

- **Build:** `npm run build` — must succeed. If it fails, STOP, report the
  error, fix or ask; do not push a broken build.
- **Lint:** `npm run lint` — must pass clean.
- **Tests:** run `npm test` (or the project's test script) **only if a test
  script exists** in `package.json`. This project has none, so skip — don't
  invent or scaffold tests just to run them.
- **Typecheck:** if there's a `typecheck`/`tsc --noEmit` script, run it; Next's
  build already typechecks, so it's usually covered by the build step.

If any check fails: do not push. Report the failure plainly and offer to fix.

## Commit message format

Short and factual — the main thing done, no extended body/description.

- One concise subject line, imperative or noun phrase.
- Match the repo's existing **conventional-commit** style (history uses
  `feat:` / `fix:`): `feat: <thing>`, `fix: <thing>`, `chore: <thing>`,
  `refactor: <thing>`, `docs: <thing>`.
- Keep it under ~70 chars. No "what/why" paragraphs.
- Append the required co-author trailer (a trailer, not a description):

```
feat: premium bento grid for the glimpses section

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

If a single commit spans several unrelated things, prefer splitting into
focused commits over one vague message.

## Proactive "ask to push" behavior

After completing a **significant change**, proactively ask:
*"Want me to push this to main?"* — don't push without a yes.

A significant change = a finished feature/section, a bug fix, a refactor that
builds clean, or a meaningful content/asset update. NOT significant: half-done
edits, experiments, or anything that doesn't build. Don't nag after every tiny
edit — ask at natural stopping points.

This standing "ask after significant changes" instruction is the user's durable
authorization to *offer*; the actual push still needs their confirmation each
time.

## Pull / sync

- *"pull"* / *"get latest"* → `git pull --rebase origin main`.
- Before starting new work, pull first to reduce conflicts.
- On conflict: show the conflicted files, explain, and let the user decide. Never
  `git checkout --theirs/--ours` or `reset --hard` without explicit confirmation.

## Hard safety rules

- **Never** `git push --force` / `--force-with-lease` to main without explicit,
  per-instance confirmation.
- **Never** `git reset --hard`, `git clean -fd`, branch deletion, or history
  rewrite without confirming first — these destroy work.
- **Never** commit secrets, `node_modules/`, `.next/`, `.env*`, or large unneeded
  binaries. If something large/sensitive isn't ignored, fix `.gitignore` first.
- If `git status` shows nothing to commit, say so — don't create empty commits.
- The user wants main directly; honor that. (For higher-risk/shared work, you may
  *offer* a feature-branch + merge-request flow, but don't force it.)

## Quick checklist before any push

- [ ] Reviewed `git diff`; no secrets/junk staged
- [ ] `npm run build` passes
- [ ] `npm run lint` passes (tests too, if a test script exists)
- [ ] Concise conventional commit message + co-author trailer
- [ ] `git pull --rebase origin main` clean (conflicts surfaced if not)
- [ ] `git push origin main`, result reported
