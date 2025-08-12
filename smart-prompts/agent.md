# InSightify – Hospitality • Single-Agent Development Prompt (Task-Driven)

You are the **sole development agent** for this repository. Operate in tight **notify → approve → proceed** loops.
Produce complete, production-ready work. No placeholders. Ship small, atomic PR-sized changes with tests and docs.

---
## Project Scope (authoritative)
- **Type**: Data storytelling & KPI analytics app for hospitality (Ghana-focused, but generalizable).
- **Stack (default)**: Next.js (App Router) + TypeScript • Tailwind CSS • ShadCN UI • lucide-react • Recharts
  • Neon PostgreSQL • Drizzle ORM • NextAuth.js • Vercel. Testing: Vitest + Playwright (via MCP).
- **Data policy**: Datasets are **not** persisted after logout; **reports/exports** are persisted.
- **Departments & KPIs**: Front Office, F&B, Housekeeping, Maintenance/Engineering, Sales & Marketing, Finance, HR.
- **File anchors**:
  - Rules: `.cursor/rules.json`
  - Context: `.cursor/context.json`
  - MCP: `mcp/project.mcp.yaml`
  - Tasks index: `tasks.md` (kept in sync with this prompt)
  - Trigger: `TRIGGER_PROMPT_SINGLE_AGENT.md`

---
## Global Constraints & Definition of Done (DoD)
- OWASP Top 10 mitigations: input validation (Zod), authN/authZ, rate limiting, CSRF where applicable, SSRF guards,
  safe secrets via env, detailed server logs without PII leakage.
- All new code is TypeScript-checked, ESLint/Prettier clean.
- Each change includes: code, tests (Vitest/Playwright), docs (README section or feature doc), and run/verify steps.
- DB changes are migration-safe (Drizzle migrations) and idempotent seed scripts if seeds are necessary.
- Accessibility: proper labels/roles, keyboard nav for interactive components.
- No network calls in tests unless mocked. No secrets committed. Provide `.env.example` updates as needed.

---
## Development Roadmap (authoritative implementation tasks)
Follow the numbered order unless user reprioritizes. Before implementing a step, **Notify** with a concise plan and file list.
After approval, **Proceed**, then **Report** with diffs summary and verification steps.

### 0) Repo Bootstrap
0.1 Create baseline configs and scripts
    - Files:
      - `package.json` (scripts for dev/build/test/lint/format/e2e)
      - `tsconfig.json`, `next.config.ts`, `postcss.config.js`, `tailwind.config.ts`
      - `.eslintrc.cjs`, `.prettierrc`
      - `.env.example` (NEXTAUTH_SECRET, NEXTAUTH_URL, DATABASE_URL, NEXT_PUBLIC_APP_NAME)
    - Output: runnable `pnpm dev` with “Hello InSightify” page and Tailwind working.
    - Tests: a smoke test (Vitest) for a trivial util and a Playwright “home loads” test.

0.2 Base UI shell + theme
    - Implement `/app/layout.tsx`, `/app/(public)/page.tsx`, header/sidebar shell, light/dark toggle, brand colors,
      ShadCN installed with a base theme, lucide icons.
    - Add `components/ui` exports (button, input, card) and `components/layout/AppShell.tsx`.
    - Tests: Playwright checks for nav landmarks; accessibility roles exist.

### 1) AuthN/AuthZ & DB Wiring
1.1 Database init (Neon + Drizzle)
    - Add `drizzle.config.ts`, `lib/db.ts`, `migrations/` dir.
    - Tables (initial): `users`, `sessions`, `accounts`, `roles`, `user_roles`.
    - Run first migration; add seed script for a demo admin user.

1.2 NextAuth.js (Credentials + OAuth-ready hooks)
    - `app/api/auth/[...nextauth]/route.ts` with credential provider (email + password) and OAuth scaffolding commented.
    - Password hashing with `bcrypt` or `argon2`. Session strategy: JWT with DB lookups for roles.
    - Middleware-based role checks: `middleware.ts` + `lib/auth/permissions.ts`

1.3 RBAC
    - Roles: `admin`, `analyst`, `viewer` (extensible).
    - Gate: Server components and API routes verify session + role in a shared guard (`lib/auth/guard.ts`).

### 2) Data Ingestion (CSV/PDF) & Validation
2.1 CSV ingestion pipeline
    - `app/api/ingest/csv/route.ts`: Upload, parse (streaming), validate with Zod schemas per department.
    - Store parsed rows transiently (session-scoped cache or signed storage), do **not** persist raw datasets post-logout.
    - Errors captured with row-level diagnostics; return a structured validation report (counts, bad rows).

2.2 PDF ingestion helpers
    - `lib/ingest/pdf.ts`: use `pdf-parse` or similar (pluggable) with department-aware extractors.
    - Provide an abstraction `lib/ingest/source.ts` to unify CSV/PDF ingestion contracts.

2.3 Sample data & schemas
    - `schemas/` directory with Zod models per department: FrontOfficeSchema, FBRevenueSchema, etc.
    - `data/samples/` with realistic CSVs for all departments for local testing.
    - Tests: Vitest schema tests; Playwright upload flows (happy-path + validation errors).

### 3) KPI Engine & Aggregations
3.1 KPI definitions
    - `kpi/definitions/*.ts` per department; include formulae, inputs, units, and edge-case notes.
    - Example KPIs: ADR, RevPAR, Occupancy, GOPPAR (Finance), Table Turnover (F&B), Room Turnaround Time (HK), MTTR/MTBF (Maintenance), Sales Pipeline Velocity (S&M), Training Hours per FTE (HR).

3.2 Aggregation services
    - `kpi/engine.ts`: computes KPIs from validated datasets; returns typed results and warnings.
    - Include time-bucketing (day/week/month) and filters (property, department).

3.3 Persistence rule
    - Persist only derived **reports** and their metadata (owner id, createdAt, filters); never persist transient raw datasets after session ends.
    - Tables: `reports`, `report_items`, optional `report_shares`.
    - Migrations + seeds for demo reports.

3.4 Tests
    - Vitest unit tests for engine math with edge cases (zeros, nulls, outliers).
    - Golden file comparisons for sample datasets.

### 4) Reporting UI & Exports
4.1 Dashboards
    - `/app/(app)/dashboard/page.tsx` with department tabs, Recharts visualizations, KPI cards, filters.
    - Components: `components/kpi/KpiCard.tsx`, `components/kpi/KpiGrid.tsx` (responsive, accessible).

4.2 Report builder
    - `/app/(app)/reports/new/page.tsx` to pick department(s), timeframe, KPIs, and filters; preview then **Save Report**.
    - API: `app/api/reports/route.ts` (POST create, GET list, PATCH update, DELETE).
    - Guard: role `analyst`+ to create, `viewer` can view assigned.

4.3 Export
    - PDF export (server-side): `lib/export/pdf.ts` using puppeteer-core on Vercel-compatible approach; fallback to HTML-to-PDF service adapter (disabled by default).
    - CSV export: `lib/export/csv.ts` for table datasets.
    - Tests: Playwright export flows; file downloads asserted via temp dir.

### 5) Admin & Settings
5.1 Admin area
    - `/app/(app)/admin/users` CRUD (admin role); invite flow (email template placeholder text only—no SMTP creds).
    - `/app/(app)/admin/roles` simple role management UI.
    - Tests: Playwright role checks and negative tests (403s).

5.2 App settings
    - `/app/(app)/settings` for profile, org brand (logo upload, color accent), and data retention switches.
    - Persist only settings and report metadata—not source datasets.

### 6) Observability, Perf, Security
6.1 Logging & error boundaries
    - `lib/log.ts` minimal console transport now; structure logs with request ids.
    - React error boundary and server error responses with user-safe messages.

6.2 Performance
    - Route-level caching where safe; memoized selectors; lazy-loaded heavy components.
    - Lighthouse budget: CLS < 0.1, LCP < 2.5s (lab).

6.3 Security hardening
    - Helmet-like headers via Next config/middleware; rate limit auth endpoints; validate all inputs; file-type sniffing on uploads.
    - Add simple anomaly detection hooks (suspicious upload patterns).

### 7) QA & Release
7.1 Test matrix
    - Unit/integration: KPI math, schema validation, RBAC guards, report CRUD.
    - E2E happy-paths: login, ingest CSV, compute KPIs, save report, export PDF/CSV.
    - E2E edge: invalid rows, oversized files, forbidden routes, session expiry.

7.2 Docs & deployment
    - Update `README.md` with setup, envs, scripts, test usage, and Vercel deploy steps.
    - Provide `DEPLOYMENT_CHECKLIST.md` (envs, DB migrate, health checks).
    - Create `SECURITY_NOTES.md` (threat model summary + mitigations mapping).

---
## Implementation Playbooks (how-to cheatsheets)

### Auth Quickstart
1. Create `lib/auth/options.ts` with providers and callbacks; export `auth()` helper.
2. Add `middleware.ts` gate with matcher for `/app/(app)/*`.
3. Server utils: `getCurrentUser()`, `requireRole(role)`. Tests cover positive/negative paths.

### Drizzle + Neon
1. `lib/db.ts` connection; schema under `db/schema/*.ts` with enums and relations.
2. Migrations via `drizzle-kit`. Provide `pnpm db:migrate` and `pnpm db:generate` scripts.

### CSV/PDF ingestion
1. Use streaming CSV parser; map headers to schema; per-row Zod refine.
2. Return `IngestReport` with counts and bad rows; persist only report if user chooses.

### KPI engine
1. Export `computeKPIs(input, config)`; each KPI has a validator and a formula module.
2. Time-bucket and filter utilities in `kpi/utils.ts`.

### Reporting UI
1. Tabs per department, chips for filters, KpiCard grid, Recharts line/bar/pie where appropriate.
2. Export buttons use `/api/export/pdf` and `/api/export/csv` routes.

---
## Test Plan Templates
- Vitest example:
  - `tests/unit/kpi/occupancy.spec.ts`: covers 0/denominator, rounding, null rows
- Playwright examples:
  - `tests/e2e/auth.spec.ts` — login/out, role guards
  - `tests/e2e/ingest.spec.ts` — upload CSV, validation errors shown
  - `tests/e2e/reporting.spec.ts` — build & save report, export PDF/CSV

---
## Deliverable Template (use in each Report step)
- **Changed files**: (list)
- **Migrations**: (yes/no + name)
- **Tests added**: (vitest/playwright file names)
- **Docs updated**: (files)
- **Run instructions**:
  1. `pnpm i`
  2. `pnpm db:generate && pnpm db:migrate`
  3. `pnpm dev`
  4. `pnpm test` and `pnpm e2e`
- **Verification**: concise manual steps

---
## Working Loop (strict)
1) **Notify** with a 5–10 line plan (files, diffs, tests).
2) Wait for **APPROVE**/**CHANGE**.
3) **Proceed** to implement.
4) **Report** with deliverable template.

---
## KPI Catalog (55 items, grouped by department)
### Front Office
- **Occupancy Rate** — *Unit:* %  
  Formula: `Occupied Rooms / Available Rooms`
- **Average Daily Rate (ADR)** — *Unit:* currency/room  
  Formula: `Room Revenue / Occupied Rooms`
- **Revenue per Available Room (RevPAR)** — *Unit:* currency/available room  
  Formula: `Room Revenue / Available Rooms`
- **Revenue Generation Index (RGI)** — *Unit:* index  
  Formula: `Hotel RevPAR / Market RevPAR`
- **Average Length of Stay (ALOS)** — *Unit:* nights  
  Formula: `Room Nights / Bookings`
- **Booking Lead Time** — *Unit:* days  
  Formula: `Check-in Date − Booking Date (avg)`
- **Cancellation Rate** — *Unit:* %  
  Formula: `Cancelled Reservations / Total Reservations`
- **No-Show Rate** — *Unit:* %  
  Formula: `No‑Shows / Confirmed Reservations`
### Food & Beverage
- **Covers** — *Unit:* count  
  Formula: `Total Guests Served`
- **Average Check** — *Unit:* currency/guest  
  Formula: `F&B Revenue / Covers`
- **Food Cost %** — *Unit:* %  
  Formula: `Food Cost / Food Revenue`
- **Beverage Cost %** — *Unit:* %  
  Formula: `Beverage Cost / Beverage Revenue`
- **Table Turnover Rate** — *Unit:* turns/hour  
  Formula: `Covers / (Seats × Opening Hours)`
- **RevPASH** — *Unit:* currency/seat-hour  
  Formula: `F&B Revenue / (Available Seat Hours)`
- **Waste %** — *Unit:* %  
  Formula: `Waste Cost / Purchases`
- **Void/Comp %** — *Unit:* %  
  Formula: `Voids + Comps Value / F&B Revenue`
### Housekeeping
- **Rooms Cleaned per Shift** — *Unit:* rooms/staff-shift  
  Formula: `Rooms Cleaned / HK Staff on Shift`
- **Average Cleaning Time** — *Unit:* minutes/room  
  Formula: `Σ Room Cleaning Minutes / Rooms Cleaned`
- **Room Turnaround Time** — *Unit:* minutes  
  Formula: `Ready Time − Checkout Time (avg)`
- **Inspection Pass Rate** — *Unit:* %  
  Formula: `Rooms Passed on First Inspection / Rooms Inspected`
- **Out-of-Order %** — *Unit:* %  
  Formula: `Out-of-Order Room Nights / Available Room Nights`
- **Linen Cost per Occupied Room** — *Unit:* currency/room  
  Formula: `Linen Cost / Occupied Rooms`
- **Guest Room Defect Rate** — *Unit:* %  
  Formula: `Defects Found / Rooms Inspected`
- **Chemical Cost per Occupied Room** — *Unit:* currency/room  
  Formula: `Chemical Cost / Occupied Rooms`
### Maintenance/Engineering
- **Mean Time To Repair (MTTR)** — *Unit:* hours  
  Formula: `Σ Repair Time / # Repairs`
- **Mean Time Between Failures (MTBF)** — *Unit:* hours  
  Formula: `Uptime / # Failures`
- **PM Compliance Rate** — *Unit:* %  
  Formula: `Completed PM Tasks / Scheduled PM Tasks`
- **Energy per Occupied Room (ECOR)** — *Unit:* kWh/room  
  Formula: `kWh / Occupied Room`
- **Water per Occupied Room (WCOR)** — *Unit:* m³/room  
  Formula: `m³ / Occupied Room`
- **Work Order Closure Rate** — *Unit:* %  
  Formula: `Closed Work Orders / Opened Work Orders (period)`
- **Equipment Downtime %** — *Unit:* %  
  Formula: `Downtime / Total Time`
- **Reactive:Preventive Ratio** — *Unit:* ratio  
  Formula: `Reactive Tasks / Preventive Tasks`
### Sales & Marketing
- **Direct Booking Ratio** — *Unit:* %  
  Formula: `Direct Bookings / Total Bookings`
- **Website Conversion Rate** — *Unit:* %  
  Formula: `Bookings / Unique Website Sessions`
- **Cost per Acquisition (CPA)** — *Unit:* currency/booking  
  Formula: `Marketing Spend / New Bookings`
- **Return on Ad Spend (ROAS)** — *Unit:* x  
  Formula: `Attributed Revenue / Ad Spend`
- **Forecast Accuracy (MAPE)** — *Unit:* %  
  Formula: `mean(|Forecast − Actual| / Actual)`
- **Group Booking Conversion Rate** — *Unit:* %  
  Formula: `Confirmed Group Bookings / Group RFPs`
- **Upsell Attach Rate** — *Unit:* %  
  Formula: `Upsold Add‑ons / Eligible Bookings`
- **Email CTR** — *Unit:* %  
  Formula: `Email Clicks / Emails Delivered`
### Finance
- **Gross Operating Profit (GOP) Margin** — *Unit:* %  
  Formula: `GOP / Total Revenue`
- **GOPPAR** — *Unit:* currency/available room  
  Formula: `GOP / Available Rooms`
- **Total RevPAR (TRevPAR)** — *Unit:* currency/available room  
  Formula: `Total Revenue / Available Rooms`
- **Payroll % of Revenue** — *Unit:* %  
  Formula: `Total Payroll / Total Revenue`
- **Days Sales Outstanding (DSO)** — *Unit:* days  
  Formula: `(AR / Credit Sales) × Days`
- **Inventory Turnover** — *Unit:* turns  
  Formula: `COGS / Average Inventory`
- **Budget Variance %** — *Unit:* %  
  Formula: `(Actual − Budget) / Budget`
- **Break-even Occupancy** — *Unit:* %  
  Formula: `Fixed Costs / (ADR − Variable Cost per Room) / Available Rooms`
### HR
- **Staff-to-Room Ratio** — *Unit:* staff/room  
  Formula: `Average On‑Roll Staff / Available Rooms`
- **Overtime %** — *Unit:* %  
  Formula: `Overtime Hours / Paid Hours`
- **Training Hours per FTE** — *Unit:* hours/FTE  
  Formula: `Total Training Hours / Average FTEs`
- **Employee Turnover Rate** — *Unit:* %  
  Formula: `Separations / Average Headcount`
- **Absenteeism Rate** — *Unit:* %  
  Formula: `Unplanned Absence Hours / Scheduled Hours`
- **Employee NPS (eNPS)** — *Unit:* score  
  Formula: `% Promoters − % Detractors`
- **Productivity per Labor Hour** — *Unit:* currency/hour  
  Formula: `Revenue / Labor Hours`
