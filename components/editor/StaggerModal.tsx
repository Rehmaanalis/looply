'use client';

import React, { useState } from 'react';
import { X, Layers, Clock, Check, ArrowDownUp } from 'lucide-react';
import { LayerRecord } from '@/types/animation';
import { applyStaggerToLayers, StaggerOptions } from '@/lib/animation/stagger';

interface StaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layers: LayerRecord[];
  onApplyStagger: (updatedLayers: LayerRecord[]) => void;
}

export default function StaggerModal({
  isOpen,
  onClose,
  layers,
  onApplyStagger,
}: StaggerModalProps) {
  const [interval, setInterval] = useState(0.15);
  const [order, setOrder] = useState<'top-to-bottom' | 'bottom-to-top'>('top-to-bottom');
  const [baseDelay, setBaseDelay] = useState(0);

  if (!isOpen) return null;

  const previewLayers = applyStaggerToLayers(layers, {
    interval,
    order,
    baseDelay,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-studio-surface border border-studio-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <ArrowDownUp className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Staggered Layer Orchestration</h3>
              <p className="text-xs text-studio-muted">Distribute entry delays across all active layers</p>
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
        <div className="p-6 space-y-6 text-xs">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-studio-muted">Stagger Interval (Step delay)</span>
                <span className="font-mono text-white font-semibold">{interval.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-studio-muted block mb-1">Sequence Order</span>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value as any)}
                  className="w-full bg-studio-panel border border-studio-border rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="top-to-bottom">Top to Bottom (z-index)</option>
                  <option value="bottom-to-top">Bottom to Top</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-studio-muted block mb-1">Base Initial Delay (s)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={baseDelay}
                  onChange={(e) => setBaseDelay(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-studio-panel border border-studio-border rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Timing preview table */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-studio-muted block mb-2">
              Choreographed Timing Preview
            </span>
            <div className="bg-[#090b10] border border-studio-border rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
              {previewLayers.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[200px]">{l.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sky-400">delay: {l.delay.toFixed(2)}s</span>
                    <span className="text-[10px] text-studio-muted font-mono">dur: {l.duration}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-studio-border bg-studio-panel/40 flex items-center justify-between">
          <span className="text-xs text-studio-muted">{layers.length} layers will be updated.</span>
          <button
            onClick={() => {
              onApplyStagger(previewLayers);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Stagger
          </button>
        </div>
      </div>
    </div>
  );
}
