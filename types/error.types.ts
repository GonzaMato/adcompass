/**
 * Error Types
 * 
 * Tipos de errores personalizados para la aplicación.
 */

// ============================================
// ERROR CODES
// ============================================

export type ErrorCode = 
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'STORAGE_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

// ============================================
// ERROR RESPONSE DTO
// ============================================

/**
 * Estructura estándar de error en la API
 */
export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  field?: string;  // Campo que causó el error (para validaciones)
}

