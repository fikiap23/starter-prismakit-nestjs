# AGENTS.md — starter-prismakit-nestjs

Guide for AI coding agents. User docs: [`README.md`](README.md) · Cache: [`docs/CACHE.md`](docs/CACHE.md) · Storage: [`docs/STORAGE.md`](docs/STORAGE.md) · Repos: [`docs/CREATE_PRISMA_REPOSITORY.md`](docs/CREATE_PRISMA_REPOSITORY.md).

## Project Overview

NestJS e-commerce starter that demos **PrismaKit 3.0.5**: cache-aside, auto-compose, row locks, `execTx` + `afterCommit`, composite PKs, MinIO presign.

| Component | Version |
|-----------|---------|
| NestJS | 11 |
| Prisma | 7 (`prisma-client` + `@prisma/adapter-pg`) |
| PrismaKit | 3.0.5 |
| PostgreSQL | 16 |
| Redis | 7 |
| MinIO | RELEASE.2025-09-07 |
| Node.js | 20+ |

Auth is **slim JWT** (login/register). No RBAC, job queues, or branch scoping. HTTP routes have **no** `/api` or `/v1` prefix.

## Folder Structure

```
src/
├── app.module.ts
├── main.ts
├── generated/prisma/          # gitignored; prisma generate
├── config/
├── common/
├── infrastructure/
│   ├── prisma/                # defineAppRepo, PrismaService, prisma-client re-export
│   ├── redis/
│   └── storage/               # MinIO StorageService (presign PUT/GET)
└── modules/{auth,user,category,product,cart,stock,order,coupon,file-asset,health}/
prisma/
build/                         # Docker + compiled output (build/compile/)
```

Per feature:

```
modules/<feature>/
  <feature>.module.ts
  controllers/
  services/          # handle* only
  helpers/
  repositories/
  dto/
  types/select-*.type.ts
  types/where-*.type.ts
```

## Architecture

```
Controller  →  Service  →  Helper  →  Repository  →  Prisma / Redis
```

| Layer | Rules |
|-------|--------|
| **Controller** | HTTP, guards, Swagger, `formatResponse` / `errorHandler`. No business logic. |
| **Service** | **Only** `handle*` methods. Transactions via `TransactionService.execTx`. |
| **Helper** | `@Injectable` `*.helper.ts`. Never inject `PrismaService`. |
| **Repository** | `defineAppRepo` only. Nested `select`, never Prisma `include`. |

### Forbidden

| Forbidden | Required instead |
|-----------|------------------|
| `PrismaService` in `src/modules/**` services/helpers/controllers | `*Repository` / `TransactionService` |
| `prisma.<model>.*` outside `repositories/` | Repository method with `select` |
| Fat services with private business methods | Thin `handle*` + `*.helper.ts` |

```typescript
await this.tx.execTx(
  async (tx) => {
    await this.stocks.getFirst({ tx, where, select, lock: { mode: 'update' }, setCache: false });
    await this.orders.create({ tx, data, invalidate: 'none' });
  },
  async () => {
    await this.orders.invalidateCache({});
    await this.stocks.invalidateCache({ id });
  },
);
```

## Adding a feature

1. Scaffold with `npm run gen:module -- <name> --cache` (or copy an existing module).
2. Define the repo with `defineAppRepo` — see [`docs/CREATE_PRISMA_REPOSITORY.md`](docs/CREATE_PRISMA_REPOSITORY.md).
3. Register the class in the feature module `providers` (`exports` if other modules need it).
4. Put selects in `types/select-*.type.ts` (presets: `minimal` / `general`). Filters in `types/where-*.type.ts`.
5. Controllers: `@Res()` + `formatResponse` / `errorHandler`. Use `@SwaggerEndpoint`. Guard with `JwtGuard` when auth is required.
6. Run `npm run validate:compose` after nested selects.

## Import Paths

Use `src/` aliases. Prisma types: `src/infrastructure/prisma/prisma-client`, **not** `@prisma/client`.

Do not edit `src/generated/prisma/`.

## PrismaKit wiring

- One binder: `defineAppRepo = createDefineRepo<Prisma.TypeMap>()` in `src/infrastructure/prisma/define-app-repo.ts`
- `schemaPath` defaults to `prisma/schema.prisma` (relation fields resolve from schema meta)
- `autoRegisterModels: true` (ProductImage; Profile is an explicit cached provider)
- `strictCachedRepos: true` (default) — boot fails if a `cache` repo class is missing from Nest `providers`
- `compose: { maxDepth: 6, parallel: true, setCache: true }`
- Repo `cache` config is the source of truth (no `cacheModels` allowlist)
- `queryLog.slowThreshold: 500` + `telemetry.onEvent` → Nest `Logger`
- ESLint `prismakit.configs.recommended`; overrides only for `app.module.ts` + `infrastructure/prisma/**`

## Demo surface

| Model | Feature |
|-------|---------|
| User | `sensitiveFields`, presets, `getFirst` no-cache |
| Profile | compose to-one reverse 1:1, cached `getMany` |
| Category | self-relation, `cacheTags` |
| Product | `defaultSetCache`, paginate TTL, stampede, nested compose |
| ProductImage | compose-only |
| FileAsset | cached metadata; MinIO presign |
| Tag | `cache: true` shorthand |
| ProductTag | composite PK, `createMany skipDuplicates` |
| CartItem | composite PK, `upsert` / `deleteMany` |
| Stock | `lock: true`, `FOR UPDATE` in `execTx` |
| Order + OrderItem | checkout `execTx` + `createMany` + `afterCommit` |
| Coupon | `upsert` by unique `code` |
| AuditLog | uncached — types reject `setCache` |

## Scripts

```bash
npm run start:dev
npm run gen:module
npm run validate:compose
npm run seed
npm test
```

Docker: `cp build/.env.example build/.env` → `make network` → `make up`.
