import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

/** Reverse 1:1 of User. Must be a provider with `cache` — autoRegister stubs are uncached. */
export class ProfileRepository extends defineAppRepo({
  model: 'profile',
  cache: true,
}) {}
