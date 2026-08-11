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
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

export const ProductRepository = defineAppRepo({
  model: 'product',
  scalarFields: Prisma.ProductScalarFieldEnum,
  cache: {
    ttl: 3600,
    defaultSetCache: true,
    nullTtl: 60,
  },
});
export type ProductRepository = AppRepo<'Product', true>;
```

Import `Prisma` from `src/infrastructure/prisma/prisma-client`, never `@prisma/client`.

## Checklist

1. Create via `yarn gen:module <name> --cache` or by hand.
2. Register the repository class in the feature module `providers` (and `exports` if other modules need it).
3. If using `cache`, add the model key to `cacheModels` in `app.module.ts`.
4. Prefer `lock: true` or `lock: '<@@map>'` when any call uses `lock: { mode }`.
5. Nested `select` is composed by PrismaKit — do not use Prisma `include`.
6. Run `yarn validate:compose` after adding nested selects.
