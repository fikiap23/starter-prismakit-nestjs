import { Injectable } from '@nestjs/common';
import { CustomError } from 'src/common/exceptions/custom-error';
import { EErrorCode } from 'src/common/enums/error.enum';
import { FilePurpose } from 'src/infrastructure/prisma/prisma-client';

const PURPOSE_CONFIG: Record<
  FilePurpose,
  { mimeTypes: string[]; maxBytes: number }
> = {
  PRODUCT_IMAGE: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 5 * 1024 * 1024,
  },
  AVATAR: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 2 * 1024 * 1024,
  },
};

@Injectable()
export class FileAssetValidateHelper {
  getConfig(purpose: FilePurpose) {
    return PURPOSE_CONFIG[purpose];
  }

  validateMimeType(purpose: FilePurpose, contentType: string) {
    const config = PURPOSE_CONFIG[purpose];
    if (!config.mimeTypes.includes(contentType)) {
      throw new CustomError({
        statusCode: 400,
        message: `Unsupported content type for ${purpose}`,
        code: EErrorCode.VALIDATION_FAILED,
      });
    }
  }

  validateSize(purpose: FilePurpose, sizeBytes: number) {
    const config = PURPOSE_CONFIG[purpose];
    if (sizeBytes > config.maxBytes) {
      throw new CustomError({
        statusCode: 413,
        message: `File exceeds max size ${config.maxBytes / (1024 * 1024)} MB`,
        code: EErrorCode.VALIDATION_FAILED,
      });
    }
  }
}
