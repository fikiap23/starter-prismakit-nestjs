import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class FileAssetRepository extends defineAppRepo({
  model: 'fileAsset',
  cache: true,
  lock: 'file_assets',
}) {}
