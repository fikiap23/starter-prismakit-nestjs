import { Injectable } from '@nestjs/common';

@Injectable()
export class FileAssetMapperHelper {
  formatReadyFileResponse(file: {
    id: string;
    fileName: string;
    purpose: string;
    mimeType: string;
    sizeBytes: bigint | number;
    checksumSha256?: string | null;
    status: string;
    consumed?: boolean;
    uploadedAt?: Date;
    expiresAt: Date | null;
  }) {
    return {
      id: file.id,
      fileName: file.fileName,
      purpose: file.purpose,
      mimeType: file.mimeType,
      sizeBytes: Number(file.sizeBytes),
      checksumSha256: file.checksumSha256 ?? null,
      status: file.status,
      consumed: file.consumed ?? false,
      uploadedAt: file.uploadedAt,
      expiresAt: file.expiresAt,
    };
  }
}
