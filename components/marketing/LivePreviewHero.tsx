'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, Download, Sparkles, Sliders } from 'lucide-react';

export default function LivePreviewHero() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const duration = 3.0;

  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const delta = (stamp - lastStamp) / 1000;
      lastStamp = stamp;

      if (isPlaying) {
        setTime((prev) => (prev + delta) % duration);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Compute live visual coordinates based on time
  const progress = time / duration;
  const pulseScale = 1 + 0.18 * Math.sin(progress * Math.PI * 2);
  const floatY = Math.sin(progress * Math.PI * 2) * 16;
  const starRot = (progress * 360) % 360;
  const haloRot = (progress * 180) % 360;

  return (
    <div className="relative rounded-2xl border border-studio-border bg-gradient-to-b from-studio-surface to-studio-bg p-4 sm:p-6 shadow-2xl shadow-black/60 overflow-hidden">
      {/* Top window chrome */}
      <div className="flex items-center justify-between pb-4 border-b border-studio-border/60 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-xs font-mono text-studio-muted ml-2">Looply Studio — Live Canvas Stage (640×360px)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
            60 FPS GPU
          </span>
          <span className="text-studio-muted font-mono">{time.toFixed(2)}s / 3.00s</span>
        </div>
      </div>

      {/* Center stage preview */}
      <div className="relative w-full h-72 sm:h-80 bg-[#0b0d13] rounded-xl border border-studio-border/40 overflow-hidden flex items-center justify-center">
        {/* Stage grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Layer 1: Ambient Halo */}
        <div
          className="absolute pointer-events-none transition-transform"
          style={{
            transform: `rotate(${haloRot}deg) scale(${pulseScale * 1.1})`,
            opacity: 0.6,
          }}
        >
          <div className="w-48 h-48 rounded-full border-2 border-dashed border-indigo-400/60 flex items-center justify-center" />
        </div>

        {/* Layer 2: Main Floating Emblem */}
        <div
          className="relative z-10 flex flex-col items-center justify-center cursor-pointer select-none"
          style={{
            transform: `translate3d(0, ${floatY}px, 0) scale(${pulseScale})`,
          }}
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-1 shadow-2xl shadow-indigo-500/40">
            <div className="w-full h-full bg-[#11131b] rounded-[13px] flex items-center justify-center">
              <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
          </div>
          <span className="mt-2.5 text-xs font-mono font-semibold text-white tracking-wide bg-studio-surface/80 px-2.5 py-0.5 rounded-full border border-studio-border">
            &lt;div class=&quot;looply-stage&quot;&gt;
          </span>
        </div>

        {/* Layer 3: Orbiting Sparkle Star */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            transform: `translate3d(${Math.cos(progress * Math.PI * 2) * 90}px, ${
              Math.sin(progress * Math.PI * 2) * 60 - 20
            }px, 0) rotate(${starRot}deg)`,
          }}
        >
          <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/80 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          </div>
        </div>
      </div>

      {/* Timeline scrubbing & controls */}
      <div className="mt-4 pt-3 border-t border-studio-border/60">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
            <button
              onClick={() => setTime(0)}
              className="p-2 rounded-lg bg-studio-surface hover:bg-studio-border text-studio-muted hover:text-white transition-colors"
              aria-label="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-studio-muted hidden sm:inline">
              Track: 3 Layers Active (Halo, Emblem, Star)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-surface hover:bg-studio-border text-xs font-medium text-white border border-studio-border transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Tweak in Editor
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors shadow-md shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSS / ZIP
            </Link>
          </div>
        </div>

        {/* Timeline track bar */}
        <div className="relative w-full h-4 bg-studio-bg rounded-md overflow-hidden border border-studio-border cursor-pointer flex items-center">
          <div
            className="h-full bg-indigo-600/40 rounded-l"
            style={{ width: `${(time / duration) * 100}%` }}
          />
          {/* Keyframe indicators on ruler */}
          <div className="absolute left-[0%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-black" />
          <div className="absolute left-[50%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-black" />
          <div className="absolute left-[100%] top-1/2 -translate-y-1/2 -translate-x-full w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-md shadow-white/50"
            style={{ left: `${(time / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
