import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

/**
 * Compose-only (User.profile). File exists so `prismakit validate --auto-register`
 * can resolve the relation; Nest still auto-registers at runtime if unused.
 */
export const ProfileRepository = defineAppRepo({
  model: 'profile',
  scalarFields: Prisma.ProfileScalarFieldEnum,
});
export interface ProfileRepository extends InstanceType<
  typeof ProfileRepository
> {}
