import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class TagRepository extends defineAppRepo({
  model: 'tag',
  scalarFields: Prisma.TagScalarFieldEnum,
  cache: true,
}) {}
