'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Info, X, Play, Volume2, Shield } from 'lucide-react';
import { DEFAULT_ADS_CONFIG, AdPlacementConfig } from '@/lib/ads/types';

interface AppExternalAdSidebarProps {
  placement?: string;
  config?: {
    enabled?: boolean;
    client?: string;
    testMode?: boolean;
    placements?: Record<string, AdPlacementConfig>;
  };
}

export default function AppExternalAdSidebar({
  placement = 'appExternalSidebar',
  config,
}: AppExternalAdSidebarProps) {
  const activeConfig = config || DEFAULT_ADS_CONFIG;
  const isGlobalEnabled = activeConfig.enabled !== false;
  const placementData =
    activeConfig.placements?.[placement] || DEFAULT_ADS_CONFIG.placements[placement];

  const [videoPlaying, setVideoPlaying] = useState(true);

  // Trigger Google AdSense script push on mount if live
  useEffect(() => {
    if (isGlobalEnabled && !activeConfig.testMode && placementData?.enabled) {
      try {
        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch (err) {
        console.warn('[AppExternalAdSidebar] AdSense error:', err);
      }
    }
  }, [isGlobalEnabled, activeConfig.testMode, placementData]);

  if (!isGlobalEnabled || !placementData || placementData.enabled === false) {
    return null;
  }

  // Google Ads live rendering
  if (!activeConfig.testMode && activeConfig.client && placementData.slot) {
    return (
      <aside
        aria-label="Google Advertisement"
        className="hidden lg:flex flex-col shrink-0 w-[300px] h-full min-h-0 bg-[#16181f] border-l border-[#272a38] z-20 select-none overflow-y-auto overflow-x-hidden p-2 items-center space-y-4"
      >
        <div className="flex items-center justify-between w-full px-2 pt-1 text-[10px] text-zinc-400 font-mono">
          <span>ADVERTISEMENT</span>
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-zinc-400" />
            <X className="w-3 h-3 text-zinc-400" />
          </span>
        </div>

        {/* Long Google Vertical Half-Page (300x600) or Skyscraper */}
        <div className="w-[300px] min-h-[600px] flex items-center justify-center bg-[#0d0f15] rounded border border-[#272a38]/60 overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '300px', height: '600px' }}
            data-ad-client={activeConfig.client}
            data-ad-slot={placementData.slot}
            data-ad-format="vertical"
            data-full-width-responsive="false"
          />
        </div>
      </aside>
    );
  }

  // Authentic Google Display Network vertical unit matching the reference image (Photopea style)
  // Perfectly sized to standard Google Ad dimension: 300px wide, zero timers, zero gimmicks
  return (
    <aside
      aria-label="Google Advertisement"
      className="hidden lg:flex flex-col shrink-0 w-[300px] h-full min-h-0 bg-[#1e2029] border-l border-[#2e3242] z-20 select-none overflow-y-auto overflow-x-hidden"
    >
      <div className="p-2.5 flex flex-col gap-3 min-h-full">
        {/* UNIT 1: Standard Google Display Banner (Dell Technologies / Intel style from reference) */}
        <div className="w-full rounded bg-[#f4f5f8] text-zinc-900 border border-zinc-300 shadow-sm overflow-hidden relative flex flex-col">
          {/* AdChoices Badge in top-right corner exactly as shown in reference */}
          <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 bg-white/90 backdrop-blur-xs px-1 py-0.5 rounded text-[9px] text-zinc-600 font-sans shadow-xs">
            <span className="font-semibold text-blue-600">i</span>
            <X className="w-2.5 h-2.5 text-zinc-500 cursor-pointer" />
          </div>

          <div className="p-3.5 pb-2">
            {/* Brand Logo */}
            <div className="flex items-center gap-1 mb-2">
              <span className="font-bold text-sm tracking-tight text-[#0076ce]">DELL</span>
              <span className="text-xs font-medium text-zinc-700">Technologies</span>
            </div>

            {/* Headline & Body */}
            <h4 className="text-xs font-bold leading-snug text-zinc-900">
              Laptops built for workday breakthroughs.
            </h4>
            <p className="text-[11px] text-zinc-600 leading-snug mt-1.5">
              The Dell Pro laptop powered by Intel® Core™ Ultra with Intel vPro®.
            </p>
          </div>

          {/* Media / Creative Image & CTA */}
          <div className="relative w-full h-36 bg-gradient-to-r from-zinc-100 to-zinc-200 mt-1 flex items-end justify-between p-3 overflow-hidden">
            {/* Left badge */}
            <div className="z-10">
              <div className="text-[10px] font-bold text-zinc-900 tracking-tighter uppercase font-mono">
                intel <span className="text-blue-600 font-extrabold">CORE</span>
              </div>
              <div className="text-[9px] text-zinc-500 font-mono -mt-0.5">Ultra</div>
            </div>

            {/* Stylized workspace backdrop */}
            <div className="absolute inset-0 bg-cover bg-center opacity-85 mix-blend-multiply" style={{
              backgroundImage: `radial-gradient(circle at 75% 40%, rgba(0, 118, 206, 0.25) 0%, transparent 60%), linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)`
            }}>
              {/* Graphic element representing workstation */}
              <div className="absolute right-3 top-2 w-28 h-24 rounded bg-slate-800/20 border border-slate-700/30 rotate-2 flex items-center justify-center text-[10px] text-slate-700 font-mono">
                Dell Pro Ultra
              </div>
            </div>

            {/* Google Blue CTA Button */}
            <a
              href="https://www.dell.com"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="z-10 px-3.5 py-1.5 rounded bg-[#0076ce] hover:bg-[#005ea6] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Explore More
            </a>
          </div>
        </div>

        {/* UNIT 2: Secondary Stacked Display Unit (Google Display 300x250) */}
        <div className="w-full rounded bg-[#f4f5f8] text-zinc-900 border border-zinc-300 shadow-sm overflow-hidden relative flex flex-col">
          {/* AdChoices Badge */}
          <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 bg-white/90 backdrop-blur-xs px-1 py-0.5 rounded text-[9px] text-zinc-600 font-sans shadow-xs">
            <span className="font-semibold text-blue-600">i</span>
            <X className="w-2.5 h-2.5 text-zinc-500 cursor-pointer" />
          </div>

          <div className="p-3.5 pb-2">
            <div className="flex items-center gap-1 mb-2">
              <span className="font-bold text-sm tracking-tight text-[#0076ce]">DELL</span>
              <span className="text-xs font-medium text-zinc-700">Technologies</span>
            </div>

            <h4 className="text-xs font-bold leading-snug text-zinc-900">
              Workstations for high-compute workflows.
            </h4>
            <p className="text-[11px] text-zinc-600 leading-snug mt-1.5">
              Precision architecture designed to deliver uninterrupted graphics rendering.
            </p>
          </div>

          <div className="relative w-full h-32 bg-gradient-to-r from-slate-200 to-zinc-300 mt-1 flex items-end justify-between p-3 overflow-hidden">
            <div className="z-10">
              <div className="text-[10px] font-bold text-zinc-900 font-mono uppercase">
                Precision 7000
              </div>
              <div className="text-[9px] text-zinc-600">ISV Certified</div>
            </div>

            <a
              href="https://www.dell.com"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="z-10 px-3.5 py-1.5 rounded bg-[#0076ce] hover:bg-[#005ea6] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Explore More
            </a>
          </div>
        </div>

        {/* UNIT 3: Video Display Ad Unit (with Skip Ad control from reference image) */}
        <div className="w-full rounded bg-[#0e1017] text-white border border-[#2d3142] shadow-sm overflow-hidden relative flex flex-col">
          <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 bg-black/75 px-1 py-0.5 rounded text-[9px] text-zinc-400 font-sans">
            <span className="font-semibold text-blue-400">i</span>
            <X className="w-2.5 h-2.5 text-zinc-400 cursor-pointer" />
          </div>

          <div className="relative w-full h-36 bg-black flex items-center justify-center overflow-hidden">
            {/* Video preview / playing simulation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900 to-zinc-800 opacity-90 flex items-center justify-center">
              <div className="text-center p-3">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-1 text-white">
                  <Play className="w-3.5 h-3.5 ml-0.5 fill-white" />
                </div>
                <div className="text-[10px] text-zinc-300 font-mono">Stream High-Performance GPU</div>
              </div>
            </div>

            {/* Video Controls / Skip Ad button as seen in reference image */}
            <div className="absolute bottom-2 right-2 z-10">
              <button
                onClick={() => setVideoPlaying(false)}
                className="px-2.5 py-1 rounded bg-black/85 hover:bg-black text-white text-[10px] font-sans border border-white/20 flex items-center gap-1 shadow-sm transition-colors"
              >
                <span>Skip Ad</span>
                <span className="font-mono text-xs">▶|</span>
              </button>
            </div>

            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-[9px] text-zinc-400 font-mono">
              <Volume2 className="w-3 h-3" />
              <span>Ad : 0:15</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
