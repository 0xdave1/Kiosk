<!-- @format -->

# Kiosk — Product Roadmap

> **Launch Target: September 30, 2026**

This roadmap tracks every milestone from the initial build through public launch and post-launch growth. It is the single source of truth for what has shipped, what is in progress, and what is coming next.

---

## Status Legend

| Badge | Meaning |
| :--- | :--- |
| ✅ Done | Shipped and production-ready |
| 🔄 In Progress | Actively being worked on |
| 🔜 Up Next | Queued — starts after current milestone |
| 📋 Planned | Scoped and confirmed for a future phase |
| 💡 Exploration | Under consideration, not yet committed |

---

## Phase 1 — Core Infrastructure ✅ Done

> **Goal**: Lay the full-stack, multi-tenant foundation.

- ✅ Next.js 16 App Router project scaffold
- ✅ Neon PostgreSQL + Drizzle ORM schema (`users`, `tenants`, `projects`, `sessions`)
- ✅ Auth.js v5 authentication (Google OAuth + email/password)
- ✅ Custom secure HTTP-only session cookies
- ✅ RBAC roles — `USER`, `ADMIN`, `SUPERADMIN`
- ✅ Edge Middleware — subdomain rewriter (`<tenant>.kioosk.online → /tenants/[slug]`)
- ✅ Custom domain rewriter (`<customdomain.com> → /domains/[domain]`)
- ✅ Upstash Redis rate limiting (Sliding Window)
- ✅ Cloudinary multi-tenant media isolation (`kiosk/tenants/<id>/...`)
- ✅ Bachs subscription payments (3 plans × 2 billing cycles)
- ✅ Webhook signature verification + idempotency locks
- ✅ Resend transactional email engine (`src/lib/email.ts`)

---

## Phase 2 — Client Dashboard ✅ Done

> **Goal**: Give clients a polished self-service workspace.

- ✅ `/dashboard` — main hub with subscription status and quick actions
- ✅ `/dashboard/projects` — real-time project progress tracking
- ✅ `/dashboard/content` — Website Intake Studio (form, media uploads, product catalog)
- ✅ `/dashboard/templates` — industry-specific template browser
- ✅ `/dashboard/projects/new` — new project wizard
- ✅ `/dashboard/billing` — plan details, monthly/yearly toggle, invoice history
- ✅ `/dashboard/settings` — profile, password, notifications

---

## Phase 3 — Admin Operations Backoffice ✅ Done

> **Goal**: Give the Kiosk team full control over fulfillment and launch.

- ✅ `/admin` — Bento Grid Operations Hub with live KPIs (Queue, In Progress, Live, Revenue)
- ✅ `/admin/projects` — Fulfillment Queue with search and status filters
- ✅ `/admin/projects/[id]` — Fulfillment & Launch Studio
  - Full brand assets inspector (logo, gallery, copy, offerings)
  - Published domain assignment
  - Internal fulfillment notes
  - 1-click **"Publish Website & Email Client Launch Notification"**
- ✅ `/admin/users` — user directory with role assignment
- ✅ `/admin/billing` — revenue ledger and invoice management
- ✅ Interactive floating `AdminDock` navigation

---

## Phase 4 — Email Notification System ✅ Done

> **Goal**: Automate every client and team touchpoint.

- ✅ Admin intake alert (instant notification on new submission)
- ✅ Client intake receipt (submission acknowledgement)
- ✅ Website Live celebration email (dispatched on 1-click Publish)
- ✅ Hosting renewal invoices & grace period notices
- ✅ Password reset & account welcome emails

---

## Phase 5 — Live Website Renderer ✅ Done

> **Goal**: Dynamically render each tenant's published site on their subdomain/domain.

- ✅ `<TenantLiveSite />` dynamic renderer for Landing Pages, Sales Funnels, and E-Commerce Stores
- ✅ 1-click WhatsApp Commerce with pre-filled product order messages
- ✅ Responsive, high-converting page output from intake data
- ✅ Subdomain & Custom Domain Brand Isolation:
  - Dynamic client favicon (client logo or custom monogram, Kiosk branding decoupled)
  - Client-branded page preloader
  - Cinematic animated Under Construction page for unlaunched subdomains
- ✅ Admin Fulfillment Queue enhancements (real user avatars/profile pictures, revision workflow)
- ✅ Enterprise payment gateway integration (Bachs webhooks & production security)

---

## Phase 6 — Pre-Launch Polish ✅ Completed

> **Goal**: Harden UX, squash bugs, and prepare for real users.

- ✅ End-to-end QA pass across dashboard, admin fulfillment, and live tenant sites
- ✅ TypeScript strict-mode error resolution (`tsc --noEmit` exits with 0 errors)
- ✅ Mobile responsiveness audit & iOS Safari performance optimizations (hide-on-scroll nav, Lenis scroll pinning, touch swipe gestures)
- ✅ Kiosk brand integration: Dashboard header and 404 pages upgraded with official Kiosk logo
- ✅ Performance audit — Core Web Vitals and asset compression
- ✅ Error boundary and dynamic loading preloader coverage
- ✅ Admin review notification email verification (`kioskonline3@gmail.com`)

---

## Phase 7 — Marketing Site & Checkout ✅ Completed

> **Goal**: Public-facing homepage, pricing, legal pages, and frictionless onboarding.

- ✅ Public homepage (`/`) — hero, features, pricing, testimonials, FAQ with semantic headings
- ✅ Pricing page (`/pricing`) with interactive monthly/yearly billing toggle (-20% discount)
- ✅ Dedicated Services page (`/services`) with live interactive Lottie player & decision quiz
- ✅ Contact page (`/contact`) featuring animated `PillButton` CTA and email dispatch
- ✅ Privacy policy (`/privacy`) and Terms of Service (`/terms`) pages
- ✅ `/checkout` — guided plan selection → signup → payment flow
- ✅ SEO meta tags, Open Graph tags, and sitemap generation

---

## Phase 8 — Production Launch 🔄 In Progress

> **Goal**: Final deployment configuration and launch.
> **Target: September 30, 2026 🚀**

- 🔄 DNS and custom domain provisioning on production (`kioosk.online`)
- 🔄 Production environment variables finalised and secured
- 🔄 Neon PostgreSQL production branch verified
- 🔄 Upstash Redis production instance configured
- 🔄 Bachs live-mode keys configured
- 🔄 Resend domain verified for deliverability (`noreply@kioosk.online`)
- 🔄 Cloudinary production plan verified
- 🔄 Vercel production deployment + wildcard subdomain routing verified (`*.kioosk.online`)
- 🔄 Smoke test — full end-to-end order (signup → intake → review → publish → live site)
- 🔜 Team onboarding — admin accounts and fulfillment SOPs documented

---

## Phase 9 — Post-Launch Growth 📋 Planned

> **Goal**: Stabilise operations and grow the customer base.
> **Target: October – December 2026**

- 📋 Customer analytics dashboard (page views, WhatsApp clicks, conversion)
- 📋 Referral / affiliate programme
- 📋 Automated renewal reminders and dunning sequences
- 📋 Expanded template library (10+ industry verticals)
- 📋 SMS notification integration (Termii / Vonage)
- 📋 In-dashboard live chat support widget

---

## Phase 10 — Platform Expansion 💡 Exploration

> Long-term capabilities being evaluated.

- 💡 Client self-serve minor edits (text, phone number, hours)
- 💡 AI-assisted intake (auto-generate copy from a few keywords)
- 💡 Custom domain self-service connection (DNS wizard)
- 💡 White-label reseller programme
- 💡 Native mobile app (React Native) for client dashboard

---

## Key Dates Summary

| Milestone | Target Date |
| :--- | :--- |
| Phase 6 — Pre-Launch Polish complete | Sep 25, 2026 |
| Phase 7 — Marketing site & checkout live | Sep 28, 2026 |
| **Phase 8 — Public Launch 🚀** | **Sep 30, 2026** |
| Phase 9 — Post-launch growth kicks off | Oct 1, 2026 |

---

_Last updated: September 2026_
