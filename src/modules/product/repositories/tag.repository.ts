import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

export const TagRepository = defineAppRepo({
  model: 'tag',
  scalarFields: Prisma.TagScalarFieldEnum,
  cache: true,
});
export type TagRepository = AppRepo<'Tag', true>;
