<!-- @format -->

# Technical TODO Roadmap & Action Plan - Kiosk

---

## Executive Summary & Core Objectives

This technical TODO roadmap outlines the high-priority engineering tasks, design redesigns, template expansion, test coverage goals, and deployment preparations for **Kiosk** (Next.js 16, React 19, TypeScript, Drizzle ORM, Auth.js v5, Bachs, Upstash Redis).

---

## 1. Front-End Redesign & Visual Design Audit

### Hero Section Redesign (`src/components/Hero.tsx`)
- [x] **High-Impact Headline & Typography**: Redesign hero title with solid high-contrast typography, clean pill badges, and modern responsive font scaling.
- [x] **Interactive CTA Integration**: Enhance primary and secondary `PillButton` triggers with hover states and subtle button shadows.
- [x] **Visual Metric Cards & Icons**: Replace empty placeholder badge circles with Lucide React icons (`Zap`, `ShieldCheck`, `TrendingUp`, `Sparkles`).
- [x] **Enhanced Browser Window Mockup**: Upgrade live website preview card with dynamic status indicators, solid card floaters, and crisp card borders.

### Design Typos & Visual Consistency Audit
- [x] **Icon & Element Alignment**: Audit components for missing icon SVGs inside circular badges (`Hero.tsx`, `CTA.tsx`, `HowItWorks.tsx`).
- [x] **Color Token Audit**: Enforce consistent solid design token usage (`#004ac6` primary blue, `emerald-500` status indicators, `slate-900` text).
- [x] **Copy Clean Up**: Remove illegal em-dashes from user-facing copy in compliance with Kiosk developer guidelines.
- [x] **Responsive Spacing**: Fix mobile-to-desktop padding shifts (`pt-32` vs `pt-44`) and container padding alignment.

---

## 2. Multi-Tenant Industry Site Templates & Content Studio

### Content Studio & Live Interactive Preview (`src/app/dashboard/content/page.tsx`)
- [x] **Multi-Step Content Form**: Brand setup, Design & typography, Page catalog/services, and Social links.
- [x] **Separated Logo & Brand Assets**: Dedicated Primary Brand Logo module (with checkerboard preview) separate from Brand Photos/Media Assets.
- [x] **Theme Switcher**: Live dynamic Light Mode vs Midnight Dark Mode (`#070d1d`, `#0d162a`, `#111c33`) preview.
- [x] **Dynamic Google Fonts**: Injected dynamically in preview based on client selection (`Playfair`, `Inter`, `Outfit`, `Montserrat`, etc.).
- [x] **E-Commerce Live Preview & Cart**: Product uploads with badges, multi-currency support, slide-out cart drawer, and direct WhatsApp order message generation.
- [x] **Sales Funnel Live Preview**: Urgency countdown timer, 16:9 VSL video embed, value stack breakdown, order bump upgrades, and simulated order dialog.
- [x] **Landing Page Live Preview**: Authority stats bar, 3-column services grid, client reviews, FAQ accordion, and lead intake modal.
- [x] **Authentic Smartphone Mockup Viewport**: Mobile frame (`w-[380px] rounded-[44px] border-[8px] border-slate-800`) with dynamic island / speaker status bar.
- [x] **Templates Directory Dock Linking**: Direct dock icon linking to `/dashboard/templates` with live template preview modals.
- [x] **Project Cards Direct Navigation**: Clicking any project card in the dashboard opens `/dashboard/content?projectId=<id>` to resume editing.

---

## 3. Cloud Object Storage & Media Pipeline

- [x] **Multi-Tenant Cloudinary Storage**: Serverless upload engine (`src/lib/storage/cloudinary.ts`) with SHA-1 cryptographic signature signing.
- [x] **Strict Tenant Folder Isolation**: User uploads partitioned under `kiosk/tenants/<tenantSlug>/<category>/` (`logos`, `brand_assets`, `products`, `avatars`).
- [x] **Collision-Proof File Hashing**: Unique timestamp & UUID public IDs preventing cross-tenant file overwrites.
- [x] **Optimistic Background Upload**: Studio and Settings upload files in the background while displaying instant local previews.

---

## 4. Authentication & Checkout Session Protection Engine

- [x] **6-Hour Session Expiration**: User sessions expire strictly after 6 hours of inactivity.
- [x] **Checkout Active Grace Window**: Suspend automatic logout if client is actively completing payment on `/checkout` (`isCheckoutInProgress`).
- [x] **Pre-Payment Auth Verification**: Validate active user session before dispatching payment payload to Bachs gateways.
- [x] **User Phone Number DB Column**: Added `phone` column to `users` table with session & profile synchronization.

---

## 5. Decoupled Event Messaging & Transactional Email System

- [x] **Admin Review Alert (`sendWebsiteReviewNotificationToAdmin`)**: Notifies Kiosk fulfillment team with submission details and direct Studio deep-link.
- [x] **Client Confirmation Email (`sendWebsiteReviewConfirmationToClient`)**: Confirms submission received and status updated to 85% ("In Review").
- [x] **Welcome Greeting Email (`sendWelcomeEmail`)**: Dispatched on standard registration and OAuth account creation via NextAuth's `createUser` lifecycle hook.
- [x] **Dynamic Base URL Resolver**: Dynamic `getAppUrl()` resolving URLs across local dev, Vercel preview branches, and production.

---

## 5. E2E Testing, TDD & CI/CD Automation

- [x] **Playwright Test Environment**: Configure Playwright (`playwright.config.ts`) for API and integration testing.
- [x] **API Endpoint Tests (`*.e2e-spec.ts`)**:
  - `POST /api/auth/register` & `POST /api/auth/login` (validation, rate-limiting, error responses).
  - `POST /api/payments/initialize` (atomic lock `SETNX` double-charge protection).
  - `POST /api/webhooks/bachs` (HMAC signature verification and event deduplication).
- [x] **GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)**:
  - Automated `tsc --noEmit` and ESLint checks on every PR.
  - Automatic Vitest / Playwright suite execution on merges.

---

## 6. Multi-Tenant Subdomain Isolation & Brand Identity

- [x] **Subdomain Dynamic Favicon**: Replaced generic Kiosk favicon on subdomains with the tenant's brand logo (or auto-generated SVG monogram).
- [x] **Subdomain Brand Preloader**: Implemented loading screen using the client's logo instead of Kiosk platform branding.
- [x] **Cinematic Under Construction Page**: Animated dark-mode page for unlaunched subdomains (`DRAFT` / `IN_REVIEW`) featuring live progress indicators and WhatsApp contact trigger.
- [x] **Admin Fulfillment User Profile Pictures**: Display real customer avatars/profile pictures in the fulfillment queue (`/admin/projects`) instead of single-letter initials.
- [x] **Client Revision Modal**: Interactive revision management workflow in the admin studio and client dashboard.
- [x] **Kiosk Project Logo Integration**: Replaced placeholder "K" box in `/dashboard` header and `/not-found` page with official `/KIOSK PNG2.png` logo.
- [x] **Mobile Responsiveness & iOS Safari Performance**: Fixed scroll animation containing block transforms, added hide-on-scroll navigation, and implemented touch-friendly swipe gestures with pagination dots.
- [x] **Contact Page Interactive PillButton**: Upgraded the message submission CTA on `/contact` to use the animated `PillButton` component.
- [x] **Bachs Webhook & Production Security**: Implemented HMAC-SHA256 webhook signature verification, strict production key enforcement, and payment reconciliation.

---

## 7. Production Deployment Pre-Flight & Infrastructure

- [x] **Wildcard Subdomain Middleware Audit**: Verify `<client>.kioosk.online` header forwarding and edge routing in `src/middleware.ts`.
- [x] **TypeScript Strict Check**: Execute `npx tsc --noEmit` locally (0 errors verified).

---

## Task Progress Summary

| Category | High Priority Task | Status | Target Deliverable |
| :--- | :--- | :---: | :--- |
| **Design / UI** | Hero Section Redesign & Interactive Card | Completed | `src/components/Hero.tsx` |
| **Design / UI** | Dashboard & 404 Official Kiosk Logo | Completed | `src/app/dashboard/page.tsx` |
| **Design / UI** | Contact Page PillButton Submission CTA | Completed | `src/app/contact/page.tsx` |
| **Branding** | Subdomain Dynamic Favicon & Preloader | Completed | `src/app/tenants/[slug]/` |
| **Branding** | Cinematic Under Construction Page | Completed | `src/components/tenant/UnderConstruction.tsx` |
| **Admin** | Fulfillment Queue Real Avatars & Revision Modal | Completed | `src/app/admin/projects/` |
| **Studio** | Content Studio with Live Preview & Dark Mode | Completed | `src/app/dashboard/content/` |
| **Templates** | Templates Directory with Live Modals | Completed | `src/app/dashboard/templates/` |
| **Auth** | 6-Hour Session Token & Checkout Grace Window | Completed | `src/lib/auth/session.ts` |
| **Payments** | Bachs Webhook Integration | Completed | `src/app/api/webhooks/` |
| **E-Commerce** | Multi-Currency Catalog & WhatsApp Ordering | Completed | Content Studio & Preview |
| **Testing** | Playwright E2E Test Suite | Completed | `*.e2e-spec.ts` |
| **Performance**| iOS Safari Scroll & Mobile Gesture Polish | Completed | `src/components/` |
| **DevOps** | GitHub Actions CI/CD Pipeline | Completed | `.github/workflows/` |
| **Deploy** | Production Pre-Flight Audit | Ready | Vercel & Neon Setup |

---

## Verification & Acceptance Criteria

1. **Type Safety**: `tsc --noEmit` completes with **0 errors**.
2. **Build Success**: `npm run build` generates optimized production bundles without warnings or failures.
3. **Template Coverage**: Interactive presets and content studio available across all subscription tiers.
4. **UI Design Standard**: 100% clean solid typography, zero gradients, authentic mobile frame mockup, and sleek dark mode preview.


