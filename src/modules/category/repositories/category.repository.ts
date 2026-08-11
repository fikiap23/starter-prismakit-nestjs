import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';
import { DAY } from 'src/common/constants';

export class CategoryRepository extends defineAppRepo({
  model: 'category',
  scalarFields: Prisma.CategoryScalarFieldEnum,
  cache: {
    ttl: DAY,
    defaultSetCache: true,
    nullTtl: 60,
  },
}) {}
