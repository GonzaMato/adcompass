import { getStorageClient, getBucketName } from '../lib/gcs';
import { StorageError } from '../lib/errors';
import { UploadedLogo } from '../types';

export class StorageService {
  async uploadLogo(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    brandId: string
  ): Promise<UploadedLogo> {
    try {
      const storage = getStorageClient();
      const bucketName = getBucketName();
      const bucket = storage.bucket(bucketName);

      // Create path: brands/{brandId}/{filename}
      const destination = `brands/${brandId}/${fileName}`;
      const file = bucket.file(destination);

      await file.save(fileBuffer, {
        contentType: mimeType,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Get public URL (bucket must be configured as public at bucket level)
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;

      return {
        url: publicUrl,
        sizeBytes: fileBuffer.length,
        mime: mimeType,
      };
    } catch (error) {
      console.error('Error uploading logo to GCS:', error);
      throw new StorageError(
        `Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteLogos(brandId: string): Promise<void> {
    try {
      const storage = getStorageClient();
      const bucketName = getBucketName();
      const bucket = storage.bucket(bucketName);

      const prefix = `brands/${brandId}/`;
      const [files] = await bucket.getFiles({ prefix });

      await Promise.all(files.map((file) => file.delete()));
    } catch (error) {
      console.error('Error deleting logos from GCS:', error);
      throw new StorageError(
        `Failed to delete logos: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const storageService = new StorageService();

