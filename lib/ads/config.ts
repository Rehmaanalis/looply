import fs from 'fs/promises';
import path from 'path';
import { AdsConfig, DEFAULT_ADS_CONFIG } from './types';

export * from './types';

/**
 * Loads the centralized ads configuration from data/config/ads.json (Server-side)
 */
export async function getAdsConfig(): Promise<AdsConfig> {
  try {
    const configPath = path.join(process.cwd(), 'data', 'config', 'ads.json');
    const raw = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ADS_CONFIG,
      ...parsed,
      placements: {
        ...DEFAULT_ADS_CONFIG.placements,
        ...(parsed.placements || {}),
      },
    };
  } catch (err) {
    console.warn('[adsConfig] Using default ads configuration fallback:', err);
    return DEFAULT_ADS_CONFIG;
  }
}
