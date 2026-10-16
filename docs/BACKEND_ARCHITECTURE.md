<!-- @format -->

# Backend Software Architecture & Design Patterns — Kiosk

## Overview

This document specifies the software architecture, SOLID design principles, design patterns, immutability conventions, and Test-Driven Development (TDD) methodologies implemented in the `Kiosk` backend system.

---

## 1. SOLID Design Principles Implementation

The codebase adheres strictly to the five SOLID principles of object-oriented and modular software engineering:

### 1. Single Responsibility Principle (SRP)
Every class and module has one, and only one, reason to change.
- **Repository Layer**: Handles database interaction only (`ProjectRepository`).
- **Service Layer**: Contains business logic execution only (`ProjectService`).
- **Controller Layer**: Parses HTTP input/output schema only (`ProjectController`).

### 2. Open/Closed Principle (OCP)
Software entities are open for extension, but closed for modification.
- **Payment Processing**: Abstract `PaymentProvider` interface allows adding Stripe, Bachs, or PayPal drivers without modifying core checkout logic.

### 3. Liskov Substitution Principle (LSP)
Subtypes must be substitutable for their base types without altering system correctness.
- Concrete implementations of `TemplateEngine` (e.g., `LandingPageEngine`, `StoreEngine`) can be swapped seamlessly in the generator pipeline.

### 4. Interface Segregation Principle (ISP)
Clients should not be forced to depend on methods they do not use.
- Granular interfaces like `ReaderRepository<T>` and `WriterRepository<T>` instead of monolithic interfaces.

### 5. Dependency Inversion Principle (DIP)
High-level modules do not depend on low-level modules; both depend on abstractions.
- Services accept injected interface abstractions via Dependency Injection (DI) containers.

## 2. Multi-Tenant Software Architecture & Context Isolation

The Kiosk backend is designed as a Multi-Tenant SaaS application where multiple business accounts share application infrastructure while maintaining complete isolation of data, configuration, custom domains, and sessions.

### Multi-Tenant Core Patterns:
- **Tenant Context Provider**: Context-aware request middleware extracts tenant identity from host headers or session tokens and binds `tenantId` to downstream request context.
- **Tenant Repository Decorator**: Database queries automatically inject `WHERE tenant_id = :tenantId` filters to ensure zero data leakage across tenants.
- **Dynamic Domain Resolution**: Matches subdomains (`subdomain.kiosk.site`) and custom domains (`customdomain.com`) to tenant configurations in edge KV cache.

---

## 3. Software Design Patterns Specification

### 1. Factory Pattern (`SiteTemplateFactory`)
Encapsulates object instantiation based on requested client service tier (`landing`, `funnel`, `store`).

```typescript
export interface ServiceTemplate {
  render(): TemplateOutput;
}

export class SiteTemplateFactory {
  public static createTemplate(tier: "landing" | "funnel" | "store"): ServiceTemplate {
    switch (tier) {
      case "landing":
        return new LandingPageTemplate();
      case "funnel":
        return new SalesFunnelTemplate();
      case "store":
        return new EcommerceStoreTemplate();
      default:
        throw new Error(`Unsupported tier: ${tier}`);
    }
  }
}
```

### 2. Decorator Pattern (`LoggingDecorator` & `CachingDecorator`)
Dynamically adds cross-cutting concerns (logging, metrics, caching) to services without modifying base code.

```typescript
export class CachingProjectServiceDecorator implements IProjectService {
  constructor(
    private readonly inner: IProjectService,
    private readonly cache: ICacheProvider
  ) {}

  async getProjectById(id: string): Promise<Project> {
    const key = `project:${id}`;
    const cached = await this.cache.get<Project>(key);
    if (cached) return cached;

    const result = await this.inner.getProjectById(id);
    await this.cache.set(key, result, 300);
    return result;
  }
}
```

### 3. Singleton Pattern (`DatabaseConnectionPool` & `RedisClient`)
Ensures a class has only one instance while providing a global point of access.

```typescript
export class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;

  private constructor() {
    // Initialize pool
  }

  public static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }
}
```

### 4. Observable Pattern (`ProjectEventPublisher`)
Implements an event-driven publish-subscribe model for asynchronous decoupled operations (e.g. sending welcome email on project deployment).

```typescript
export interface Observer<T> {
  update(event: T): Promise<void>;
}

export class ProjectSubject {
  private observers: Observer<ProjectDeployedEvent>[] = [];

  public subscribe(observer: Observer<ProjectDeployedEvent>): void {
    this.observers.push(observer);
  }

  public async notify(event: ProjectDeployedEvent): Promise<void> {
    await Promise.all(this.observers.map(o => o.update(event)));
  }
}
```

---

## 3. Immutability & State Safety

To prevent accidental side-effects and race conditions in concurrent request threads:
1. **Readonly Domain DTOs**: All request DTOs and domain events use TypeScript `readonly` modifiers and Object.freeze().
2. **Pure Functions**: Business transformers return new instances instead of mutating input objects.

```typescript
export interface ImmutableProjectState {
  readonly id: string;
  readonly name: string;
  readonly status: "DRAFT" | "IN_REVIEW" | "LIVE";
  readonly createdAt: Readonly<Date>;
}
```

---

## 4. Test-Driven Development (TDD) Workflow

The development methodology follows strict **Red-Green-Refactor** cycles:

```
┌───────────────────────────────────────────────────────────┐
│                     1. RED                                │
│ Write a failing unit / integration test for requirement.   │
└─────────────┬─────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────┐
│                     2. GREEN                              │
│ Write minimum production code required to make test pass. │
└─────────────┬─────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────┐
│                     3. REFACTOR                           │
│ Clean code structure while keeping test suite green.      │
└───────────────────────────────────────────────────────────┘
```

### Test Suite Structure
- **Unit Tests**: Isolated unit testing using Vitest / Jest mocks (`*.spec.ts`).
- **Integration Tests**: Database & Cache integration testing with Dockerized PostgreSQL (`*.test.ts`).
- **End-to-End API Tests**: HTTP contract testing with Supertest (`*.e2e-spec.ts`).
