<!-- @format -->

# Scalable Backend Architecture TODO & Technical Roadmap — Kiosk

This technical roadmap defines the completed and ongoing enterprise backend architecture for **Kiosk**, tailored to our **Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4** tech stack.

---

## Scalable Stack Architecture Overview

| Layer | Technology Stack |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router Route Handlers & Server Components) |
| **Multi-Tenancy** | Wildcard Subdomain Rewrites (`<tenant>.kioosk.online` -> `/tenants/[slug]`) + Custom Domains (`/domains/[domain]`) |
| **Admin Operations** | Full Product Backoffice (`/admin/*`) with RBAC Guards, Live Bento Grid, and 1-Click Launch |
| **Rate Limiting** | `@upstash/ratelimit` + Upstash Redis Sliding Window Algorithm |
| **Authentication** | Auth.js v5 (NextAuth) + Custom Session Cookies + RBAC (`ADMIN` / `SUPERADMIN`) |
| **Database** | Neon PostgreSQL Serverless with PgBouncer Pooling |
| **ORM & Querying** | Drizzle ORM (`drizzle-orm`, `postgres`) |
| **Media Storage** | Cloudinary Multi-Tenant Isolated Buckets (`kiosk/tenants/<id>/...`) |
| **Payments** | Flutterwave Multi-Plan Subscriptions & Idempotency Locks |
| **Email & Transact** | Resend Transactional Email Engine (`src/lib/email.ts`) |

---

## Phase 1: Authentication & Authorization Engine
- [x] Core schema in `src/db/schema.ts` (`users`, `accounts`, `sessions`, `verificationTokens`).
- [x] Edge middleware protection in `src/middleware.ts` guarding `/dashboard/*`, `/checkout`, and `/admin/*`.
- [x] Dual-session authentication (Custom secure HTTP-only cookies + Auth.js Google OAuth).
- [x] Rate limiting middleware with Upstash Redis.
- [x] User role management (`USER` ↔ `ADMIN` ↔ `SUPERADMIN`).

---

## Phase 2: Multi-Tenant Architecture & Media Storage
- [x] `tenants` and `projects` tables in `src/db/schema.ts`.
- [x] Edge Subdomain Rewriter in `src/middleware.ts` (`<tenant>.kioosk.online` -> `/tenants/[slug]`).
- [x] Custom Domain Rewriter (`<customdomain.com>` -> `/domains/[domain]`).
- [x] Multi-tenant Cloudinary API endpoint (`/api/upload`) with namespace folder isolation.
- [x] Dynamic Live Website Renderer (`<TenantLiveSite />`) for Landing Pages, Sales Funnels, and E-Commerce Stores.
- [x] Dynamic Client Favicon: Injects client logo/monogram into subdomain/custom domain metadata (zero Kiosk branding leakage).
- [x] Tenant Brand Preloader: Client's own logo displayed during live site loading states.
- [x] Cinematic Under Construction fallback page for `DRAFT` and `IN_REVIEW` subdomains with inquiry links.
- [x] 1-Click WhatsApp Commerce with pre-filled order messages.

---

## Phase 3: Operations & Fulfillment Backoffice (`/admin`)
- [x] RBAC security module (`src/lib/auth/admin.ts`) guarding all `/admin/*` pages and `/api/admin/*` routes.
- [x] Master Admin Bento Grid Dashboard (`/admin/page.tsx`) with real-time database KPIs.
- [x] Fulfillment Queue (`/admin/projects/page.tsx`) with search and status filters.
- [x] Customer profile picture / avatar rendering in Fulfillment Queue rows directly from PostgreSQL.
- [x] Project Fulfillment & Launch Studio (`/admin/projects/[id]/page.tsx`):
  - Brand assets inspector (Logo full-res, media gallery, structured copy, offerings).
  - Published domain assignment (`https://brand.kioosk.online`).
  - Interactive Revision Modal and client revision messaging.
  - Internal fulfillment notes.
  - 1-Click **"Publish Website & Email Client Launch Notification"** action.
- [x] Users Directory (`/admin/users/page.tsx`) with role assignment.
- [x] Billing & Invoices Ledger (`/admin/billing/page.tsx`).
- [x] Interactive floating `AdminDock` navigation.

---

## Phase 4: Transactional Email Notification System (`src/lib/email.ts`)
- [x] Admin Intake Alert: Instant notification to `kioskonline3@gmail.com` with review link.
- [x] Client Intake Receipt: Confirmation email acknowledging submission.
- [x] Website Live Celebration Email: Dispatched to client with live URL when admin publishes.
- [x] Hosting Renewal Invoices & Grace Period Notices.
- [x] Password Reset & Account Welcome emails.
- [x] Clean, accessible 580px email shell with zero clutter and high readability.

---

## Phase 5: Payment Gateway & Subscriptions
- [x] Flutterwave Multi-Plan Subscription Integration (3 tiers x 2 cycles).
- [x] Paystack Webhook Handler (`/api/webhooks/paystack`) with HMAC-SHA512 signature verification.
- [x] Production security: strict requirement for `PAYSTACK_SECRET_KEY` and removal of mock bypasses in production.
- [x] Automated invoice generation and payment idempotency.
- [x] Grace period handling and renewal tracking.
