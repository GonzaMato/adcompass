// Re-export types from backend for frontend use
import type { BrandResponse, ColorResponse, LogoResponse } from '../../types';

// Use backend types directly
export type Brand = BrandResponse;
export type Color = ColorResponse;
export type Logo = LogoResponse;
