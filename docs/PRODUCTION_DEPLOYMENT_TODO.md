<!-- @format -->

# Production Deployment Checklist & Technical TODO — Kiosk

This checklist defines every step required to deploy **Kiosk** to production on **Vercel / AWS** with **Neon PostgreSQL**, **Bachs Payments**, **Upstash Redis**, and **Wildcard Subdomain Routing**.

---

## 📋 1. Database & Persistence (Neon PostgreSQL)

- [ ] **Provision Production Database**: Create a production PostgreSQL project on [Neon.tech](https://neon.tech).
- [ ] **Set Connection String**: Copy the pooling connection URI into Vercel Environment Variables (`DATABASE_URL`).
- [ ] **Deploy Schema**: Run `npm run db:push` to deploy all 8 core tables:
  - `users`
  - `accounts`
  - `sessions`
  - `verification_tokens`
  - `tenants`
  - `projects`
  - `subscriptions`
  - `idempotency_keys`

---

## 🔐 2. Authentication & OAuth Security (Auth.js v5)

- [ ] **Generate Production Secret**: Run `npx auth secret` and copy the 32-character secret into `AUTH_SECRET`.
- [ ] **Set Application URL**: Set `AUTH_URL="https://kiosk.site"` (or your Vercel deployment URL).
- [ ] **Google OAuth Production Setup**:
  - Open [Google Cloud Console](https://console.cloud.google.com).
  - Add Authorized Redirect URI: `https://kiosk.site/api/auth/callback/google`.
  - Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
- [ ] **GitHub OAuth Production Setup**:
  - Open GitHub Developer Settings -> OAuth Apps.
  - Add Authorization Callback URL: `https://kiosk.site/api/auth/callback/github`.
  - Set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.

---

## 💳 3. Payment Gateway & Webhooks (Bachs)

- [ ] **Switch to Live API Keys**:
  - Navigate to Bachs Dashboard -> Settings -> API Keys.
  - Copy Live Key into `BACHS_SECRET_KEY` (`sk_live_...`).
- [ ] **Configure Webhook Endpoint**:
  - Open Bachs Dashboard -> Settings -> Webhooks.
  - Set Webhook URL to: `https://kiosk.site/api/webhooks/bachs`.
  - Set Webhook Secret to a strong secret.
  - Copy the exact secret to Vercel Environment Variable: `BACHS_WEBHOOK_SECRET`.

---

## ⚡ 4. Distributed Caching & Rate Limiting (Upstash Redis)

- [ ] **Create Production Redis Instance**: Provision a serverless Redis cluster on [Upstash.com](https://upstash.com).
- [ ] **Set Redis Credentials**: Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to production environment variables to enable:
  - Sliding window rate limiting on auth & API routes.
  - Multi-layer L2 cache reads for tenant project metadata.
  - Payment double-charge idempotency locks (`SETNX`).
  - Webhook event deduplication.

---

## 📧 5. Transactional Email System (Resend)

- [ ] **Domain Verification**: Add DNS records (DKIM, SPF, DMARC) in your domain registrar (Cloudflare / Namecheap) to verify `kiosk.site` in Resend Dashboard.
- [ ] **Set API Key**: Set `RESEND_API_KEY` and `EMAIL_FROM="Kiosk <noreply@kiosk.site>"`.

---

## 🌐 6. Wildcard Subdomain & Edge Routing (`*.kiosk.site`)

- [ ] **DNS Wildcard Record**: Add a wildcard CNAME record in your DNS provider:
  - Name: `*`
  - Target: `cname.vercel-dns.com`
- [ ] **Vercel Wildcard Domain**: Add `*.kiosk.site` to Vercel Project Domains.

---

## 📊 7. Observability & Error Tracking (Sentry & Axiom)

- [ ] **Sentry Error Tracking**: Create a Next.js project on Sentry and set `NEXT_PUBLIC_SENTRY_DSN`.
- [ ] **Structured Logging**: Enable Vercel / Axiom log draining to capture JSON logs from `Logger`.

---

## 🧪 8. Final Build & Verification Pre-Flight

- [ ] **Type Check**: Execute `node node_modules/typescript/lib/tsc.js --noEmit` locally (Must return 0 errors).
- [ ] **Production Build Test**: Execute `npm run build` locally to verify zero build errors.
- [ ] **Live Preview Verification**: Verify Live Preview modal and Content Studio API routes (`POST /api/projects/content`) across Desktop and Mobile viewports.
