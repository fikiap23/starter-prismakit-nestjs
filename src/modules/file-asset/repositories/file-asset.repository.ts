import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';
import { DAY } from 'src/common/constants';

export const FileAssetRepository = defineAppRepo({
  model: 'fileAsset',
  scalarFields: Prisma.FileAssetScalarFieldEnum,
  cache: {
    ttl: DAY,
    defaultSetCache: true,
    nullTtl: 60,
  },
  lock: 'file_assets',
});
export interface FileAssetRepository extends InstanceType<
  typeof FileAssetRepository
> {}
