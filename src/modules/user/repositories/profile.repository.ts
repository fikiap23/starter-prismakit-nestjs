import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';
import { DAY } from 'src/common/constants';

/** Reverse 1:1 of User. Must be a provider with `cache` — autoRegister stubs are uncached. */
export class ProfileRepository extends defineAppRepo({
  model: 'profile',
  scalarFields: Prisma.ProfileScalarFieldEnum,
  cache: {
    ttl: DAY,
    defaultSetCache: true,
    nullTtl: 60,
  },
}) {}
