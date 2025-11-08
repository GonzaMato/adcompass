/**
 * Types Index
 * 
 * Export central de todos los tipos de la aplicación.
 * Importa desde aquí para tener acceso a todos los tipos.
 * 
 * Ejemplo:
 *   import { BrandResponse, CreateBrandDTO, ColorInput } from '@/types';
 */

// Brand types
export type {
  CreateBrandDTO,
  UpdateBrandDTO,
  BrandResponse,
  CreateBrandData,
  UpdateBrandData,
  BrandWithRelations,
  LogoFile,
} from './brand.types';

// Color types
export type {
  ColorInput,
  ColorResponse,
} from './color.types';

// Logo types
export type {
  LogoType,
  LogoPosition,
  LogoInput,
  LogoResponse,
  UploadedLogo,
} from './logo.types';

// Error types
export type {
  ErrorCode,
  ErrorResponse,
} from './error.types';

