/**
 * Brand Domain Types
 * 
 * Este archivo contiene todos los tipos relacionados con Brand.
 * Separados en: Request DTOs, Response DTOs, y Domain Models.
 */

import { ColorInput, ColorResponse } from './color.types';
import { LogoInput, LogoResponse } from './logo.types';

// ============================================
// REQUEST DTOs (lo que recibe la API)
// ============================================

/**
 * DTO para crear un Brand
 * Usado en POST /api/brands
 */
export interface CreateBrandDTO {
  name: string;
  description?: string;
  colors?: ColorInput[];
  logos: LogoInput[];
  taglinesAllowed?: string[];
  logoFiles: LogoFile[];
}

/**
 * DTO para actualizar completamente el BrandKit
 * Usado en PUT /api/brands/{id}
 * Permite actualizar name, description, colors, logos y taglines
 * Logos son opcionales - si no se proporcionan, se mantienen los existentes
 */
export interface UpdateBrandDTO {
  name?: string;
  description?: string;
  colors?: ColorInput[];
  logos?: LogoInput[];
  taglinesAllowed?: string[];
  logoFiles: LogoFile[];
  existingLogoUrls?: string[];
}

/**
 * Archivo de logo subido
 */
export interface LogoFile {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
}

// ============================================
// RESPONSE DTOs (lo que devuelve la API)
// ============================================

/**
 * Respuesta completa de un Brand
 * Usado en responses de GET y POST
 */
export interface BrandResponse {
  id: string;
  name: string;
  description?: string;
  colors: ColorResponse[];
  logos: LogoResponse[];
  taglinesAllowed: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DOMAIN MODELS (para Repository/Database)
// ============================================

/**
 * Datos para crear un Brand en la base de datos
 */
export interface CreateBrandData {
  name: string;
  description?: string;
  colors?: {
    role?: string;
    hex: string;
    darkVariant?: string;
    allowAsBackground?: boolean;
  }[];
  logos: {
    type: string;
    url: string;
    mime: string;
    sizeBytes?: number;
    widthPx?: number;
    heightPx?: number;
    minClearSpaceRatio?: number;
    allowedPositions?: any;
    bannedBackgrounds?: any;
    monochrome?: any;
    invertOnDark?: boolean;
  }[];
  taglines?: string[];
}

/**
 * Datos para actualizar un Brand en la base de datos (relaciones opcionales)
 */
export interface UpdateBrandData {
  colors?: {
    role?: string;
    hex: string;
    darkVariant?: string;
    allowAsBackground?: boolean;
  }[];
  logos?: {
    type: string;
    url: string;
    mime: string;
    sizeBytes?: number;
    widthPx?: number;
    heightPx?: number;
    minClearSpaceRatio?: number;
    allowedPositions?: any;
    bannedBackgrounds?: any;
    monochrome?: any;
    invertOnDark?: boolean;
  }[];
  taglines?: string[];
}

/**
 * Brand completo con todas sus relaciones (desde DB)
 */
export interface BrandWithRelations {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  colors: Array<{
    id: number;
    brandId: string;
    role: string | null;
    hex: string;
    darkVariant: string | null;
    allowAsBackground: boolean;
  }>;
  logos: Array<{
    id: number;
    brandId: string;
    type: string;
    url: string;
    mime: string;
    sizeBytes: number | null;
    widthPx: number | null;
    heightPx: number | null;
    minClearSpaceRatio: number | null;
    allowedPositions: any;
    bannedBackgrounds: any;
    monochrome: any;
    invertOnDark: boolean | null;
  }>;
  taglines: Array<{
    id: number;
    brandId: string;
    text: string;
  }>;
}

