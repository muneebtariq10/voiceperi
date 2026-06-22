# VoicePeri — Project Memory

> **Purpose:** Single source of truth for any AI assistant (or developer) picking up this project cold. Keep this file updated after major changes, git operations, and milestones. Append to logs — do not delete history.
>
> **Last updated:** 2026-06-22 (initial creation)

---

## 1. Project Overview

**VoicePeri** is a SaaS platform for businesses to create and manage **AI voice agents** that answer phone calls, qualify leads, and book appointments. It combines:

- A **NestJS backend** (`/backend`) — REST API, Postgres via TypeORM, auth, billing, and third-party integrations.
- A **React + Vite frontend** (`/frontend`) — marketing site + authenticated dashboard for managing voice agents, call history, billing, and integrations.

Core product loop:
1. User signs up, fills in **business information** (name, address, hours, services — via Google Places autocomplete).
2. User creates a **voice Agent** (language, voice, phone numbers, blocked numbers, escalation emails).
3. Agent is provisioned on **Retell AI** (LLM + voice agent), which handles live phone calls.
4. Retell sends a webhook (`call_analyzed`) back to the backend → call summary/sentiment/lead info emailed to the business and stored in **call history**.
5. Billing/subscriptions are handled via **Stripe** (plans, pricing tiers, checkout, webhooks, billing history).
6. Admins can manage payment plans, users, view call logs, edit agent prompts, and **impersonate users** for support.

## 2. Tech Stack

### Backend (`/backend`)
- **Framework:** NestJS 11 (TypeScript), Express platform
- **DB/ORM:** PostgreSQL + TypeORM (`synchronize: true` — dev-only auto schema sync, see [Bugs](#8-bugs--known-issues))
- **Auth:** Passport.js — JWT strategy (`@nestjs/jwt`), Local strategy (email/password), Google OAuth2 strategy
- **Payments:** Stripe (`stripe` SDK) — products, prices, checkout sessions, webhooks
- **Email:** `@nestjs-modules/mailer` + nodemailer (handlebars/ejs/pug templates supported)
- **Voice AI:** Retell AI (external API) — LLM + voice agent provisioning, webhook receiver
- **Other integrations:** Google Places API (autocomplete), Cal.com (appointment booking event sync), ElevenLabs (voice, env vars present)
- **Validation:** class-validator / class-transformer, global `ValidationPipe`
- **Package manager:** pnpm (has `pnpm-lock.yaml`) — also has `package-lock.json`, see [Known Issues](#8-bugs--known-issues)
- **Tooling:** ESLint 9, Prettier, Jest (unit + e2e), SWC

### Frontend (`/frontend`)
- **Framework:** React 19 + Vite 6, TypeScript
- **Routing:** react-router-dom v7
- **UI:** Radix UI primitives + shadcn-style components (`components.json`), Tailwind CSS v4, MUI (`@mui/material`), Lucide/Tabler icons, Framer Motion
- **Forms:** react-hook-form + zod + @hookform/resolvers
- **Tables/Charts:** @tanstack/react-table, recharts
- **Drag & drop:** @dnd-kit
- **Payments:** @stripe/stripe-js
- **Auth client:** jwt-decode, token stored in `localStorage`/`sessionStorage`
- **Misc:** react-phone-number-input / react-international-phone (phone input), react-timezone-select, file-saver/jszip (export), sonner (toasts)

## 3. File Structure

```
voiceperi/
├── backend/                      NestJS API
│   └── src/
│       ├── agents/               Voice agent CRUD + Retell AI provisioning + Google Places lookup
│       ├── auth/                 JWT/Local/Google strategies, guards, impersonation
│       ├── billing_history/      Stripe billing record persistence
│       ├── businessinfos/        Business profile (address, hours, services)
│       ├── callhistory/          Call records (synced from Retell)
│       ├── email/                Transactional email (password reset, call notifications)
│       ├── entities/             TypeORM entities (see §10 Data Model)
│       ├── integrations/         Cal.com event-type sync → injected into Retell LLM tools
│       ├── logs_call_history/    Ingestion job logs (status/records_loaded/errors)
│       ├── payment_plan_pricing/ Pricing tiers per plan (interval, discount, Stripe price id)
│       ├── payment_plans/        Plans + Stripe product/price provisioning
│       ├── places/                Google Places autocomplete proxy (public)
│       ├── retel-webhook/        Receives Retell `call_analyzed` events → email + persistence
│       ├── sql/                  ⚠️ Raw SQL runner endpoint — see Known Issues (critical)
│       ├── users/                User CRUD, roles
│       ├── webhooks/             Stripe webhook controller (checkout.session.completed, etc.)
│       ├── app.module.ts         Root module — wires all feature modules + global JWT guard
│       └── main.ts               Bootstrap: CORS, global prefix `/api`, static `/uploads`, raw body for `/api/webhook`
│
├── frontend/                     React dashboard + marketing site
│   └── src/
│       ├── auth/                 Login, SignUp, Forgot/Reset password, Email verification pages
│       ├── components/           Shared UI (DataTable, charts, sidebar, route guards, PromptEditor, etc.)
│       │   ├── PrivateRoute / PublicRoute / RestrictedRoutes / AdminRoutes / userRoutes — route-guard components
│       │   └── ui/                shadcn-style primitives
│       ├── dashboard/             Authenticated pages: Overview, voiceAgent, callHistory, Integrations, Settings, Users, Plans, Feedback, helpCenter, getStarted
│       ├── pages/                 Public pages: Home, PaymentSuccess
│       ├── AppContext.tsx        Global user context — decodes JWT, fetches `/api/users/:id`
│       └── App.tsx               Route tree (see §11 Routing)
│
├── .gitignore                    Root-level (Node/general)
├── memory.md                     ← this file
└── .git-rewrite/                 ⚠️ Leftover from a local git history rewrite — see Git section
```

## 4. Environment Variables

No `.env` files are committed (correctly gitignored). Below is every variable referenced in code — **these must be supplied locally/in deployment** (likely via `backend/.env`, not present in repo):

| Variable | Used for |
|---|---|
| `PORT` | Backend listen port (defaults if unset) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Postgres connection (TypeORM) |
| `FRONTEND_URL` | Used in password-reset emails, impersonation redirect URL |
| `STRIPE_SECRET_KEY` | Stripe SDK init (throws at boot if missing) |
| `STRIPE_API_VERSION` | Stripe SDK version pin |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures |
| `RETELL_AI_API_URL`, `RETELL_AI_API_KEY` | Retell LLM/agent provisioning + tool updates (integrations module) |
| `RETELL_API_KEY`, `RETELL_WEBHOOK_URL` | Retell webhook config (agents module) |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_API_URL` | Voice provider (ElevenLabs) — referenced but check if still active |
| `GOOGLE_PLACES_API_KEY` | Google Places Autocomplete proxy |

Frontend (`frontend/.env`, Vite-prefixed):
| Variable | Used for |
|---|---|
| `VITE_API_BASE_URL` | Base URL for all API calls (`AppContext.tsx` and presumably an axios instance) |

CORS in `main.ts` currently hardcodes allowed origins: `http://localhost:5173`, `https://dev.voiceperi.com`. **Update this list when adding a production domain.**

## 5. Environment / Local Setup

```bash
# Backend
cd backend
pnpm install            # repo uses pnpm-lock.yaml (a package-lock.json also exists — see Known Issues)
# create backend/.env with DB_*, STRIPE_*, RETELL_*, GOOGLE_PLACES_API_KEY, FRONTEND_URL, PORT
pnpm run start:dev       # nest start --watch (default port 3000, prefix /api)

# Frontend
cd frontend
npm install              # uses package-lock.json
# create frontend/.env with VITE_API_BASE_URL=http://localhost:3000/
npm run dev               # Vite dev server on :5173
```

Notes:
- Backend serves static `public/` and `public/uploads/` at root and `/uploads`.
- `app.setGlobalPrefix('api')` — all backend routes are under `/api/*`.
- `/api/webhook` requires raw body (configured before global JSON parsing) for Stripe signature verification — do not add body-parsing middleware ahead of it.
- TypeORM `synchronize: true` means schema auto-migrates from entities on boot — **do not run this against production data without a migration plan** (see Known Issues).

## 6. Current Progress / Completed Tasks

Based on code maturity, the following appear **implemented and working**:
- Email/password auth + Google OAuth login, JWT sessions, password reset flow
- Admin impersonation of users (via `?token=&impersonating=true` URL params)
- Role-based route guarding (admin vs. user) on both frontend (`AdminRoutes`/`UserRoutes`/`RestrictedRoutes`) and backend (global `JwtAuthGuard` + `@Public()` opt-outs)
- Business information capture with Google Places autocomplete
- Voice agent CRUD, provisioning against Retell AI (LLM + agent), with multi-language support
- Retell webhook ingestion → email notification to business + agent on call completion, with custom Q&A variable extraction
- Stripe-based subscription plans: plan/pricing CRUD (admin), checkout, webhook-driven billing history, free-trial auto-enrollment (14-day) on signup
- Call history + call logs ingestion tracking (`logs_call_history` entity records job status/errors)
- Cal.com integration: fetch event types, save chosen event + API key, push `check_availability_cal` tool into the Retell LLM config
- Dashboard UI: Overview, Voice Agent settings, Call History, Integrations, Settings, Users (admin), Plans (admin), Prompt Editor (admin), Feedback, Help Center, Get Started

## 7. Pending Tasks (inferred — verify with stakeholders)

- `agents.service.ts` has a large **commented-out legacy implementation** of `createRetellAgent` (prompt templating via `businessInfo.json`) alongside what appears to be a newer/active implementation — needs cleanup/confirmation of which path is live.
- `retel-webhook.service.ts` has commented-out `custom_var_2..5` destructuring and unused `userEmails` logic — looks like an in-progress refactor of who receives call notification emails.
- `billing_history.service.ts` has a commented-out `invoice.paid` Stripe event handler — subscription renewal billing-history updates may be incomplete.
- No automated tests beyond NestJS default e2e scaffold (`backend/test/app.e2e-spec.ts`) — test coverage is effectively absent.
- `ELEVENLABS_*` env vars are referenced but no obvious service file was found wiring them into a controller/service in this scan — confirm if ElevenLabs is actually integrated or vestigial.
- Duplicate lockfiles in backend (`package-lock.json` AND `pnpm-lock.yaml`) — decide on one package manager.

## 8. Bugs / Known Issues

1. **CRITICAL — Unauthenticated arbitrary SQL execution endpoint.**
   [backend/src/sql/sql.controller.ts](backend/src/sql/sql.controller.ts) exposes `POST /api/sql/run` decorated `@Public()`, accepting a raw `query` string and executing it directly via `dataSource.query(query)` ([sql.service.ts](backend/src/sql/sql.service.ts)). The code even contains the comment `// OPTIONAL: Add auth check here`. **This is a full database compromise vector (SQL injection by design) and must be removed or locked behind a strong admin-only guard before any public deployment.** Flag this to the user/stakeholder immediately if not already known.
2. **`synchronize: true` in TypeORM config** ([app.module.ts](backend/src/app.module.ts)) — auto schema sync is fine for dev but dangerous for production (can drop/alter columns unexpectedly). Should be replaced with explicit migrations before production use.
3. Mixed package managers in `backend/` (both `pnpm-lock.yaml` and `package-lock.json` committed) — risk of dependency drift depending which is used to install.
4. ~~`.git-rewrite/` directory~~ — **removed 2026-06-22.** It was confirmed to be `git filter-branch`'s internal scratch/state directory (101 entries in `map/`, mapping pre-squash commit SHAs to rewritten ones), and — unlike a normal filter-branch run — it had been **accidentally committed into the repo** (tracked as part of `d6ed0b4` "Initial commit", not gitignored). It leaked metadata from the pre-squash history (original author `irfanmasood <irfanmasood.nexvistech@gmail.com>`, original per-feature commit messages) even though the visible `git log` shows only one anonymized commit. It served no purpose in the repo and has been deleted. See [Git Workflow](#13-git-workflow--sync-notes) changelog for the removal commit.
5. Several integration env vars (`RETELL_API_KEY` vs `RETELL_AI_API_KEY`, `RETELL_AI_API_URL` vs `RETELL_WEBHOOK_URL`) are similarly named but used in different modules — easy to misconfigure; consolidate naming if touching these modules.

## 9. Deployment Notes

- Known frontend deployment target referenced in code: **`https://dev.voiceperi.com`** (present in backend CORS allow-list) — implies a `dev` environment is live or planned.
- Backend listens on `0.0.0.0:$PORT` (defaults to 3000), Express-based, global prefix `/api`.
- Static file serving: `public/` (root) and `public/uploads/` (`/uploads`) — uploaded business/agent assets likely live here; ensure persistent storage/volume in deployment (not ephemeral container disk) if self-hosted.
- Stripe webhook endpoint: `POST /api/webhook` — must be registered in the Stripe dashboard pointing at the deployed backend, with `STRIPE_WEBHOOK_SECRET` matching.
- Retell AI webhook endpoint: handled by `RetelWebhookModule` — confirm the public URL is registered with Retell per-agent or globally (`RETELL_WEBHOOK_URL` env var suggests it's configurable).
- No Dockerfile, CI workflow, or IaC found in the scanned tree — deployment process is currently undocumented in-repo. If one exists outside this repo (e.g., a separate ops repo or PaaS dashboard config), document it here once known.

## 10. Important Business Logic

- **Data model relationships:** `User` 1—N `Agent`, `User` 1—N `BusinessInformation`, `User` 1—N `BillingHistory`; `Agent` N—1 `Language`; `PaymentPlan` 1—N `PaymentPlanPricing` 1—N `BillingHistory`.
- **Roles:** `Role.USER` / `Role.ADMIN` enum on `User` entity gates frontend route groups (`AdminRoutes`, `UserRoutes`, `RestrictedRoutes`) and presumably backend guards.
- **Free trial:** New Google-OAuth signups are auto-enrolled in a `"Free Trial"` payment plan with a monthly pricing tier, 14-day period, status `active` ([auth.service.ts](backend/src/auth/auth.service.ts)). Confirm whether email/password signups get the same treatment (not seen in this scan — verify in `auth.controller.ts` / `users.service.ts`).
- **Impersonation:** Admins generate a JWT with `impersonatedBy: admin.id` and redirect the browser to `${FRONTEND_URL}login?token=...&impersonating=true`; frontend stores this in `sessionStorage` (not `localStorage`) to scope it to the tab ([App.tsx](frontend/src/App.tsx)).
- **Call lifecycle:** Retell sends `call_analyzed` webhook → backend resolves `Agent` by `retell_agent` id → resolves owning `User`/`BusinessInformation` → extracts custom Q&A vars + sentiment/summary → emails configured `agent.emails` (business-side notification) → (call also persisted to `call_history`/`callhistory` module, separately from logs).
- **Plan pricing/discounts:** `PaymentPlanPricing.discount_type` (`percentage` | `value`) is applied before creating the Stripe `Price` (`applyDiscount` in [payment_plans.service.ts](backend/src/payment_plans/payment_plans.service.ts)) — i.e., **Stripe prices are pre-discounted**, not discounted at checkout time.
- **Cal.com booking tool injection:** Saving a Cal.com event (`IntegrationService.saveEvent`) PATCHes the user's Retell LLM (`agentInfo.llm_id`) to add a `check_availability_cal` tool using the Cal API key + event type id — meaning the **voice agent's booking capability is dynamically reconfigured via Retell's API**, not redeployed.

## 11. Frontend Routing Map (`App.tsx`)

```
/                         Home (public marketing)
/login /email /forgot-password /new-password /password-reset /signup   (PublicRoute)
/success                 PaymentSuccess (public)
/dashboard                (PrivateRoute > RestrictedRoute)
  ''                      Overview
  settings                Settings
  integrations, voiceAgent          (UserRoute-gated)
  logsHistory, Prompt, users, plans, create-plan, create-plan/:id   (AdminRoute-gated)
  callHistory, getStarted, helpCenter, feedback   (any authenticated)
  unauthorized            shown when role check fails
```

## 12. Git Status & Recent Changes

**Snapshot as of 2026-06-22:**
- Current branch: `main` (tracking `origin/main`, up to date)
- Working tree: clean, no uncommitted changes
- Remote: `origin` → `https://github.com/MusawarAhmed/voiceperi.git`
- Full commit log: **only one commit exists** —
  ```
  d6ed0b4 Initial commit
  ```
- Branches: only `main` locally and on remote (`remotes/origin/main`, `remotes/origin/HEAD -> origin/main`)

### Changelog (append new entries below — do not delete prior entries)

| Date | Event | Notes |
|---|---|---|
| 2026-06-22 | Repo scanned, `memory.md` created | Single squashed "Initial commit" found; `.git-rewrite/` leftover present; working tree clean; no pending PRs/branches observed locally. |
| 2026-06-22 | Inspected `.git-rewrite/` contents | Confirmed it was **tracked** (not gitignored/untracked as first assumed) — it's `git filter-branch`'s scratch directory, accidentally committed. `map/` has 101 old→new commit SHA mappings, revealing the pre-squash history had 101+ commits by author `irfanmasood <irfanmasood.nexvistech@gmail.com>` with normal per-feature messages (e.g. "home page resposive changes price section"). |
| 2026-06-22 | Removed `.git-rewrite/` from the repo | `git rm -r .git-rewrite` + commit, per user approval. It served no purpose tracked in version control and leaked pre-squash author/commit metadata. |

## 13. Git Workflow & Sync Notes

- **Remote:** single remote `origin` → `github.com/MusawarAhmed/voiceperi.git` (fetch + push).
- **Branch strategy:** Currently only `main` exists locally and remotely — no observed feature-branch convention yet. Until a convention is established, prefer creating short-lived feature branches off `main` for any non-trivial change rather than committing directly to `main`.
- **History anomaly:** The presence of `.git-rewrite/` (a working directory left behind by tools like `git filter-branch`) alongside a `.git/` log containing only one commit strongly suggests **this repository's history was deliberately squashed/rewritten** before being pushed as "Initial commit". Treat this single commit as the effective baseline — do not assume older history is recoverable from `.git-rewrite/` without explicit need (it is a fragile, untracked directory; ask the user before deleting or relying on it).
- **Safe pull / sync procedure:**
  ```bash
  git status                       # check for local changes first
  git fetch origin
  git log --oneline -20            # review incoming commits before merging
  git diff main origin/main        # preview what would change
  git pull --ff-only origin main   # safe: fails loudly instead of creating a merge commit if diverged
  ```
  If `--ff-only` fails (local and remote have diverged):
  ```bash
  git fetch origin
  git rebase origin/main           # preferred for a linear history on a single-branch repo
  # resolve conflicts, then: git rebase --continue
  # only use `git merge origin/main` if rebase is inappropriate (e.g., shared/published branch with other collaborators already based on it)
  ```
- **Merge vs. rebase convention:** Given the single-branch, squashed-history nature of this repo so far, prefer **rebase** for local branch updates to keep history linear. Use **merge** only for integrating long-lived feature branches into `main` once a branching convention is adopted.
- **Conflict-prone files (anticipated, not yet observed):** `backend/src/app.module.ts` (module registration churn as features are added), `frontend/src/App.tsx` (route table), `backend/package.json` / `pnpm-lock.yaml` vs `package-lock.json` (dependency lockfile drift — see Known Issues #3), and entity files under `backend/src/entities/` if multiple people add columns concurrently (TypeORM `synchronize: true` makes schema drift between branches risky — see Known Issues #2).
- **Before pushing:** run `pnpm run lint` / `npm run lint` in the relevant package, and `pnpm run test` in `backend/` if tests are added/modified.
- **Do not** force-push to `main`, and do not delete `.git-rewrite/` or rewrite history again without explicit user confirmation — it may be evidence of a recent, intentional cleanup the user is mid-way through.

## 14. AI Notes for Future Sessions

- This is a **two-package monorepo** (`backend/`, `frontend/`) with **no root-level package.json** — always `cd` into the relevant package before running install/build/test commands.
- The backend's `synchronize: true` TypeORM setting means **editing an entity file changes the live DB schema on next boot** — be cautious suggesting entity changes without flagging this to the user.
- **Flag the `/api/sql/run` endpoint (Known Issues #1) prominently in any security-related conversation** — it is the single highest-risk item in this codebase as scanned.
- No `.env` files are present in the working tree (correctly gitignored) — when debugging "missing config" issues, the answer is almost always an absent local `.env`, not a code bug. Required variable names are listed in §4.
- Business/voice-agent domain logic is split: **Retell AI** = call handling/LLM, **Cal.com** = scheduling, **Stripe** = billing, **Google Places** = address autocomplete, **ElevenLabs** = referenced but unconfirmed integration depth — confirm before assuming it's wired up.
- When asked to "update memory.md", **append/edit, never wipe** — especially §12 Changelog and §6/§7 progress lists, which are meant to accumulate across sessions.
- Only one commit exists in git history (history was squashed). Do not assume `git log` archaeology will reveal "why" something was built a certain way — rely on code comments and this file instead.
