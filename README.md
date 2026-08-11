# starter-prismakit-nestjs

NestJS 11 e-commerce starter for **PrismaKit 3.0.0**: cache-aside, auto-compose, row locks, `execTx`, composite PKs, and MinIO presigned PUT/GET.

Layering: Controller → Service → Helper → Repository. Auth is slim JWT (login/register). No RBAC or job queues.

## Quick start

```bash
cp build/.env.example build/.env
make network
make up
```

API: http://localhost:3000 · Swagger: http://localhost:3000/docs (`admin` / `admin`)  
MinIO console: http://localhost:9001 · Redis Commander: http://localhost:8081

Seed (inside the app container, after `make up`):

```bash
make exec
# then:
npx prisma db seed
```

Login: `admin@example.com` / `admin123!`

Local without Docker: copy `build/.env.example` to `.env`, point `DATABASE_URL` / Redis / MinIO at localhost, then `npm install && npx prisma generate && npm run start:dev`.

## Feature map

| Endpoint | PrismaKit demo |
|----------|----------------|
| `POST /auth/register` · `POST /auth/login` | JWT; User `withPassword` is never cached |
| `GET /users/me` | compose Profile 1:1 |
| `GET /categories` | self-relation + `cacheTags` |
| `GET /products` · `GET /products/:id` | paginate TTL, stampede, nested compose |
| `PATCH /products/:id` | tagged invalidation |
| `POST /admin/products/bulk-deactivate` | `updateMany` |
| `POST /products/:id/tags` | composite PK `createMany skipDuplicates` |
| `PUT /cart/items` · `DELETE /cart` | composite PK `upsert` / `deleteMany` |
| `POST /checkout` | `execTx` + `FOR UPDATE` + `afterCommit` |
| `PUT /coupons/:code` | `upsert` by unique `code` |
| `POST /files` · `POST /files/:id/confirm` · `GET /files/:id/download` | MinIO presign |

## MinIO flow

1. `POST /files` → `PENDING_UPLOAD` + presigned **PUT**
2. Client uploads bytes to MinIO
3. `POST /files/:id/confirm` → `statObject` → `READY`
4. `GET /files/:id/download` → presigned **GET**

See [`docs/STORAGE.md`](docs/STORAGE.md).

## Makefile

| Target | What |
|--------|------|
| `make network` | create `starter-network` |
| `make up` / `down` / `logs` / `exec` | dev compose |
| `make up-prod` / `build-prod` | production compose |
| `make up-migrate` | isolated migrate job |
| `make cache-flush` | Redis `FLUSHDB` |
| `make cache-keys MODEL=product` | scan `starter:repo:product:*` |

## Tests

```bash
npm test
```

- Product cache hit/miss via `@prismakit/memory`
- Checkout with fake repositories (`invalidate: 'none'` then `afterCommit`)
- StorageService presign with a mocked MinIO client

## Docs

- [`AGENTS.md`](AGENTS.md) — agent conventions
- [`docs/CACHE.md`](docs/CACHE.md)
- [`docs/STORAGE.md`](docs/STORAGE.md)
- [`docs/CREATE_PRISMA_REPOSITORY.md`](docs/CREATE_PRISMA_REPOSITORY.md)
