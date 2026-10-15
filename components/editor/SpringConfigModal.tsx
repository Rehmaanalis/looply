'use client';

import React, { useState } from 'react';
import { X, Activity, Zap, Check, Play, Sliders } from 'lucide-react';
import { SpringConfig, LayerRecord } from '@/types/animation';
import { SPRING_PRESETS, evaluateSpring, estimateSpringDuration } from '@/lib/animation/spring';

interface SpringConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLayer: LayerRecord | null;
  onApplySpring: (config: SpringConfig) => void;
}

export default function SpringConfigModal({
  isOpen,
  onClose,
  selectedLayer,
  onApplySpring,
}: SpringConfigModalProps) {
  const [config, setConfig] = useState<SpringConfig>(
    selectedLayer?.springConfig || {
      mass: 1,
      stiffness: 200,
      damping: 14,
      initialVelocity: 0,
      overshootClamping: false,
    }
  );

  if (!isOpen) return null;

  const estimatedDuration = estimateSpringDuration(config);

  // Generate SVG path points for visual curve representation
  const width = 360;
  const height = 140;
  const numSamples = 60;
  const points: [number, number][] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = (i / numSamples) * estimatedDuration;
    const val = evaluateSpring(config, t);
    // val 0 is at bottom (y = 110), val 1 is target (y = 40), overshoot goes above 40
    const x = (i / numSamples) * width;
    const y = 110 - val * 70;
    points.push([x, Math.max(10, Math.min(height - 10, y))]);
  }

  const pathData = points.reduce((acc, [px, py], idx) => {
    return idx === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
  }, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-studio-surface border border-studio-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Spring Physics Engine</h3>
              <p className="text-xs text-studio-muted">Reanimated-inspired physical harmonic oscillation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-studio-muted hover:text-white rounded-lg hover:bg-studio-panel transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Spring Curve Visualizer */}
          <div className="bg-[#090b10] border border-studio-border rounded-xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-studio-muted mb-2">
              <span>Oscillation Curve: 0% → 100%</span>
              <span className="text-emerald-400 font-semibold">Settles in ~{estimatedDuration}s</span>
            </div>

            <div className="relative w-full h-[140px] bg-studio-panel/30 rounded-lg overflow-hidden border border-studio-border/50">
              {/* Target line (100% arrival) */}
              <div className="absolute top-[40px] left-0 right-0 border-b border-dashed border-indigo-500/40 flex justify-end pr-2">
                <span className="text-[9px] font-mono text-indigo-400 -translate-y-3">Target (1.0)</span>
              </div>
              {/* Baseline (0% start) */}
              <div className="absolute top-[110px] left-0 right-0 border-b border-studio-border/40 flex justify-end pr-2">
                <span className="text-[9px] font-mono text-studio-muted -translate-y-3">Start (0.0)</span>
              </div>

              {/* Curve line */}
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
                <path d={pathData} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Presets Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-studio-muted mb-2">
              Spring Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPRING_PRESETS.map((preset) => {
                const isActive = config.stiffness === preset.config.stiffness && config.damping === preset.config.damping;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setConfig(preset.config)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-studio-panel border-studio-border hover:border-studio-borderHover text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span>{preset.name}</span>
                      {isActive && <Check className="w-3 h-3 text-indigo-400" />}
                    </div>
                    <div className="text-[10px] text-studio-muted truncate mt-0.5 font-mono">
                      k:{preset.config.stiffness} c:{preset.config.damping}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-studio-muted">Stiffness (Tension: k)</span>
                <span className="font-mono text-white">{config.stiffness}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={config.stiffness}
                onChange={(e) => setConfig({ ...config, stiffness: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-studio-muted">Damping (Friction: c)</span>
                <span className="font-mono text-white">{config.damping}</span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                step="0.5"
                value={config.damping}
                onChange={(e) => setConfig({ ...config, damping: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-studio-muted">Mass (Weight: m)</span>
                <span className="font-mono text-white">{config.mass}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={config.mass}
                onChange={(e) => setConfig({ ...config, mass: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-studio-border bg-studio-panel/40 flex items-center justify-between">
          <span className="text-xs text-studio-muted">
            Physics will be sampled into smooth CSS keyframes upon export.
          </span>
          <button
            onClick={() => {
              onApplySpring(config);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Spring Physics
          </button>
        </div>
      </div>
    </div>
  );
}
