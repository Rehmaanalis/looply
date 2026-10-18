'use client';

import React, { useEffect } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { AdPlacementConfig, DEFAULT_ADS_CONFIG } from '@/lib/ads/types';

interface AdSlotProps {
  placement: string;
  config?: {
    enabled?: boolean;
    client?: string;
    testMode?: boolean;
    placements?: Record<string, AdPlacementConfig>;
  };
  className?: string;
}

export default function AdSlot({ placement, config, className = '' }: AdSlotProps) {
  const activeConfig = config || DEFAULT_ADS_CONFIG;
  const isGlobalEnabled = activeConfig.enabled !== false;
  const placementData: AdPlacementConfig | undefined =
    activeConfig.placements?.[placement] || DEFAULT_ADS_CONFIG.placements[placement];

  useEffect(() => {
    if (isGlobalEnabled && !activeConfig.testMode && placementData?.enabled) {
      try {
        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch (err) {
        console.warn('[AdSlot] AdSense push error:', err);
      }
    }
  }, [isGlobalEnabled, activeConfig.testMode, placementData]);

  if (!isGlobalEnabled || !placementData || !placementData.enabled) {
    return null;
  }

  // 1. Live Google AdSense Container
  if (!activeConfig.testMode && activeConfig.client && placementData.slot) {
    return (
      <div className={`my-6 overflow-hidden rounded-xl bg-studio-surface border border-studio-border p-3 text-center ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-studio-muted uppercase tracking-wider mb-2 font-mono">
          <span>{placementData.label || 'Advertisement'}</span>
          <span>Google AdSense</span>
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '90px' }}
          data-ad-client={activeConfig.client}
          data-ad-slot={placementData.slot}
          data-ad-format={placementData.format || 'auto'}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // 2. Seamless Native Sponsored Card (Preview / Test Mode / Fallback)
  // Designed seamlessly to match the dark studio UI with zero layout shifts or visual clutter
  return (
    <aside
      aria-label="Sponsored Partner"
      className={`my-6 rounded-2xl bg-gradient-to-r from-studio-surface via-[#121520] to-studio-surface border border-indigo-500/20 hover:border-indigo-500/40 p-4 sm:p-5 transition-all shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold tracking-wider">
              {placementData.label || 'Sponsored Partner'}
            </span>
            <span className="text-[11px] text-studio-muted flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Verified Developer Resource
            </span>
          </div>

          <h4 className="text-sm font-semibold text-white mt-1">
            {placementData.sponsorTitle || 'High Performance Developer Tools'}
          </h4>
          <p className="text-xs text-studio-muted leading-relaxed max-w-2xl">
            {placementData.sponsorDesc || 'Supercharge your animations, assets, and development workflows.'}
          </p>
        </div>

        {placementData.sponsorLink && (
          <a
            href={placementData.sponsorLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-colors"
          >
            <span>{placementData.sponsorCta || 'Learn More'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </aside>
  );
}
