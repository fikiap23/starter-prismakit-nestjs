#!/bin/sh

. ./build/fix-generated-ownership.sh

echo "Generate Prisma Client"
npx prisma generate
fix_generated_ownership

echo "Sync schema (db push)"
npx prisma db push

if [ "$RUN_SEED" = "true" ] || [ "$RUN_SEED" = "1" ]; then
  echo "Seed Database"
  npx prisma db seed
fi

echo "Start Server Prod"
node build/compile/src/main.js
