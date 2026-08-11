import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export const TagRepository = defineAppRepo({
  model: 'tag',
  scalarFields: Prisma.TagScalarFieldEnum,
  cache: true,
});
export interface TagRepository extends InstanceType<typeof TagRepository> {}
