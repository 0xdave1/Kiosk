<!-- @format -->

# Design Architecture — Kiosk

## Purpose

This document describes the visual and component architecture for the `kiosk` web application, client dashboard, and Website Content Studio Live Preview engine. It is written to help designers and engineers reason about the component model, visual tokens, layout rules, interaction patterns, and accessibility expectations.

---

## Design Goals

- **Sleek & Professionally Neat Light Mode**: Premium light theme (`bg-[#f8fafc]`, crisp `border-gray-200/90` containers, solid color accents).
- **Midnight Dark Mode System**: Deep obsidian & midnight surfaces (`#070d1d`, `#0d162a`, `#111c33`) with subtle borders (`#1e293b` / `border-slate-800`) for the Live Website Preview engine.
- **Zero Gradients**: All UI components use solid, curated harmonious color palettes (slate, blue, emerald, amber) without cheesy AI slopes or multi-stop rainbow gradient fills.
- **Enhanced Legibility & Fluid Scaling**: Base font size set to 18px (`1.125rem`) on desktop, scaling down to 16px (`1rem`) on mobile viewports (< 640px) via `@media (max-width: 640px)`.
- **Authentic Device Preview Frames**:
  - **Desktop Viewport**: Edge-to-edge browser canvas with sticky navigation and clean dividers.
  - **Mobile Viewport**: Authentic smartphone shell (`w-[380px] rounded-[44px] border-[8px] border-slate-800 ring-1 ring-slate-700/50`) featuring a realistic status bar (9:41 clock, dynamic island camera pill, 5G indicator) and an internal scrollable viewport.
- **Standardized Button System (`PillButton`)**: Uniform pill-shaped interactive buttons with GSAP hover circle expansion and dual-label sliding transitions. Supports `w-full sm:w-auto` responsive stacking.
- **Interactive Navigation**: Bottom floating `<Dock />` component built with Framer Motion spring physics for dashboard navigation.
- **Lottie & Scroll Animations**: SSR-safe `<LottiePlayer />` component for JSON animations and GSAP `<ScrollStack />` for stacked card animations.

---

## Visual System

### Color Tokens

- **Light Portal Tokens**:
  - `--color-background` (`#f8fafc`) — Primary app background.
  - `--color-primary` (`#004ac6`) — Brand primary blue accent.
  - `--color-surface-container-lowest` (`#ffffff`) — Card surface background.
  - `--color-on-surface` (`#0f172a`) — Primary text color.
  - `--color-on-surface-variant` (`#475569`) — Muted body & label text color.
  - `--color-footer` (`#03152c`) — Dark footer surface background.
- **Live Preview Dark Mode Tokens**:
  - `--preview-dark-bg` (`#070d1d`) — Canvas dark foundation.
  - `--preview-dark-card` (`#0d162a`) — Panel and card surface.
  - `--preview-dark-subtle` (`#111c33`) — Nested rows, cart items, and modals.
  - `--preview-dark-border` (`#1e293b` / `slate-800`) — Hairline borders.
  - `--preview-dark-text` (`#ffffff` headings, `#cbd5e1` body, `#94a3b8` labels).

### Typography Tokens

- **Nohemi**: Primary body and UI heading font (`var(--font-nohemi)`).
- **Thunder**: High-impact display font (`var(--font-thunder)`, `var(--font-thunder-lc)`).
- **Dynamic Google Fonts**: Injected on-demand in the Live Preview modal based on client preference (`Inter`, `Playfair Display`, `Outfit`, `Montserrat`, `Roboto`, `Cinzel`, etc.).
- **Fluid Scale**: 18px base desktop, 16px base mobile for responsive readability across device widths.

---

## Component Hierarchy & Layout Rules

### Public Marketing Site

- **Header Navigation**: `NavbarWrapper` conditionally renders `Navbar` / `StaggeredMenu` on public marketing pages (`/`, `/about`, `/pricing`, `/services`, `/contact`).
- **Services Page (`/services`)**:
  - **Hero**: Architectural grid lines, minimal technical crosshairs (`+`), and interactive Lottie canvas tabs (*Sales Funnel*, *Landing Page*, *E-Commerce*).
  - **Deep-Dive Tiers**: Tier cards with setup fee + monthly/yearly hosting breakdown (`$499 + $20/mo`, `$799 + $30/mo`, `$1,199 + $43/mo`).
  - **Interactive Billing Toggle**: Monthly vs Yearly (Save 20%) cycle switcher.
  - **How It Works**: GSAP-driven `<HowItWorks />` stacked card process component.
  - **Decision Helper**: Interactive 3-choice recommendation engine.
- **Full-Bleed CTA (`CTA.tsx`)**:
  - Full-width `bg-[#004ac6]` blue section.
  - Wave SVG divider (`fill-[#004ac6]`) at the top of `Footer.tsx` matching the CTA silhouette.
- **Footer Component (`Footer.tsx`)**:
  - Dark background (`#03152c`), brand links, email contact, social links, back-to-top button, and edge-to-edge typography.

### Dashboard Application (`/dashboard/*`)

- **Header**: Sticky brand logo header bar with dynamic time-based greeting (*Good morning / afternoon / evening*), notification icon trigger, and interactive profile dropdown menu (*Account Settings*, *Billing & Plan*, *Log Out*).
- **Navigation Dock (`Sidebar.tsx`)**: Bottom floating `<Dock />` component using Framer Motion magnification effects for quick route switching (`/dashboard`, `/dashboard/projects`, `/dashboard/templates`, `/dashboard/billing`, `/dashboard/settings`).
- **Main Views**:
  - **Overview (`/dashboard`)**: Dynamic greeting, project cards, and quick actions. Clicking a project navigates directly to continue editing.
  - **Projects (`/dashboard/projects`)**: Status filter tabs (*All*, *In Progress*, *In Review*, *Live*, *Drafts*), search input, and project grid.
  - **Website Content Studio (`/dashboard/content`)**: 4-section comprehensive form with separated Primary Brand Logo module (featuring transparent checkerboard backdrop) and Brand Photos/PDFs dropzone, paired with the Live Interactive Preview modal.
  - **Templates Gallery (`/dashboard/templates`)**: Industry template showcase with category filters and instant live previews.
  - **New Project Wizard (`/dashboard/projects/new`)**: 4-step wizard (*Type → Details → Content → Review*).
  - **Billing & Subscription (`/dashboard/billing`)**: Plan overview, monthly/yearly cycle toggle (-20% discount), upgrade grid, and invoice history table.
  - **Settings (`/dashboard/settings`)**: Tabbed forms (*Profile Info*, *Security/2FA*, *Notifications*) with Cloudinary avatar image picker and clean "Updated" feedback state.
  - **404 Not Found (`src/app/not-found.tsx`)**: High-aesthetic 404 display with brand typography and architectural grid lines.

---

## Live Interactive Preview Subsystem

- **Multi-Plan Renders**:
  - **`LANDING_PAGE`**: Minimalist authority stats bar, bespoke 3-column services grid, endorsement cards with rating stars, FAQ accordion, and interactive lead consultation intake modal.
  - **`SALES_FUNNEL`**: Urgency countdown timer, 16:9 VSL presentation player, value stack breakdown cards with bonus tags, order bump checkbox, and simulated order completion modal.
  - **`E_COMMERCE`**: Product catalog cards with photography frames, multi-currency pricing, and slide-out cart drawer with direct WhatsApp ordering and gateway test checkout.
- **Viewport Agility**: Switches dynamically between Desktop full-screen mode and Mobile smartphone mockup frame.
- **Theme Switcher**: Live toggle between Light Mode and Midnight Dark Mode inside preview top toolbar.
