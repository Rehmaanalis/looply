'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Play } from 'lucide-react';
import {
  BezierPoints,
  BEZIER_PRESETS,
  formatCubicBezier,
  parseCubicBezier,
  evaluateCubicBezier,
} from '@/lib/animation/bezier';

interface CubicBezierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEasing?: string;
  onApplyEasing: (easingStr: string) => void;
}

export default function CubicBezierModal({
  isOpen,
  onClose,
  initialEasing,
  onApplyEasing,
}: CubicBezierModalProps) {
  const [points, setPoints] = useState<BezierPoints>({
    x1: 0.16,
    y1: 1.0,
    x2: 0.3,
    y2: 1.0,
  });

  const [previewProgress, setPreviewProgress] = useState(0);

  useEffect(() => {
    if (initialEasing) {
      const parsed = parseCubicBezier(initialEasing);
      if (parsed) setPoints(parsed);
    }
  }, [initialEasing, isOpen]);

  // Preview animation loop
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    let start = performance.now();
    const duration = 1500; // 1.5s preview loop

    const tick = (now: number) => {
      const elapsed = (now - start) % duration;
      const t = elapsed / duration;
      setPreviewProgress(t);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentEasingStr = formatCubicBezier(points);
  const evaluatedY = evaluateCubicBezier(points, previewProgress);

  // SVG coordinates for curve (box is 300x200, padding 30)
  const boxW = 280;
  const boxH = 140;
  const pad = 20;

  const p0 = { x: pad, y: boxH + pad };
  const p3 = { x: boxW + pad, y: pad };
  const p1 = { x: pad + points.x1 * boxW, y: boxH + pad - points.y1 * boxH };
  const p2 = { x: pad + points.x2 * boxW, y: boxH + pad - points.y2 * boxH };

  const curvePath = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-studio-surface border border-studio-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Cubic-Bézier Curve Editor</h3>
              <p className="text-xs text-studio-muted">Sculpt custom acceleration &amp; deceleration easing</p>
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
          {/* Visual SVG Curve Canvas */}
          <div className="bg-[#090b10] border border-studio-border rounded-xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-emerald-400 font-semibold">{currentEasingStr}</span>
              <span className="text-studio-muted text-[11px]">t: {(previewProgress * 100).toFixed(0)}%</span>
            </div>

            <div className="relative w-full h-[180px] bg-studio-panel/40 rounded-lg overflow-hidden border border-studio-border/50 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${boxW + pad * 2} ${boxH + pad * 2}`}>
                {/* Diagonal linear guideline */}
                <line x1={p0.x} y1={p0.y} x2={p3.x} y2={p3.y} stroke="#2a3042" strokeDasharray="4 4" strokeWidth="1.5" />

                {/* Tangent control handle lines */}
                <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#6366f1" strokeWidth="1.5" />
                <line x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} stroke="#ec4899" strokeWidth="1.5" />

                {/* The Bézier curve */}
                <path d={curvePath} fill="none" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />

                {/* Start & End anchors */}
                <circle cx={p0.x} cy={p0.y} r="4" fill="#94a3b8" />
                <circle cx={p3.x} cy={p3.y} r="4" fill="#94a3b8" />

                {/* P1 control point */}
                <circle cx={p1.x} cy={p1.y} r="6" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />

                {/* P2 control point */}
                <circle cx={p2.x} cy={p2.y} r="6" fill="#ec4899" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* Live Animation Ball Preview Track */}
            <div className="w-full mt-3 bg-studio-surface border border-studio-border rounded-lg p-2 flex items-center gap-3">
              <span className="text-[10px] font-mono text-studio-muted shrink-0">Motion Preview:</span>
              <div className="flex-1 h-3 bg-studio-panel rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-3 h-3 bg-indigo-500 rounded-full shadow-md"
                  style={{
                    left: `${Math.max(0, Math.min(1, evaluatedY)) * 92}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-studio-muted mb-2">
              Curve Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BEZIER_PRESETS.map((preset) => {
                const isActive =
                  points.x1 === preset.points.x1 &&
                  points.y1 === preset.points.y1 &&
                  points.x2 === preset.points.x2 &&
                  points.y2 === preset.points.y2;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setPoints(preset.points)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-studio-panel border-studio-border hover:border-studio-borderHover text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{preset.name}</div>
                    <div className="text-[10px] text-studio-muted truncate mt-0.5 font-mono">
                      {preset.points.x1}, {preset.points.y1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Numeric Coordinate Sliders */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3 bg-studio-panel rounded-xl border border-studio-border">
              <span className="text-[11px] font-semibold text-indigo-400 block">P1 (Start Velocity)</span>
              <div>
                <span className="text-[10px] text-studio-muted">X1: {points.x1.toFixed(2)}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={points.x1}
                  onChange={(e) => setPoints({ ...points, x1: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-studio-muted">Y1: {points.y1.toFixed(2)}</span>
                <input
                  type="range"
                  min="-0.5"
                  max="2.0"
                  step="0.05"
                  value={points.y1}
                  onChange={(e) => setPoints({ ...points, y1: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2 p-3 bg-studio-panel rounded-xl border border-studio-border">
              <span className="text-[11px] font-semibold text-pink-400 block">P2 (Deceleration)</span>
              <div>
                <span className="text-[10px] text-studio-muted">X2: {points.x2.toFixed(2)}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={points.x2}
                  onChange={(e) => setPoints({ ...points, x2: Number(e.target.value) })}
                  className="w-full accent-pink-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-studio-muted">Y2: {points.y2.toFixed(2)}</span>
                <input
                  type="range"
                  min="-0.5"
                  max="2.0"
                  step="0.05"
                  value={points.y2}
                  onChange={(e) => setPoints({ ...points, y2: Number(e.target.value) })}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-studio-border bg-studio-panel/40 flex items-center justify-between">
          <span className="text-xs text-studio-muted">Directly compatible with W3C CSS timing functions.</span>
          <button
            onClick={() => {
              onApplyEasing(currentEasingStr);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Easing Curve
          </button>
        </div>
      </div>
    </div>
  );
}
