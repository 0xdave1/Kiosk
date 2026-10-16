<!-- @format -->

# System Design — Kiosk

## Overview

`kiosk` is a modern Next.js 16 web application consisting of three primary subsystems:

1. **Public Marketing Application**: Modular, high-conversion marketing pages (`/`, `/about`, `/services`, `/pricing`, `/contact`, `/get-started`).
2. **Authenticated Client Dashboard**: Single-page app workspace (`/dashboard`, `/dashboard/projects`, `/dashboard/projects/new`, `/dashboard/content`, `/dashboard/templates`, `/dashboard/billing`, `/dashboard/settings`).
3. **Website Content Studio & Live Preview Engine**: Real-time multi-tier website builder supporting live dual-theme previews (Desktop & authentic Mobile viewports).

## High-Level System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │                 User Client                  │
                  │         (Modern Web Browser / Mobile)        │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │          Next.js App Router (CDN/Edge)        │
                 └───────────┬───────────────────────┬───────────┘
                             │                       │
           ┌─────────────────┴──────────────┐ ┌──────┴────────────────────────┐
           │      Public Marketing Pages    │ │   Authenticated Client Portal   │
           │  (/, /about, /services, etc.)  │ │          (/dashboard/*)         │
           └────────────────────────────────┘ └──────────────┬──────────────────┘
                                                             │
                                                             ▼
                                               ┌───────────────────────────┐
                                               │ Content Studio & Preview  │
                                               │    (/dashboard/content)   │
                                               └─────────────┬─────────────┘
                                                             │
                                                             ▼
                                               ┌───────────────────────────┐
                                               │   Backend API Handlers    │
                                               │ (/api/projects/content,   │
                                               │  /api/upload, /api/auth)  │
                                               └──────┬──────────────┬─────┘
                                                      │              │
                                                      ▼              ▼
                                          ┌─────────────────┐ ┌───────────────┐
                                          │ Neon PostgreSQL │ │  Cloudinary   │
                                          │  & Upstash L2   │ │ Media Storage │
                                          └─────────────────┘ └───────────────┘
```

- **Client Runtime**: React 19, Framer Motion (Dock spring physics), GSAP (PillButton animation), Lottie-Web (`LottiePlayer`), ScrollStack, Tailwind CSS v4.
- **Rendering Strategy**: Static Generation (SSG) for marketing content and Client-Side Rendering (CSR) for interactive dashboard views.

---

## Subsystems & Data Flow

### 1. Public Marketing Subsystem

- **Routing & Layout**: Global `layout.tsx` wraps pages with `NavbarWrapper` to conditionally render `Navbar` and `StaggeredMenu`.
- **Dedicated Services Page (`/services`)**:
  - **Hero Section**: Architectural grid lines, minimal technical crosshairs (`+`), and an interactive `<LottiePlayer />` canvas supporting live tab switching between *Sales Funnel*, *Landing Page*, and *E-Commerce*.
  - **Service Tier Deep Dive Sections**: Full breakdown of Landing Page (`$499 setup + $20/mo`), Sales Funnel (`$799 setup + $30/mo`), and E-commerce Store (`$1,199 setup + $43/mo`).
  - **Interactive Billing Toggle**: Allows toggling between Monthly and Yearly (Save 20%) billing cycles across service cards.
  - **Interactive Process Section (`<HowItWorks />`)**: Animated 4-card scroll stack process section.
  - **Decision Helper Quiz**: Interactive 3-choice recommendation engine recommending tier packages based on business goals.
- **Full-Bleed CTA System (`CTA.tsx`)**:
  - Full-width blue background section (`bg-[#004ac6]`) with radial highlight.
  - Asymmetric wave divider SVG (`fill-[#004ac6]`) seamlessly transitioning into the dark footer (`#03152c`).
- **User Onboarding Flow**: Users click "Get Started" to reach `/get-started`. On form submission, a loading spinner is triggered, followed by client-side navigation to `/dashboard`.

### 2. Client Dashboard & Project Management Subsystem

- **Layout & Navigation**: `/dashboard/layout.tsx` enforces light mode styling (`bg-[#f8fafc]`) and renders the persistent floating bottom `<Dock />` component wrapper (`Sidebar.tsx`).
- **Header Profile State**: `page.tsx` renders dynamic greetings based on client local time (`00:00-11:59` Morning, `12:00-16:59` Afternoon, `17:00-23:59` Evening), notification icon trigger, and profile dropdown menu (*Account Settings*, *Billing & Plan*, *Log Out*).
- **Projects Management**: Click any project card on `/dashboard` or `/dashboard/projects` to directly load `/dashboard/content?projectId=<id>` and resume editing.
- **Templates Dock**: Direct bottom-dock icon linking to `/dashboard/templates`, offering an interactive gallery of pre-built templates with live preview overlays.
- **Session Protection**: 6-hour session token duration with automatic logout suspension while actively on `/checkout` (`isCheckoutInProgress`).

### 3. Website Content Studio & Live Interactive Preview Subsystem

- **Content Studio (`/dashboard/content`)**: 4-step comprehensive intake form:
  1. *Business & Brand*: Business name, plan selection, logo image, hero banner upload.
  2. *Design & Typography*: Selected Google Font injection (`Playfair`, `Inter`, `Outfit`, `Montserrat`, etc.), Light Mode vs Midnight Dark Mode preference.
  3. *Page Content & Catalog*: Multi-currency product upload (`USD`, `NGN`, `GBP`, `EUR`, `CAD`, `GHS`, `KES`, `ZAR`), badge tags, category pills, service cards, testimonials, FAQ accordions, VSL video URL, and urgency countdown timers.
  4. *Contact & Links*: Comprehensive inputs for WhatsApp, X, Instagram, Facebook, LinkedIn, YouTube, TikTok, Booking links, and Custom URLs.
- **Live Interactive Preview Engine**:
  - **Desktop Canvas & Authentic Smartphone Viewport**: Real-time rendering with responsive layout scaling.
  - **Live E-Commerce Operations**: Fully functional Add to Cart, quantity stepper, cart slide-out drawer, simulated order checkout, and instant WhatsApp order message generation.
  - **Live Funnel Interactivity**: Real-time urgency timer, video embed player, value stack breakdown, order bump toggle, and simulated confirmation dialog.
  - **Live Lead Capture**: Interactive consultation form with simulated submission state.

### 4. Dynamic Multi-Tenant Subdomains & Brand Isolation Subsystem

- **Subdomain Routing & Edge Rewrites**: Edge middleware rewrites `<tenant>.kioosk.online` to `/tenants/[slug]` and `<customdomain.com>` to `/domains/[domain]`.
- **Client Favicon Isolation**: Client sites resolve their favicon dynamically to the tenant's uploaded logo or an auto-generated business monogram SVG, guaranteeing zero Kiosk platform branding on client web domains.
- **Client Branded Preloader**: Live tenant site initial loads feature the client's logo instead of the Kiosk logo.
- **Cinematic Under Construction Experience**:
  - Automatically served when a tenant site is in `DRAFT` or `IN_REVIEW` status.
  - Implements a cinematic, ambient dark theme with launch stage progress meters and direct WhatsApp communication channels.
- **Universal Live Renderer (`<TenantLiveSite />`)**: Dynamically generates landing pages, sales funnels, and e-commerce stores with functional WhatsApp catalog checkout.

---

## Performance & Responsive System

- **Fluid Mobile Scaling**: Root `rem` scaling configured in `globals.css`:
  - `html { font-size: 18px; }` on desktop.
  - `@media (max-width: 640px) { html { font-size: 16px; } }` for mobile viewports (< 640px).
- **iOS Safari & Mobile Optimization**: Lenis smooth scroll pinning, hide-on-scroll navigation, touch-swipe gestures, and zero layout shift.
- **Zero Gradients**: High-contrast, clean solid colors with slate/blue accents.
- **Error Handling**: Native Next.js `not-found.tsx` fallback page handles 404 routes gracefully with official Kiosk branding.

---

## Security & Deployment

- Deployments hosted on Vercel with automatic edge CDN caching for static assets.
- Payment webhook (`/api/webhooks/bachs`) with cryptographic HMAC signature verification and idempotency locks.
- Input validation on onboarding and project wizard forms via Zod schemas.
- Neon PostgreSQL database with PgBouncer connection pooling.
- Transport Layer Security (TLS 1.3) across all endpoints.

