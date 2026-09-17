<!-- @format -->

# About Kiosk

Kiosk is a multi-tenant SaaS platform that makes it simple for small businesses to get online, without making them do the technical work.

**Vision:** A world where every small business, regardless of technical skill, budget, or time, has a professional online presence within days of deciding they need one.

**Mission:** Remove the technical barrier between small business owners and a great website by personalizing proven, pre-built pages for them — combining the speed and affordability of templated tools with the polish and hands-on support of a dedicated fulfillment team.

---

## Core Philosophy: "Done-For-You" Info Submission (No Builder Needed)

A website builder forces the customer to do the heavy lifting: drag-and-drop canvases, choosing columns, tweaking padding, and debugging responsive layouts. That directly contradicts the problem Kiosk solves.

Small business owners choose Kiosk over Wix, Shopify, or Bumpa specifically because they **do not want to sit down and build a website themselves**.

### The Kiosk Workflow:
1. **Submit Info (5 Minutes)**: The business owner fills out a structured intake form (Business Name, Tagline, Story, Offerings/Products, Logo, Brand Photos, Contact, WhatsApp).
2. **Operations Fulfillment & QA**: The Kiosk team reviews submissions in the Admin Studio (`/admin/projects/[id]`), tests links, assigns domains, and clicks **Publish**.
3. **Dynamic Multi-Tenant Rendering**: Visiting `https://<business>.kioosk.online` dynamically pulls the client's persisted data from PostgreSQL and renders a responsive, high-converting live website with 1-click WhatsApp checkout.
4. **Automated Launch Email**: The client receives an automated celebration email with their live link and next-step guides.

**No live builder. No canvas complexity. No steep learning curve.**

---

## Client Dashboard (`/dashboard`)

Logged-in clients access a sleek, professional dashboard featuring:
- **Project Tracking & Management (`/dashboard/projects`)**: Monitor real-time project progress for their specific tenant workspace.
- **Website Intake Studio (`/dashboard/content`)**: Streamlined form supporting Light/Dark themes, Cloudinary media uploads, product catalog pricing, and direct WhatsApp contact configuration.
- **Templates Directory (`/dashboard/templates`)**: Direct dock access to industry-specific templates.
- **Start New Project Wizard (`/dashboard/projects/new`)**: Interactive wizard to order and configure new custom site builds.
- **Billing & Subscription (`/dashboard/billing`)**: Plan status, monthly/yearly billing cycle toggles (-20% discount), and invoice history.
- **Account Settings (`/dashboard/settings`)**: Profile info management, password security, and notification preferences.

---

## Master Admin Operations Backoffice (`/admin`)

Operations and fulfillment center for the Kiosk team:
- **Bento Grid Operations Hub (`/admin`)**: Real-time KPI metrics (Queue, Builds In Progress, Live Sites, Revenue).
- **Fulfillment Queue (`/admin/projects`)**: Filter, search, and inspect customer intake submissions with real customer profile avatars and revision management.
- **Fulfillment & Launch Studio (`/admin/projects/[id]`)**: Full brand assets review, published domain assignment, and 1-click **"Publish Website & Email Client Launch Notification"**.
- **Users & Billing Hubs (`/admin/users`, `/admin/billing`)**: Manage accounts, roles, and master subscription revenue.

---

## Multi-Tenant Subdomain & Brand Isolation

Client sites hosted on Kiosk receive 100% brand isolation:
- **Dynamic Client Favicon**: Client subdomains and custom domains serve the tenant's brand logo (or custom SVG monogram) as their favicon, never the Kiosk logo.
- **Client Branded Preloader**: Live sites render a smooth loading screen featuring the client's own logo.
- **Cinematic Under Construction Screen**: Unpublished subdomains (`DRAFT` / `IN_REVIEW`) display an ambient, animated status screen with progress tracking and direct WhatsApp inquiry buttons.

---

## Short Version (Homepage)

Kiosk is a multi-tenant platform that helps small businesses get online without the stress. Choose a package, tell us about your business in our intake studio, and our team will build and personalize a proven template for you on your own custom subdomain or domain. No complicated tools. No steep learning curve. Just a professional digital presence launched in days.
