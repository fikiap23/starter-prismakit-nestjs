import { createDefineRepo } from '@prismakit/nestjs';
import type { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const defineAppRepo = createDefineRepo<Prisma.TypeMap>();
