import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class CategoryRepository extends defineAppRepo({
  model: 'category',
  cache: true,
}) {}
