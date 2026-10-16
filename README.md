<!-- @format -->

# Kiosk — Multi-Tenant Web Platform for Small Businesses

## Overview

`kiosk` is a multi-tenant web platform built with Next.js 16, React 19, Auth.js v5, and Drizzle ORM PostgreSQL. The platform focuses on high-quality visuals, smooth interactions, and a multi-tenant architecture allowing small businesses to host custom websites, sales funnels, and e-commerce stores on custom subdomains or domains.

## About Kiosk (Multi-Tenant SaaS Platform)

**Kiosk makes it simple for small businesses to get online with dedicated multi-tenant workspaces.**

Most small business owners don't need a complicated website builder. They just need a clean place to show what they offer, share their contact details, and start selling — without spending weeks learning tools or paying high monthly fees.

### Multi-Tenant Capabilities

- **Tenant Workspace Isolation**: Row-level database isolation (`tenants` table) for projects, billing subscriptions, and custom domains.
- **Custom Domains & Subdomains**: Dynamic routing via Next.js Edge Middleware (`business.kioosk.online` or `customdomain.com`).
- **Brand Isolation**: Dedicated client dynamic favicon, client-branded preloader, and cinematic Under Construction page for unlaunched subdomains.
- **Subscription Packages**:
  - **Landing Page ($20/mo, $192/yr)** — A simple, professional page with business info, contact details, and WhatsApp integration.
  - **Sales Funnel ($30/mo, $288/yr)** — Up to 5 conversion pages with lead capture and CRM integration.
  - **Online Store ($43/mo, $408/yr)** — A full e-commerce store with product catalog, cart, and payment gateways.

Everything is hosted and managed for you. No technical setup. No complicated builders. Just fill in your details and go live.

---

## Documentation Links

- Product Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)
- Multi-Tenant Architecture & About: [docs/ABOUT.md](docs/ABOUT.md)
- Backend Architecture: [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md)
- Backend System Design: [docs/BACKEND_SYSTEM_DESIGN.md](docs/BACKEND_SYSTEM_DESIGN.md)
- Backend TODO Checklist: [docs/BACKEND_TODO.md](docs/BACKEND_TODO.md)
- Production Deployment Checklist: [docs/PRODUCTION_DEPLOYMENT_TODO.md](docs/PRODUCTION_DEPLOYMENT_TODO.md)
- Weekly Technical TODO: [docs/WEEKLY_TODO.md](docs/WEEKLY_TODO.md)
- Design System: [docs/DESIGN_ARCHITECTURE.md](docs/DESIGN_ARCHITECTURE.md)
- Developer Guidelines: [docs/DEVELOPER_DOCUMENTATION.md](docs/DEVELOPER_DOCUMENTATION.md)

## Getting Started (Development)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local` (copy template from `.env.example`).

3. Push PostgreSQL schema:

   ```bash
   npx drizzle-kit push
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to preview locally.

## Tech Stack

- **Framework**: Next.js 16 (App Router & Edge Middleware)
- **Database & ORM**: Drizzle ORM + Neon PostgreSQL (Multi-tenant schema)
- **Authentication**: Auth.js v5 (NextAuth) + Password Hashing (bcryptjs 12 rounds)
- **Payments**: Bachs.io (HMAC-SHA256 Webhooks & Multi-Currency Hosted Checkout Sessions)
- **Media Storage**: Cloudinary (Multi-tenant isolated buckets)
- **Transactional Email**: Resend API (`src/lib/email.ts`)
- **Rate Limiting & Cache**: Upstash Redis (Sliding Window & Idempotency Locks)
- **Styling**: Vanilla Tailwind CSS v4 & custom utility design tokens
- **Animations**: GSAP, Framer Motion, Lenis Smooth Scroll

## License

Private repository. All rights reserved.
