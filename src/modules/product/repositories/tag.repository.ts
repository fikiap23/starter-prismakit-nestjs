import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class TagRepository extends defineAppRepo({
  model: 'tag',
  cache: true,
}) {}
