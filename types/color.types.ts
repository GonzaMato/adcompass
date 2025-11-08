/**
 * Color Domain Types
 * 
 * Tipos relacionados con colores de marca.
 */

// ============================================
// REQUEST DTOs
// ============================================

/**
 * Input para crear/actualizar un color
 */
export interface ColorInput {
  hex: string;              // Formato: #RRGGBB (uppercase)
  role?: string;            // ej: "primary", "accent", "neutral-900"
  darkVariant?: string;     // Formato: #RRGGBB para dark mode
  allowAsBackground?: boolean;
}

// ============================================
// RESPONSE DTOs
// ============================================

/**
 * Respuesta de un color en la API
 */
export interface ColorResponse {
  hex: string;
  role?: string;
  darkVariant?: string;
  allowAsBackground: boolean;
}

