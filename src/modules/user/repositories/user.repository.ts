import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';
import { DAY } from 'src/common/constants';

export const UserRepository = defineAppRepo({
  model: 'user',
  scalarFields: Prisma.UserScalarFieldEnum,
  cache: {
    ttl: DAY,
    nullTtl: 60,
    sensitiveFields: ['password'],
    methods: {
      getFirst: { enabled: false },
    },
  },
});
export interface UserRepository extends InstanceType<typeof UserRepository> {}
