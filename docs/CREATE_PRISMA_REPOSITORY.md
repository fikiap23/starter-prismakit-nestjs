# Creating a Prisma repository

Bind `Prisma.TypeMap` once, then each repo is just runtime options.

```typescript
// src/infrastructure/prisma/define-app-repo.ts
import { createDefineRepo } from '@prismakit/nestjs';
import type { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const defineAppRepo = createDefineRepo<Prisma.TypeMap>({
  cache: { ttl: 86_400, nullTtl: 60, defaultSetCache: true },
});
```

```typescript
// src/modules/{feature}/repositories/{feature}.repository.ts
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class ProductRepository extends defineAppRepo({
  model: 'product',
  cache: true, // inherits app-wide defaults
}) {}
```

Omit `cache` when the model should not be cached. `setCache` / `invalidateCache` then disappear from the type. Import `Prisma` from `src/infrastructure/prisma/prisma-client`, never `@prisma/client`.

Scalars, composite `@@id`, and `@id` come from schema meta (`PrismaKitModule` `schemaPath` / `dmmf`) — do not pass `scalarFields` or `primaryKey`.

Relation field names (`images`, `parent`) resolve to registry keys from schema meta. No alias map is needed.

Use `export class … extends defineAppRepo({…}) {}` (not `const`). A class declaration is the instance type Nest injects; `export const` cannot be used as a type.

## Checklist

1. Create via `npm run gen:module -- <name> --cache` or by hand.
2. Register the repository class in the feature module `providers` (and `exports` if other modules need it).
3. Put selects in `types/select-*.type.ts`.
4. Run `npm run validate:compose` after nested selects.
