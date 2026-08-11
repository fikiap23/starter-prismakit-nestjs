import { Module } from '@nestjs/common';
import { FileAssetController } from './controllers/file-asset.controller';
import { FileAssetMapperHelper } from './helpers/file-asset-mapper.helper';
import { FileAssetValidateHelper } from './helpers/file-asset-validate.helper';
import { FileAssetRepository } from './repositories/file-asset.repository';
import { FileAssetService } from './services/file-asset.service';

@Module({
  controllers: [FileAssetController],
  providers: [
    FileAssetService,
    FileAssetRepository,
    FileAssetValidateHelper,
    FileAssetMapperHelper,
  ],
  exports: [FileAssetRepository],
})
export class FileAssetModule {}
