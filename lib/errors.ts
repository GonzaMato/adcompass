export class ValidationError extends Error {
  code: string;
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'BAD_REQUEST';
    this.field = field;
  }
}

export class StorageError extends Error {
  code: string;

  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
    this.code = 'STORAGE_ERROR';
  }
}

export class DatabaseError extends Error {
  code: string;

  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
    this.code = 'DATABASE_ERROR';
  }
}

