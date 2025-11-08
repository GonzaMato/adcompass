import { Storage } from '@google-cloud/storage';

let storageInstance: Storage | null = null;

export function getStorageClient(): Storage {
  if (storageInstance) {
    return storageInstance;
  }

  const keyFilePath = process.env.GCS_KEY_FILE;
  const projectId = process.env.GCS_PROJECT_ID;

  if (!keyFilePath) {
    throw new Error('GCS_KEY_FILE environment variable is not set');
  }

  if (!projectId) {
    throw new Error('GCS_PROJECT_ID environment variable is not set');
  }

  storageInstance = new Storage({
    keyFilename: keyFilePath,
    projectId: projectId,
  });

  return storageInstance;
}

export function getBucketName(): string {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME environment variable is not set');
  }
  return bucketName;
}

