import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class UserRepository extends defineAppRepo({
  model: 'user',
  cache: {
    // Auth lookups pass setCache explicitly; do not default-cache user reads.
    defaultSetCache: false,
    sensitiveFields: ['password'],
    methods: {
      getFirst: { enabled: false },
    },
  },
}) {}
