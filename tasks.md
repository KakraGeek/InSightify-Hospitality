#git config user.name "Your Name" InSightify – Hospitality
## Single-Agent Implementation Tasks (Notify → Approve → Proceed)

This checklist mirrors `smart-prompts/agent.md` so the single agent can work linearly.
Each item should ship as a small PR-sized change with code, tests, and docs.

---
## 0) Repo Bootstrap
- [x] 0.1 Baseline configs & scripts
  - [x] Create `package.json` scripts: dev, build, lint, format, test, e2e, db:generate, db:migrate
  - [x] Add `tsconfig.json`, `next.config.ts`, `postcss.config.js`, `tailwind.config.ts`
  - [x] Add `.eslintrc` and `.prettierrc`
  - [x] Add `.env.example` (NEXTAUTH_SECRET, NEXTAUTH_URL, DATABASE_URL, NEXT_PUBLIC_APP_NAME)
  - [ ] Add smoke tests: Vitest util test; Playwright “home loads”
- [x] 0.2 Base UI shell & theme
  - [x] Implement `/app/layout.tsx`, `/app/(public)/page.tsx`
  - [ ] Install and set up Tailwind + ShadCN + lucide-react (Tailwind + lucide-react done; ShadCN pending)
  - [x] Build `components/layout/AppShell.tsx` (header/sidebar), accessibility roles/landmarks
  - [ ] Dark/light toggle and Playwright checks for nav landmarks

---
## 1) AuthN/AuthZ & DB Wiring
- [x] 1.1 Database init (Neon + Drizzle)
  - [x] Add `drizzle.config.ts`, `lib/db.ts`, `db/schema/*`
  - [x] Tables: `users`, `sessions`, `accounts`, `roles`, `user_roles`
  - [x] First migration runnable; seed script for demo admin
- [x] 1.2 NextAuth.js
  - [x] `app/api/auth/[...nextauth]/route.ts` with credentials provider
  - [x] Password hashing (bcrypt in seed; argon2 optional later)
  - [x] Session strategy: JWT; role lookups (callbacks attach roles)
  - [x] Middleware-based role checks (`middleware.ts`, `lib/auth/permissions.ts`)
- [x] 1.3 RBAC
  - [x] Roles: `admin`, `analyst`, `viewer` (only `admin` seeded)
  - [x] `lib/auth/guard.ts` to gate server components and API routes
  - [x] Vitest tests for guards; Playwright negative tests for forbidden routes

---
## 2) Data Ingestion (CSV/PDF) & Validation
- [ ] 2.1 CSV ingestion
  - [ ] `app/api/ingest/csv/route.ts` streaming parse + Zod validation per department
  - [ ] Session-scoped transient storage; no raw dataset persistence post-logout
  - [ ] Structured validation report (counts, bad rows)
- [ ] 2.2 PDF ingestion helpers
  - [ ] `lib/ingest/pdf.ts` with pluggable extractor
  - [ ] `lib/ingest/source.ts` abstraction for CSV/PDF
- [ ] 2.3 Sample data & schemas
  - [ ] `schemas/*` Zod models per department
  - [ ] `data/samples/*` realistic CSVs for all departments
  - [ ] Tests: Vitest schema tests; Playwright upload flows (happy / error)

---
## 3) KPI Engine & Aggregations
- [ ] 3.1 KPI definitions
  - [ ] `kpi/definitions/*.ts` per department with formulae/inputs/units/edge cases
- [ ] 3.2 Aggregation services
  - [ ] `kpi/engine.ts` compute KPIs; time-bucketing + filters
- [ ] 3.3 Persistence rule
  - [ ] Tables: `reports`, `report_items`, `report_shares?`
  - [ ] Migrations + demo seeds
  - [ ] Only persist derived **reports**; not transient raw datasets
- [ ] 3.4 Tests
  - [ ] Vitest math edge-cases; golden file comparisons

---
## 4) Reporting UI & Exports
- [ ] 4.1 Dashboards
  - [ ] `/app/(app)/dashboard/page.tsx` with department tabs and KPI cards (basic dashboard done at `/app/dashboard`)
  - [x] Components: `components/kpi/KpiCard.tsx`, `components/kpi/KpiGrid.tsx`
  - [ ] Recharts visuals; filters for date/property/department
- [ ] 4.2 Report builder
  - [ ] `/app/(app)/reports/new/page.tsx` build → preview → save
  - [ ] API: `app/api/reports/route.ts` (POST/GET/PATCH/DELETE)
  - [ ] Guard: `analyst`+ to create; `viewer` can view assigned
- [ ] 4.3 Export
  - [ ] `lib/export/pdf.ts` (puppeteer-core, Vercel-safe approach)
  - [ ] `lib/export/csv.ts` for table datasets
  - [ ] Playwright export flows

---
## 5) Admin & Settings
- [x] 5.1 Admin area
  - [x] `/app/(app)/admin/users` CRUD (admin only)
  - [x] `/app/(app)/admin/roles` basic role management
  - [x] Tests: role checks; 403s
- [x] 5.2 App settings
  - [x] `/app/(app)/settings` for profile, brand, retention switches
  - [x] Persist only settings and report metadata

---
## 6) Observability, Performance, Security
- [ ] 6.1 Logging & error boundaries
  - [ ] `lib/log.ts` with request ids; React error boundary
- [ ] 6.2 Performance
  - [ ] Caching where safe; memoization; lazy-loaded heavy components
  - [ ] Lighthouse budget: CLS < 0.1, LCP < 2.5s (lab)
- [ ] 6.3 Security hardening
  - [ ] Secure headers via Next/middleware; rate-limit auth endpoints
  - [ ] Input validation everywhere; file-type sniffing on uploads
  - [ ] Simple anomaly detection hooks

---
## 7) QA & Release
- [ ] 7.1 Test matrix
  - [ ] Unit/integration: KPI math, schemas, RBAC, report CRUD
  - [ ] E2E happy paths: login → ingest → compute → save report → export
  - [ ] E2E edge cases: invalid rows, oversized files, forbidden routes, session expiry
- [ ] 7.2 Docs & deployment
  - [ ] Update `README.md` (setup, envs, scripts, deploy)
  - [ ] `DEPLOYMENT_CHECKLIST.md`
  - [ ] `SECURITY_NOTES.md` (threat model + mitigations)

---
## Scripts (expected)
- [ ] `pnpm dev`
- [ ] `pnpm build`
- [ ] `pnpm lint` / `pnpm format`
- [ ] `pnpm test` (Vitest) / `pnpm e2e` (Playwright)
- [ ] `pnpm db:generate` / `pnpm db:migrate`

