export interface EvaluateRequestDTO {
  brandId: string;
  ruleId: string;
  assetUrl: string;
  assetType: 'IMAGE' | 'VIDEO';
  context?: string;
  // Legacy support: allow imageUrl in code paths but avoid using it directly
  imageUrl?: string;
}


