# AGENTS.md — starter-prismakit-nestjs

Guide for AI coding agents. User docs: [`README.md`](README.md) · Cache: [`docs/CACHE.md`](docs/CACHE.md) · Storage: [`docs/STORAGE.md`](docs/STORAGE.md) · Repos: [`docs/CREATE_PRISMA_REPOSITORY.md`](docs/CREATE_PRISMA_REPOSITORY.md).

## Project Overview

NestJS e-commerce starter that demos **PrismaKit 2.2.3**: cache-aside, auto-compose, row locks, `execTx` + `afterCommit`, composite PKs, MinIO presign.

| Component | Version |
|-----------|---------|
| NestJS | 11 |
| Prisma | 7 (`prisma-client` + `@prisma/adapter-pg`) |
| PrismaKit | 2.2.3 |
| PostgreSQL | 16 |
| Redis | 7 |
| MinIO | RELEASE.2025-09-07 |
| Node.js | 20+ |

Auth is **slim JWT** (login/register). No RBAC, BullMQ, or branch scoping.

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
tools/                         # codegen-repos, validate-select-compose
```

Per feature (clone of myrpc-be Vendor):

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
| **Controller** | HTTP, guards, Swagger, `formatResponse`. No business logic. |
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

## Import Paths

Use `src/` aliases. Prisma types: `src/infrastructure/prisma/prisma-client`, **not** `@prisma/client`.

Do not edit `src/generated/prisma/`.

## PrismaKit wiring

- One binder: `defineAppRepo = createDefineRepo<Prisma.TypeMap>()`
- `schemaPath: 'prisma/schema.prisma'`
- `autoRegisterModels: true` (Profile, ProductImage)
- `compose: { maxDepth: 6, parallel: true, setCache: true }`
- `cacheModels` allowlist (see `docs/CACHE.md`)
- `queryLog.slowThreshold: 500` + `telemetry.onEvent` → Nest `Logger`
- ESLint `prismakit.configs.recommended`; overrides only for `app.module.ts` + `infrastructure/prisma/**`

## Demo surface

| Model | Feature |
|-------|---------|
| User | `sensitiveFields`, presets, `getFirst` no-cache |
| Profile | compose to-one reverse 1:1 |
| Category | self-relation, `cacheTags` |
| Product | `defaultSetCache`, paginate TTL, stampede, nested compose |
| ProductImage | compose-only |
| FileAsset | cached metadata; MinIO presign |
| Tag | `cache: true` shorthand |
| ProductTag | composite PK, `createMany skipDuplicates` |
| CartItem | composite PK, `upsert` / `deleteMany` |
| Stock | `lock: true`, `FOR UPDATE` in `execTx` |
| Order + OrderItem | checkout `execTx` + `createMany` + `afterCommit` |
| Coupon | `upsert` by `code` |
| AuditLog | uncached — types reject `setCache` |

## Scripts

```bash
npm run start:dev
npm run gen:module
npm run codegen:repos
npm run validate:compose
npm run seed
npm test
```

Docker: `cp build/.env.example build/.env` → `make network` → `make up`.
