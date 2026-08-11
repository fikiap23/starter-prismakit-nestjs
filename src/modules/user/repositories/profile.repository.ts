import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

/**
 * Compose-only (User.profile). File exists so `validate:compose` can resolve
 * the relation; Nest still auto-registers at runtime if this class is unused.
 */
export const ProfileRepository = defineAppRepo({
  model: 'profile',
  scalarFields: Prisma.ProfileScalarFieldEnum,
});
export type ProfileRepository = AppRepo<'Profile'>;
