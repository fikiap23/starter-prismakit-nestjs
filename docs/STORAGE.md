# MinIO presigned uploads

Binary never goes through Nest. `FileAsset` stores metadata only; the browser talks to MinIO with short-lived URLs.

## Flow (JWT)

1. `POST /files` → row `PENDING_UPLOAD` + **presigned PUT URL** (TTL 900s)
2. Client `PUT` the bytes directly to MinIO
3. `POST /files/:id/confirm` → `statObject`, status `READY`
4. `GET /files/:id/download` → **presigned GET URL** (or 302 if `Accept` is not JSON)

Purposes in this starter: `PRODUCT_IMAGE` | `AVATAR`.

## Config

| Env | Role |
|-----|------|
| `MINIO_ENDPOINT` | Internal API host (compose service name in Docker) |
| `MINIO_PORT` | Internal API port (9000) |
| `MINIO_USE_SSL` | `true` / `false` |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Credentials |
| `MINIO_PUBLIC_URL` | Browser-facing base URL |
| `MINIO_PRESIGN_ENDPOINT` | Optional host used to **sign** PUT URLs for the browser. Empty → `MINIO_PUBLIC_URL` |
| `MINIO_BUCKET_NAME` | Default `starter` |

`StorageService` keeps two MinIO clients: one for cluster-internal `statObject` / `presignedGetObject`, and a presign client whose endpoint is reachable from the browser.

Console: http://localhost:9001 (dev compose).
