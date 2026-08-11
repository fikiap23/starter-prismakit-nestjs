import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CustomError } from 'src/common/exceptions/custom-error';
import { EErrorCode } from 'src/common/enums/error.enum';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { IPayloadJWT } from 'src/shared/interfaces/auth.interface';
import { ConfirmFileDto, CreateFileDto } from '../dto/file-asset.dto';
import { FileAssetMapperHelper } from '../helpers/file-asset-mapper.helper';
import { FileAssetValidateHelper } from '../helpers/file-asset-validate.helper';
import { FileAssetRepository } from '../repositories/file-asset.repository';
import { getFileAssetSelect } from '../types/select-file-asset.type';

const PRESIGN_TTL = 900;
const CONSUME_WINDOW_HOURS = 24;

@Injectable()
export class FileAssetService {
  constructor(
    private readonly files: FileAssetRepository,
    private readonly storage: StorageService,
    private readonly validate: FileAssetValidateHelper,
    private readonly mapper: FileAssetMapperHelper,
  ) {}

  async handleCreate(dto: CreateFileDto, user: IPayloadJWT) {
    this.validate.validateMimeType(dto.purpose, dto.contentType);
    this.validate.validateSize(dto.purpose, dto.sizeBytes);

    const config = this.validate.getConfig(dto.purpose);
    const bucketName = this.storage.getDefaultBucketName();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');

    const created = await this.files.create({
      data: {
        purpose: dto.purpose,
        status: 'PENDING_UPLOAD',
        consumed: false,
        storageProvider: 'MINIO',
        bucketName,
        storageKey: `pending/${randomUUID()}`,
        fileName: dto.fileName,
        mimeType: dto.contentType,
        sizeBytes: BigInt(dto.sizeBytes),
        uploadedByUser: { connect: { id: user.sub } },
        expiresAt: new Date(now.getTime() + PRESIGN_TTL * 1000),
      },
      select: { id: true },
    });

    const { uploadUrl, key: storageKey } =
      await this.storage.createPresignedUploadUrl({
        folder: `uploads/${yyyy}/${mm}/${created.id}`,
        originalFilename: dto.fileName,
        bucketName,
        expiresInSeconds: PRESIGN_TTL,
      });

    await this.files.updateById({
      id: created.id,
      data: { storageKey },
      invalidate: 'none',
    });

    return {
      id: created.id,
      fileName: dto.fileName,
      purpose: dto.purpose,
      contentType: dto.contentType,
      sizeBytes: dto.sizeBytes,
      uploadUrl,
      method: 'PUT' as const,
      expiresIn: PRESIGN_TTL,
      maxSizeBytes: config.maxBytes,
      storageKey,
      status: 'PENDING_UPLOAD',
      expiresAt: new Date(now.getTime() + PRESIGN_TTL * 1000).toISOString(),
    };
  }

  async handleConfirm(id: string, dto: ConfirmFileDto, user: IPayloadJWT) {
    const file = await this.files.getThrowById({
      id,
      select: getFileAssetSelect(),
    });
    this.assertOwner(file, user);

    if (file.status === 'READY' || file.status === 'CONSUMED') {
      return this.mapper.formatReadyFileResponse(file);
    }
    if (file.status !== 'PENDING_UPLOAD') {
      throw new CustomError({
        statusCode: 409,
        message: 'File is not in PENDING_UPLOAD state',
        code: EErrorCode.WORKFLOW_INVALID_STATE,
      });
    }

    const exists = await this.storage.objectExists(
      file.bucketName,
      file.storageKey,
    );
    if (!exists) {
      throw new CustomError({
        statusCode: 409,
        message: 'Object not found in storage — upload not completed',
        code: EErrorCode.WORKFLOW_INVALID_STATE,
      });
    }

    const stat = await this.storage.statObject(
      file.bucketName,
      file.storageKey,
    );
    const config = this.validate.getConfig(file.purpose);
    if (stat.size > config.maxBytes) {
      throw new CustomError({
        statusCode: 413,
        message: `Object exceeds max size ${config.maxBytes / (1024 * 1024)} MB`,
        code: EErrorCode.VALIDATION_FAILED,
      });
    }

    await this.files.updateById({
      id,
      data: {
        status: 'READY',
        sizeBytes: BigInt(stat.size),
        uploadedAt: new Date(),
        expiresAt: new Date(Date.now() + CONSUME_WINDOW_HOURS * 60 * 60 * 1000),
        ...(dto.checksumSha256 ? { checksumSha256: dto.checksumSha256 } : {}),
      },
    });

    const updated = await this.files.getThrowById({
      id,
      select: getFileAssetSelect(),
    });
    return this.mapper.formatReadyFileResponse(updated);
  }

  async handleGetById(id: string, user: IPayloadJWT) {
    const file = await this.files.getThrowById({
      id,
      select: getFileAssetSelect(),
      setCache: true,
    });
    this.assertOwner(file, user);
    if (file.status === 'PENDING_UPLOAD') {
      throw new CustomError({
        statusCode: 404,
        message: 'File not ready',
        code: EErrorCode.RESOURCE_NOT_FOUND,
      });
    }
    return this.mapper.formatReadyFileResponse(file);
  }

  async handleDownload(id: string, user: IPayloadJWT) {
    const file = await this.files.getThrowById({
      id,
      select: getFileAssetSelect(),
    });
    this.assertOwner(file, user);
    if (file.status !== 'READY' && file.status !== 'CONSUMED') {
      throw new CustomError({
        statusCode: 404,
        message: 'File not available for download',
        code: EErrorCode.RESOURCE_NOT_FOUND,
      });
    }
    const url = await this.storage.generatePresignedGetUrlByKey({
      key: file.storageKey,
      bucketName: file.bucketName,
      expiresInSeconds: 300,
    });
    return {
      url,
      expiresAt: new Date(Date.now() + 300 * 1000).toISOString(),
    };
  }

  private assertOwner(file: { uploadedByUserId: string }, user: IPayloadJWT) {
    if (file.uploadedByUserId !== user.sub) {
      throw new CustomError({
        statusCode: 404,
        message: 'File not found',
        code: EErrorCode.RESOURCE_NOT_FOUND,
      });
    }
  }
}
