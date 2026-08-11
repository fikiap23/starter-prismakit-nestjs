#!/bin/sh

set -e

echo "Waiting for PostgreSQL to be ready..."

until nc -z starter-prismakit-database-postgres-dev 5432; do
  echo "PostgreSQL not ready yet, retrying..."
  sleep 3
done

echo "PostgreSQL is up!"

echo "Generate Prisma Client"
npx prisma generate
. ./build/fix-generated-ownership.sh
fix_generated_ownership

echo "Sync schema"
npx prisma db push

echo "Start Server Dev"
npm run start:dev
