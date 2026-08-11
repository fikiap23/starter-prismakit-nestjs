import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as Minio from 'minio';
import { basename, extname } from 'path';
const MAX_ORIGINAL_FILE_NAME_LENGTH = 200;
const TEMP_KEY_NAME_DELIMITER = '__';

@Injectable()
export class StorageService {
  private readonly minioClient: Minio.Client;
  private readonly presignMinioClient: Minio.Client;
  private readonly publicUrl: string;
  private readonly defaultBucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.getOrThrow<string>('storage.endpoint'),
      port: this.configService.getOrThrow<number>('storage.port'),
      useSSL: this.configService.get<boolean>('storage.useSsl') === true,
      accessKey: this.configService.getOrThrow<string>('storage.accessKey'),
      secretKey: this.configService.getOrThrow<string>('storage.secretKey'),
    });

    this.publicUrl = this.configService.getOrThrow<string>('storage.publicUrl');
    this.presignMinioClient = this.buildPresignMinioClient();
    this.defaultBucketName =
      this.configService.get<string>('storage.bucketName') ?? 'starter';
  }

  getDefaultBucketName(): string {
    return this.defaultBucketName;
  }

  async ensureBucketExists(bucketName: string): Promise<void> {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(bucketName, 'us-east-1');
    }
  }

  async createPresignedUploadUrl({
    folder = 'temp',
    originalFilename,
    bucketName,
    expiresInSeconds = 900,
  }: {
    folder?: string;
    originalFilename?: string;
    bucketName?: string;
    expiresInSeconds?: number;
  }) {
    const resolvedBucketName = bucketName ?? this.defaultBucketName;
    await this.ensureBucketExists(resolvedBucketName);
    const objectKey = this.buildObjectKey(originalFilename, folder);
    const uploadUrl = await this.presignMinioClient.presignedPutObject(
      resolvedBucketName,
      objectKey,
      expiresInSeconds,
    );
    return {
      bucketName: resolvedBucketName,
      key: objectKey,
      uploadUrl,
      expiresInSeconds,
    };
  }

  async generatePresignedGetUrlByKey({
    key,
    bucketName,
    expiresInSeconds = 3600,
  }: {
    key: string;
    bucketName?: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    const resolvedBucketName = bucketName ?? this.defaultBucketName;
    return this.minioClient.presignedGetObject(
      resolvedBucketName,
      key,
      expiresInSeconds,
    );
  }

  async objectExists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, objectName);
      return true;
    } catch {
      return false;
    }
  }

  async statObject(bucketName: string, objectName: string) {
    return this.minioClient.statObject(bucketName, objectName);
  }

  async isHealthy(bucketName?: string): Promise<boolean> {
    try {
      const name = bucketName ?? this.defaultBucketName;
      return await this.minioClient.bucketExists(name);
    } catch {
      return false;
    }
  }

  private buildObjectKey(originalFilename?: string, folder = 'temp'): string {
    const safeExt = this.getSafeExtension(originalFilename);
    const sanitizedName = this.sanitizeOriginalFileName(
      originalFilename ?? 'file',
    );
    const nameWithExt =
      safeExt && !sanitizedName.toLowerCase().endsWith(safeExt)
        ? `${sanitizedName}${safeExt}`
        : sanitizedName;
    return `${folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${TEMP_KEY_NAME_DELIMITER}${nameWithExt}`;
  }

  private sanitizeOriginalFileName(fileName: string): string {
    const baseName = basename(fileName || 'file');
    const sanitized = baseName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!sanitized) return 'file';
    return sanitized.slice(0, MAX_ORIGINAL_FILE_NAME_LENGTH);
  }

  private getSafeExtension(filename?: string): string {
    const ext = extname(filename ?? '').toLowerCase();
    if (!ext) return '';
    if (!/^\.[a-z0-9]{1,10}$/.test(ext)) return '';
    return ext;
  }

  private buildPresignMinioClient(): Minio.Client {
    const configuredPresignEndpoint = this.configService.get<string>(
      'storage.presignEndpoint',
    );
    const presignEndpoint =
      configuredPresignEndpoint && configuredPresignEndpoint.length > 0
        ? configuredPresignEndpoint
        : this.publicUrl;
    const parsedPresignUrl = new URL(presignEndpoint);
    const parsedPort = parsedPresignUrl.port
      ? Number(parsedPresignUrl.port)
      : parsedPresignUrl.protocol === 'https:'
        ? 443
        : 80;

    return new Minio.Client({
      endPoint: parsedPresignUrl.hostname,
      port: parsedPort,
      useSSL: parsedPresignUrl.protocol === 'https:',
      region: 'us-east-1',
      accessKey: this.configService.getOrThrow<string>('storage.accessKey'),
      secretKey: this.configService.getOrThrow<string>('storage.secretKey'),
    });
  }
}
