import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

/** Intentionally uncached — TypeScript omits setCache / invalidateCache. */
export const AuditLogRepository = defineAppRepo({
  model: 'auditLog',
  scalarFields: Prisma.AuditLogScalarFieldEnum,
});
export interface AuditLogRepository extends InstanceType<
  typeof AuditLogRepository
> {}
