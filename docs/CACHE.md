# Repository cache

This starter uses **@prismakit** cache-aside via `defineAppRepo` with `RedisService` as the `CacheAdapter` (`RedisCacheAdapter` + gzip).

## Architecture

```
Service → Repository → CacheAdapter (RedisService) → Prisma → PostgreSQL
```

- Cached repos set `defaultSetCache: true` so user-facing reads cache by default.
- Opt out with `setCache: false` on auth, uniqueness, JWT validate, and write-path checks.
- The repository `cache` block is the source of truth — `cacheModels` is omitted (fail-open).
- Redis fails open — if Redis is down, queries still hit Prisma.

## What is cached

A model caches if its repository sets `cache`. `auditLog` and `orderItem` omit `cache` — TypeScript then omits `setCache` / `invalidateCache`.

`ProductImage` is compose-only (`autoRegisterModels: true`, no cache). `Profile` is a Nest provider with `cache` so nested compose `getMany` is cached under `starter:repo:profile:q:…`. Omitting a cached class from `providers` fails boot (`strictCachedRepos`).

## Invalidation

| Mode        | Behavior              | Typical use                |
| ----------- | --------------------- | -------------------------- |
| `'all'`     | Entity + query caches | `updateById`, `deleteById` |
| `'entity'`  | Entity cache for id   | —                          |
| `'queries'` | Query caches          | `create`                   |
| `'none'`    | Skip                  | Inside `execTx`            |
| `'stale'`   | Soft invalidate       | —                          |

Inside transactions: `invalidate: 'none'`, then `invalidateCache` in `afterCommit`.

`cacheTags` (e.g. `category:<id>` on product lists) are extra indexes — pass the same `tags` on mutations.

## Debug

Set `CACHE_DEBUG=true` to emit `X-Cache: HIT|MISS|BYPASS|SKIP` (requires the `CacheDebugInterceptor` ALS store).

```bash
make cache-flush
make cache-keys MODEL=product
```
