// Add custom jest matchers from jest-dom
// Setup file for Jest

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.GCS_PROJECT_ID = 'test-project';
process.env.GCS_BUCKET_NAME = 'test-bucket';
process.env.GCS_KEY_FILE = '/tmp/test-key.json';

