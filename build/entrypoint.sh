#!/bin/sh

set -e

echo "Waiting for PostgreSQL to be ready..."

until nc -z starter-prismakit-database-postgres-dev 5432; do
  echo "PostgreSQL not ready yet, retrying..."
  sleep 3
done

echo "PostgreSQL is up!"

echo "Sync node_modules with package-lock.json"
LOCK_HASH=$(md5sum package-lock.json | awk '{print $1}')
if [ ! -f node_modules/.package-lock-hash ] || [ "$(cat node_modules/.package-lock-hash)" != "$LOCK_HASH" ]; then
  npm ci
  echo "$LOCK_HASH" > node_modules/.package-lock-hash
fi

echo "Generate Prisma Client"
npx prisma generate
. ./build/fix-generated-ownership.sh
fix_generated_ownership

echo "Sync schema"
npx prisma db push

echo "Start Server Dev"
npm run start:dev
