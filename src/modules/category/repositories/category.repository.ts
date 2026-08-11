import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';
import { DAY } from 'src/common/constants';

export const CategoryRepository = defineAppRepo({
  model: 'category',
  scalarFields: Prisma.CategoryScalarFieldEnum,
  cache: {
    ttl: DAY,
    defaultSetCache: true,
    nullTtl: 60,
  },
});
export type CategoryRepository = AppRepo<'Category', true>;
