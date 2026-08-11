import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

/** Intentionally uncached — TypeScript omits setCache / invalidateCache. */
export const AuditLogRepository = defineAppRepo({
  model: 'auditLog',
  scalarFields: Prisma.AuditLogScalarFieldEnum,
});
export type AuditLogRepository = AppRepo<'AuditLog'>;
