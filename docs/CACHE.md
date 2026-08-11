# Repository cache

This starter uses **@prismakit** cache-aside via `defineAppRepo` with `RedisService` as the `CacheAdapter` (`RedisCacheAdapter` + gzip).

## Architecture

```
Service → Repository → CacheAdapter (RedisService) → Prisma → PostgreSQL
```

- Cached repos set `defaultSetCache: true` so user-facing reads cache by default.
- Opt out with `setCache: false` on auth, uniqueness, JWT validate, and write-path checks.
- `cacheModels` in `app.module.ts` is a **strict allowlist**.
- Redis fails open — if Redis is down, queries still hit Prisma.

## Allowlist

Cached models in this starter:

`user`, `category`, `product`, `tag`, `productTag`, `stock`, `cartItem`, `coupon`, `order`, `fileAsset`

`auditLog` and `orderItem` are intentionally uncached — TypeScript omits `setCache` / `invalidateCache`.

`ProductImage` and `Profile` are compose-only (`autoRegisterModels: true`).

## Invalidation

| Mode | Behavior | Typical use |
|------|----------|-------------|
| `'all'` | Entity + query caches | `updateById`, `deleteById` |
| `'entity'` | Entity cache for id | — |
| `'queries'` | Query caches | `create` |
| `'none'` | Skip | Inside `execTx` |
| `'stale'` | Soft invalidate | — |

Inside transactions: `invalidate: 'none'`, then `invalidateCache` in `afterCommit`.

`cacheTags` (e.g. `category:<id>` on product lists) are extra indexes — pass the same `tags` on mutations.

## Debug

Set `CACHE_DEBUG=true` to emit `X-Cache: HIT|MISS|BYPASS|SKIP` (requires the `CacheDebugInterceptor` ALS store).

```bash
make cache-flush
make cache-keys MODEL=product
```
