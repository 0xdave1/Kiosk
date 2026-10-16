<!-- @format -->

# Backend System Design & Infrastructure Specification — Kiosk

## Executive Overview

`Kiosk` backend is designed as an enterprise-grade, highly scalable, stateless multi-tenant microservice/serverless-hybrid system built to support high-throughput website provisioning, real-time client analytics, custom domain routing, and tenant subscriptions.

This document details the multi-tenant architecture, topologies, load balancing, rate limiting, database strategies, security standards, caching layers, and idempotency guarantees.

---

## Multi-Tenant Architecture & Data Isolation

Kiosk implements a **Row-Level Pooled Database Multi-Tenant Pattern**:

1. **Tenant Model (`tenants` Table)**:
   - Every business client owns an isolated `tenant_id`.
   - Tenants possess subdomains (e.g. `bakery.kiosk.site`) and custom domains (e.g. `bakery.com`).

2. **Data Isolation Layer**:
   - All tenant-owned tables (`projects`, `subscriptions`, `invoices`, `idempotency_keys`) strictly enforce `tenant_id` foreign keys with cascade deletions.
   - All API endpoints filter queries by `tenant_id` extracted from the verified session context.

3. **Dynamic Host & Subdomain Routing**:
   - Next.js Edge Middleware inspects the incoming `Host` header.
   - Subdomain and custom domain host requests are matched against Redis cache to resolve `tenant_id` in sub-millisecond response times.

---

## 1. System Topology & Infrastructure Layout

```
                                  [ Internet Clients / Mobile ]
                                                │
                                    (HTTPS / TLS 1.3 - SSL)
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │    Cloudflare CDN     │
                                    │  WAF / DDoS Shield    │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │   Layer 7 Load        │
                                    │   Balancer (ALB /     │
                                    │  NGINX / Edge Router) │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ Upstash Redis Sliding │
                                    │  Window Rate Limiter  │
                                    └───────────┬───────────┘
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        │ Stateless Worker Pool (Node.js/Next.js/Go)     │
                        │ Auto-Scaled Horizontally across 3 Availability │
                        │ Zones (Multi-threaded & Event-Driven Workers) │
                        └───────┬───────────────┬───────────────┬───────┘
                                │               │               │
                                ▼               ▼               ▼
                       ┌────────────────┐ ┌───────────┐ ┌───────────────┐
                       │ Redis L2 Cache │ │ PostgreSQL│ │ Event Bus     │
                       │ Cluster (LRU)  │ │ Primary/  │ │ (Inngest /    │
                       │                │ │ Replicas  │ │ QStash)       │
                       └────────────────┘ └───────────┘ └───────────────┘
```

---

## 2. Load Balancing Strategy & High Availability

### Layer 4 vs Layer 7 Load Balancing Architecture
- **Layer 4 Load Balancer (Network Level — AWS NLB / Cloudflare Anycast)**:
  - Operates at the transport layer (TCP/IP).
  - Routes raw TCP packets with ultra-low latency (< 1ms overhead) across multi-region edge nodes.
  - Handles high-volume DDoS mitigation and initial connection distribution.

- **Layer 7 Load Balancer (Application Level — AWS ALB / NGINX / Vercel Edge Router)**:
  - Route-based traffic distribution based on path headers (`/api/v1/projects/*`, `/api/v1/auth/*`).
  - SSL/TLS 1.3 Termination at the edge balancer using RSA-4096 / ECC security certificates.
  - **Algorithm**: Weighted Round-Robin with dynamic health checks (`GET /healthz` returning `200 OK` within `200ms`).
  - Automatically drains unhealthy instances and scales up worker pools when CPU/Memory load exceeds 70%.

- **Stateless Horizontal Scaling**:
  - Worker nodes store zero session state in local memory. All session tokens are stored in distributed Upstash Redis clusters, allowing instant horizontal scaling without session drops.

---

## 3. Rate Limiting & Distributed Throttling Architecture

To prevent brute-force credential attacks, API abuse, and DDoS vectors, Kiosk enforces a **Sliding Window Rate Limiting Algorithm** using **Upstash Redis (`@upstash/ratelimit`)**:

### Sliding Window Rate Limiting Blueprint
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Create a sliding window rate limiter allowing 5 requests per 1 minute for Auth endpoints
export const authRatelimit = new Ratelimit({ 
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@kiosk/ratelimit/auth",
});

// Standard API Rate Limiter allowing 100 requests per 1 minute
export const apiRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "@kiosk/ratelimit/api",
});
```

### Rate Limiting Rules & Tiers

| Endpoint Category | Route Pattern | Rate Limit Threshold | Action on Breach |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/api/auth/login`, `/api/auth/register` | **5 requests / 1 min** per IP | HTTP `429 Too Many Requests` |
| **Public API** | `/api/v1/public/*` | **60 requests / 1 min** per IP | HTTP `429 Too Many Requests` |
| **Content Studio & Projects** | `/api/projects`, `/api/projects/content` | **120 requests / 1 min** per User ID | HTTP `429 Too Many Requests` |
| **Client Workspace** | `/api/v1/projects/*`, `/checkout` | **200 requests / 1 min** per User ID | HTTP `429 Too Many Requests` |
| **Webhooks** | `/api/webhooks/bachs`, `/api/webhooks/stripe` | **500 requests / 1 min** (IP Whitelisted) | HTTP `429 Too Many Requests` |

### Rate Limit HTTP Headers Response
When a client makes a request, the middleware injects standard rate limit headers:
- `X-RateLimit-Limit`: Maximum allowable requests in current window (e.g., `5`).
- `X-RateLimit-Remaining`: Remaining request quota (e.g., `3`).
- `X-RateLimit-Reset`: UTC timestamp when current window resets.

---

## 4. Database Architecture & Persistence Layer

### Primary / Replica PostgreSQL Topology
- **Primary Node (Read-Write)**: Handles all mutating SQL operations (`INSERT`, `UPDATE`, `DELETE`) enclosed within ACID transactions.
- **Read Replicas (Read-Only)**: Distributed read replicas handle high-throughput query operations (`SELECT`) using connection pools managed by **PgBouncer**.
- **Schema & Migrations**: Managed via Drizzle ORM / Prisma ORM migration pipelines with strict Version Control locks.

### Database Indexing & Connection Pooling
```
┌─────────────────────────────────────────────────────────────┐
│                    Connection Manager                       │
│                        (PgBouncer)                          │
│   Max Pool Size: 100 Connections | Idle Timeout: 10,000ms   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │  PostgreSQL Primary│          │ Database Replicas  │
    └────────────────────┘          └────────────────────┘
```

---

## 5. Multi-Layer Caching Architecture

### Cache-Aside Strategy (L1 + L2)
1. **L1 In-Memory Cache (Process Level)**: Short-lived LRU (Least Recently Used) cache for high-frequency configuration tokens (TTL: 5 seconds).
2. **L2 Distributed Cache (Redis Cluster)**:
   - Upstash Redis Cluster providing sub-5ms latency for user permissions, active sessions, and website template metadata.
   - **Cache Invalidation**: Event-driven cache eviction triggered by Inngest/QStash events on entity update.

---

## 6. Security & Authentication Architecture

### 1. SSL/TLS & Transport Security
- TLS 1.3 strict enforcement across all endpoints.
- Strict HTTP Security Headers: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.

### 2. OAuth 2.0 & OpenID Connect (OIDC)
- Integrated authentication supporting Google OAuth 2.0 and GitHub OAuth.
- Authorization Code Flow with PKCE (Proof Key for Code Exchange) to eliminate interception vectors on mobile/SPA clients.

### 3. Session Token Lifecycle & Checkout Protection
- **Session Tokens**: Active lifetime set to **6 hours** (`maxAge: 6 * 60 * 60`).
- **Payment Grace Window**: Automatic logout timer is suspended while a user is actively on `/checkout` (`isCheckoutInProgress` state) or completing 3D Secure bank redirects.
- **Revocation & Blacklisting**: Token revocation enforced via database and Redis token blacklist lookup on sensitive API requests.

---

## 7. Idempotency Guarantees

To ensure financial and provisioning operations (e.g. plan checkout or site provisioning) execute exactly once even under network retries:

### Idempotency Key Pipeline
1. Client sends `Idempotency-Key: <UUID-v4>` header with `POST /api/v1/checkout`.
2. Middleware checks Redis lock: `SETNX idempotency:<key> PENDING EX 60`.
3. If key exists:
   - If status is `COMPLETED`: Return cached HTTP response payload immediately without re-processing.
   - If status is `PENDING`: Return `409 Conflict` (Request currently processing).
4. If key is new: Process transaction, update Redis key to `COMPLETED` with response payload, and commit SQL transaction.

---

## 8. Multithreading & Event-Driven Concurrency

- **Node.js Worker Threads / Worker Pool**: Offloads CPU-intensive tasks (PDF invoice generation, asset image optimization, SSL certificate creation) away from the main event loop thread.
- **Async Non-Blocking I/O**: Handles database queries and network HTTP requests asynchronously via Promises/Event Loop to prevent thread blocking.
