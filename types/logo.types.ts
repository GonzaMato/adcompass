/**
 * Logo Domain Types
 * 
 * Tipos relacionados con logos de marca.
 */

// ============================================
// ENUMS
// ============================================

export type LogoType = 'primary' | 'stacked' | 'mark-only' | 'mono' | 'inverted';
export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

// ============================================
// REQUEST DTOs
// ============================================

/**
 * Input para metadata de logo (sin archivo)
 */
export interface LogoInput {
  type: LogoType;
  minClearSpaceRatio?: number;      // 0-0.2
  allowedPositions?: LogoPosition[];
  bannedBackgrounds?: string[];
  monochrome?: {
    allowed: boolean;
    hex?: string;
  };
  invertOnDark?: boolean;
}

// ============================================
// RESPONSE DTOs
// ============================================

/**
 * Respuesta de un logo en la API (con URL de GCS)
 */
export interface LogoResponse {
  id: string;                       // ej: "lg_1", "lg_2"
  type: LogoType;
  url: string;                      // URL público en GCS
  mime: string;                     // "image/svg+xml" o "image/png"
  sizeBytes?: number;
  widthPx?: number;
  heightPx?: number;
  minClearSpaceRatio?: number;
  allowedPositions?: LogoPosition[];
  bannedBackgrounds?: string[];
  monochrome?: {
    allowed: boolean;
    hex?: string;
  };
  invertOnDark?: boolean;
}

// ============================================
// STORAGE
// ============================================

/**
 * Resultado de subir un logo a GCS
 */
export interface UploadedLogo {
  url: string;
  sizeBytes: number;
  mime: string;
}

