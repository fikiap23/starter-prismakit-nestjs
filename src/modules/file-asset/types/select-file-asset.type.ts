import { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const fileAssetSelectPresets = {
  general: {
    id: true,
    purpose: true,
    status: true,
    consumed: true,
    fileName: true,
    mimeType: true,
    sizeBytes: true,
    checksumSha256: true,
    storageKey: true,
    bucketName: true,
    uploadedByUserId: true,
    uploadedAt: true,
    expiresAt: true,
  } satisfies Prisma.FileAssetSelect,
};

export function getFileAssetSelect() {
  return fileAssetSelectPresets.general;
}
