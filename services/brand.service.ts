import { BrandRepository, brandRepository } from '../repositories/brand.repository';
import { StorageService, storageService } from './storage.service';
import { BrandInputSchema, BrandUpdateInputSchema, validateLogoFile } from '../lib/validators/brand.validator';
import { ValidationError, NotFoundError } from '../lib/errors';
import { ZodError } from 'zod';
import { 
  CreateBrandDTO, 
  UpdateBrandDTO,
  BrandResponse, 
  CreateBrandData,
  UpdateBrandData,
  LogoInput 
} from '../types';

export class BrandService {
  constructor(
    private repository: BrandRepository = brandRepository,
    private storage: StorageService = storageService
  ) {}

  async createBrand(input: CreateBrandDTO): Promise<BrandResponse> {
    // Validate input structure
    try {
      BrandInputSchema.parse({
        name: input.name,
        description: input.description,
        colors: input.colors,
        logos: input.logos,
        taglinesAllowed: input.taglinesAllowed,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        throw new ValidationError(
          firstError.message,
          firstError.path.join('.')
        );
      }
      throw error;
    }

    // Check if brand name already exists
    const nameExists = await this.repository.existsByName(input.name);
    if (nameExists) {
      throw new ValidationError('A brand with this name already exists', 'name');
    }

    // Validate logo files count matches logos array (only if logos provided)
    if (input.logos && input.logoFiles.length !== input.logos.length) {
      throw new ValidationError(
        `Expected ${input.logos.length} logo files, but received ${input.logoFiles.length}`
      );
    }

    // Validate each logo file (only if logos provided)
    if (input.logos) {
      for (const file of input.logoFiles) {
        const validation = validateLogoFile(file as any);
        if (!validation.valid) {
          throw new ValidationError(validation.error || 'Invalid logo file');
        }
      }
    }

    // Generate brand ID for GCS path
    const brandId = crypto.randomUUID();

    // Upload logos to GCS
    const uploadedLogos = await Promise.all(
      input.logoFiles.map(async (file, index) => {
        const logoInput = input.logos[index];
        const uploaded = await this.storage.uploadLogo(
          file.buffer,
          file.name,
          file.type,
          brandId
        );

        return {
          type: logoInput.type,
          url: uploaded.url,
          mime: uploaded.mime,
          sizeBytes: uploaded.sizeBytes,
          allowedPositions: logoInput.allowedPositions,
          bannedBackgrounds: logoInput.bannedBackgrounds,
          monochrome: logoInput.monochrome,
          invertOnDark: logoInput.invertOnDark,
          minClearSpaceRatio: logoInput.minClearSpaceRatio,
        };
      })
    );

    // Create brand in database
    const brandData: CreateBrandData = {
      name: input.name,
      description: input.description,
      colors: input.colors,
      logos: uploadedLogos,
      taglines: input.taglinesAllowed,
    };

    const brand = await this.repository.createWithRelations(brandData);

    // Transform to API response format
    return this.transformToResponse(brand);
  }

  async getBrandById(id: string): Promise<BrandResponse | null> {
    const brand = await this.repository.findById(id);
    if (!brand) {
      return null;
    }
    return this.transformToResponse(brand);
  }

  async getAllBrands(): Promise<BrandResponse[]> {
    const brands = await this.repository.findAll();
    return brands.map((brand) => this.transformToResponse(brand));
  }

  async updateBrand(id: string, input: UpdateBrandDTO): Promise<BrandResponse | null> {
    // Validate input structure
    try {
      BrandUpdateInputSchema.parse({
        colors: input.colors,
        logos: input.logos,
        taglinesAllowed: input.taglinesAllowed,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        throw new ValidationError(
          firstError.message,
          firstError.path.join('.')
        );
      }
      throw error;
    }

    // Ensure brand exists before uploading
    const existingBrand = await this.repository.findById(id);
    if (!existingBrand) {
      throw new NotFoundError('Brand not found');
    }

    // Validate logo files vs logos metadata presence
    if (input.logos) {
      if (input.logoFiles.length !== input.logos.length) {
        throw new ValidationError(
          `Expected ${input.logos.length} logo files, but received ${input.logoFiles.length}`
        );
      }
      // Validate each logo file
      for (const file of input.logoFiles) {
        const validation = validateLogoFile(file as any);
        if (!validation.valid) {
          throw new ValidationError(validation.error || 'Invalid logo file');
        }
      }
    } else {
      // No new logos provided: must not receive files
      if (input.logoFiles.length > 0) {
        throw new ValidationError('Logo files provided without logos metadata', 'logos');
      }
    }

    // Build preserved logos from existing by URL list (if provided)
    const existingUrls = new Set(input.existingLogoUrls || []);
    const preservedLogos = input.existingLogoUrls
      ? input.existingLogoUrls.map((url) => {
          const found = existingBrand.logos.find((l: any) => l.url === url);
          if (!found) {
            throw new ValidationError(`Logo URL not found in brand: ${url}`, 'logoUrls');
          }
          return {
            type: found.type,
            url: found.url,
            mime: found.mime,
            sizeBytes: found.sizeBytes ?? undefined,
            widthPx: found.widthPx ?? undefined,
            heightPx: found.heightPx ?? undefined,
            minClearSpaceRatio: found.minClearSpaceRatio ?? undefined,
            allowedPositions: found.allowedPositions ?? undefined,
            bannedBackgrounds: found.bannedBackgrounds ?? undefined,
            monochrome: found.monochrome ?? undefined,
            invertOnDark: found.invertOnDark ?? undefined,
          };
        })
      : [];

    // Upload new logos to GCS (use existing brand id as path)
    const uploadedNewLogos = input.logos
      ? await Promise.all(
          input.logoFiles.map(async (file, index) => {
            const logoInput = input.logos![index];
            const uploaded = await this.storage.uploadLogo(
              file.buffer,
              file.name,
              file.type,
              id
            );

            return {
              type: logoInput.type,
              url: uploaded.url,
              mime: uploaded.mime,
              sizeBytes: uploaded.sizeBytes,
              allowedPositions: logoInput.allowedPositions,
              bannedBackgrounds: logoInput.bannedBackgrounds,
              monochrome: logoInput.monochrome,
              invertOnDark: logoInput.invertOnDark,
              minClearSpaceRatio: logoInput.minClearSpaceRatio,
            };
          })
        )
      : [];

    // Combine preserved + new, dedupe by URL
    const combinedByUrl = new Map<string, any>();
    for (const l of [...preservedLogos, ...uploadedNewLogos]) {
      if (!combinedByUrl.has(l.url)) {
        combinedByUrl.set(l.url, l);
      }
    }
    const combined = Array.from(combinedByUrl.values());

    // Enforce max logos if replacement requested
    const willReplaceLogos = (input.existingLogoUrls && input.existingLogoUrls.length > 0) || (!!input.logos && input.logos.length > 0);
    if (willReplaceLogos && combined.length > 6) {
      throw new ValidationError('Maximum 6 logos allowed', 'logos');
    }

    // Replace brand relations in database
    const updateData: UpdateBrandData = {
      // name/description unchanged in this operation
      colors: input.colors,
      logos: willReplaceLogos ? combined : undefined,
      taglines: input.taglinesAllowed,
    };

    const brand = await this.repository.updateWithRelations(id, updateData);

    if (!brand) {
      return null;
    }

    return this.transformToResponse(brand);
  }

  private transformToResponse(brand: any): BrandResponse {
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description || undefined,
      colors: brand.colors.map((color: any) => ({
        role: color.role || undefined,
        hex: color.hex,
        darkVariant: color.darkVariant || undefined,
        allowAsBackground: color.allowAsBackground,
      })),
      logos: brand.logos.map((logo: any) => ({
        id: `lg_${logo.id}`,
        type: logo.type,
        url: logo.url,
        mime: logo.mime,
        sizeBytes: logo.sizeBytes || undefined,
        widthPx: logo.widthPx || undefined,
        heightPx: logo.heightPx || undefined,
        minClearSpaceRatio: logo.minClearSpaceRatio || undefined,
        allowedPositions: logo.allowedPositions || undefined,
        bannedBackgrounds: logo.bannedBackgrounds || undefined,
        monochrome: logo.monochrome || undefined,
        invertOnDark: logo.invertOnDark || undefined,
      })),
      taglinesAllowed: brand.taglines.map((t: any) => t.text),
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    };
  }

  async deleteBrand(id: string): Promise<void> {
    // Ensure brand exists
    const existingBrand = await this.repository.findById(id);
    if (!existingBrand) {
      throw new NotFoundError('Brand not found');
    }
    // Delete storage assets then DB
    await this.storage.deleteLogos(id);
    await this.repository.delete(id);
  }
}

export const brandService = new BrandService();

