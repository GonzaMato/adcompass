// Brand types based on OpenAPI schema

export interface Color {
  role?: string;
  hex: string;
  darkVariant?: string;
  allowAsBackground?: boolean;
}

export interface Logo {
  id?: string;
  type: 'primary' | 'stacked' | 'mark-only' | 'mono' | 'inverted';
  url: string;
  mime: 'image/svg+xml' | 'image/png';
  sizeBytes?: number;
  widthPx?: number;
  heightPx?: number;
  minClearSpaceRatio?: number;
  allowedPositions?: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center')[];
  bannedBackgrounds?: string[];
  monochrome?: {
    allowed: boolean;
    hex?: string;
  };
  invertOnDark?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  colors?: Color[];
  logos?: Logo[];
  taglinesAllowed?: string[];
  createdAt?: string;
  updatedAt?: string;
}
