# Creating a Prisma repository

Bind `Prisma.TypeMap` once, then each repo is just runtime options.

```typescript
// src/infrastructure/prisma/define-app-repo.ts
import { createDefineRepo } from '@prismakit/nestjs';
import type { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const defineAppRepo = createDefineRepo<Prisma.TypeMap>();
```

```typescript
// src/modules/{feature}/repositories/{feature}.repository.ts
import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export const ProductRepository = defineAppRepo({
  model: 'product',
  scalarFields: Prisma.ProductScalarFieldEnum,
  cache: {
    ttl: 3600,
    defaultSetCache: true,
    nullTtl: 60,
  },
});
export interface ProductRepository extends InstanceType<
  typeof ProductRepository
> {}
```

`interface … extends InstanceType<typeof Repo>` infers cache fields from the `cache` option. A same-name `type` alias collapses to `any` in the IDE. Import `Prisma` from `src/infrastructure/prisma/prisma-client`, never `@prisma/client`.

Composite `@@id` and `@id` come from schema meta — do not pass `primaryKey` unless you are overriding it.

Relation field names (`images`, `parent`) resolve to registry keys from schema meta. No alias map is needed.

## Checklist

1. Create via `npm run gen:module -- <name> --cache` or by hand.
2. Register the repository class in the feature module `providers` (and `exports` if other modules need it).
3. Prefer `lock: true` or `lock: '<@@map>'` when any call uses `lock: { mode }`.
4. Nested `select` is composed by PrismaKit — do not use Prisma `include`.
5. Run `npm run validate:compose` after adding nested selects.
