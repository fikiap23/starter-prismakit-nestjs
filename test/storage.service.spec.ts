import { ConfigService } from '@nestjs/config';
import { StorageService } from 'src/infrastructure/storage/storage.service';

const presignedPutObject = jest.fn().mockResolvedValue('http://localhost:9000/put');
const presignedGetObject = jest.fn().mockResolvedValue('http://localhost:9000/get');
const bucketExists = jest.fn().mockResolvedValue(true);
const makeBucket = jest.fn();
const statObject = jest.fn().mockResolvedValue({ size: 128 });

jest.mock('minio', () => ({
  Client: jest.fn().mockImplementation(() => ({
    bucketExists,
    makeBucket,
    presignedPutObject,
    presignedGetObject,
    statObject,
  })),
}));

function buildService() {
  const config = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string | number | boolean> = {
        'storage.endpoint': 'localhost',
        'storage.port': 9000,
        'storage.accessKey': 'app',
        'storage.secretKey': 'secret',
        'storage.publicUrl': 'http://localhost:9000',
      };
      return values[key];
    }),
    get: jest.fn((key: string) => {
      const values: Record<string, string | number | boolean | undefined> = {
        'storage.useSsl': false,
        'storage.presignEndpoint': '',
        'storage.bucketName': 'starter',
      };
      return values[key];
    }),
  };
  return new StorageService(config as unknown as ConfigService);
}

describe('StorageService presign (mocked MinIO)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bucketExists.mockResolvedValue(true);
    presignedPutObject.mockResolvedValue('http://localhost:9000/put');
    presignedGetObject.mockResolvedValue('http://localhost:9000/get');
  });

  it('creates a presigned PUT URL', async () => {
    const storage = buildService();
    const result = await storage.createPresignedUploadUrl({
      folder: 'uploads/demo',
      originalFilename: 'hero.jpg',
    });
    expect(result.uploadUrl).toBe('http://localhost:9000/put');
    expect(result.bucketName).toBe('starter');
    expect(result.key).toContain('uploads/demo/');
    expect(result.key).toContain('hero.jpg');
    expect(presignedPutObject).toHaveBeenCalled();
  });

  it('creates a presigned GET URL by key', async () => {
    const storage = buildService();
    const url = await storage.generatePresignedGetUrlByKey({
      key: 'uploads/demo/file.jpg',
    });
    expect(url).toBe('http://localhost:9000/get');
    expect(presignedGetObject).toHaveBeenCalledWith(
      'starter',
      'uploads/demo/file.jpg',
      3600,
    );
  });

  it('reports object existence from statObject', async () => {
    const storage = buildService();
    await expect(storage.objectExists('starter', 'k')).resolves.toBe(true);
    statObject.mockRejectedValueOnce(new Error('missing'));
    await expect(storage.objectExists('starter', 'missing')).resolves.toBe(
      false,
    );
  });
});
