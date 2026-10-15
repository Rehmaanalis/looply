'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Maximize2,
  Clock,
  Sparkles,
  BookmarkPlus,
  Palette,
  Layers,
  Activity,
  ArrowDownUp,
  SlidersHorizontal,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AlignCenter,
  AlignJustify,
  Trash2,
  Copy,
  Plus,
  Play,
  RotateCcw,
  PanelRightClose,
} from 'lucide-react';
import { LayerRecord, ProjectSettings, KeyframeRecord } from '@/types/animation';

interface PropertiesPanelProps {
  selectedLayer: LayerRecord | null;
  stageSettings: ProjectSettings;
  currentTime: number;
  selectedKeyframeId?: string | null;
  onSelectKeyframe?: (keyframeId: string | null) => void;
  onUpdateLayer: (layerId: string, updates: Partial<LayerRecord>) => void;
  onUpdateStage: (updates: Partial<ProjectSettings>) => void;
  onAddKeyframeAtTime: (layerId: string, time: number) => void;
  onDeleteKeyframe?: (layerId: string, keyframeId: string) => void;
  onDuplicateKeyframe?: (layerId: string, keyframeId: string) => void;
  onScrubTime?: (time: number) => void;
  onOpenPresets?: () => void;
  onOpenSpring?: () => void;
  onOpenBezier?: () => void;
  onOpenStagger?: () => void;
  onToggleCollapse?: () => void;
}

export default function PropertiesPanel({
  selectedLayer,
  stageSettings,
  currentTime,
  selectedKeyframeId,
  onSelectKeyframe,
  onUpdateLayer,
  onUpdateStage,
  onAddKeyframeAtTime,
  onDeleteKeyframe,
  onDuplicateKeyframe,
  onScrubTime,
  onOpenPresets,
  onOpenSpring,
  onOpenBezier,
  onOpenStagger,
  onToggleCollapse,
}: PropertiesPanelProps) {
  // Move layer helper for position controls
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedLayer) return;
    const newX = selectedLayer.x + dx;
    const newY = selectedLayer.y + dy;

    const updatedKfs = selectedLayer.keyframes?.map((k) => ({
      ...k,
      properties: {
        ...k.properties,
        x: k.properties.x !== undefined ? k.properties.x + dx : undefined,
        y: k.properties.y !== undefined ? k.properties.y + dy : undefined,
      },
    }));

    onUpdateLayer(selectedLayer.id, {
      x: newX,
      y: newY,
      keyframes: updatedKfs && updatedKfs.length > 0 ? updatedKfs : undefined,
    });
  };

  // Align layer on stage
  const handleAlign = (type: 'center-h' | 'center-v' | 'left' | 'right' | 'top' | 'bottom') => {
    if (!selectedLayer) return;
    const sw = stageSettings.width;
    const sh = stageSettings.height;
    const lw = selectedLayer.width;
    const lh = selectedLayer.height;

    let targetX = selectedLayer.x;
    let targetY = selectedLayer.y;

    if (type === 'center-h') targetX = Math.round((sw - lw) / 2);
    if (type === 'center-v') targetY = Math.round((sh - lh) / 2);
    if (type === 'left') targetX = 0;
    if (type === 'right') targetX = sw - lw;
    if (type === 'top') targetY = 0;
    if (type === 'bottom') targetY = sh - lh;

    const dx = targetX - selectedLayer.x;
    const dy = targetY - selectedLayer.y;

    handleNudge(dx, dy);
  };

  // Selected keyframe if any
  const currentKeyframe = selectedLayer?.keyframes?.find((k) => k.id === selectedKeyframeId) || null;

  if (!selectedLayer) {
    // Show Stage Settings when no layer is selected
    return (
      <div className="flex flex-col h-full bg-studio-surface border-l border-studio-border w-80 select-none overflow-y-auto">
        <div className="p-3 border-b border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Stage Settings
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenStagger && (
              <button
                onClick={onOpenStagger}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-studio-panel transition-colors"
                title="Choreograph layer entrance delays"
              >
                <ArrowDownUp className="w-3 h-3" />
                Stagger
              </button>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded text-studio-muted hover:text-white hover:bg-studio-panel transition-colors"
                title="Collapse Inspector"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-5 text-xs text-slate-300">
          <div>
            <label className="block text-[11px] font-medium text-studio-muted mb-1.5">
              Canvas Dimensions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-studio-muted">Width (px)</span>
                <input
                  type="number"
                  min="200"
                  max="1920"
                  value={stageSettings.width}
                  onChange={(e) => onUpdateStage({ width: Number(e.target.value) || 640 })}
                  className="w-full bg-studio-panel border border-studio-border rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-studio-muted">Height (px)</span>
                <input
                  type="number"
                  min="150"
                  max="1080"
                  value={stageSettings.height}
                  onChange={(e) => onUpdateStage({ height: Number(e.target.value) || 400 })}
                  className="w-full bg-studio-panel border border-studio-border rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-studio-muted mb-1.5">
              Stage Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={stageSettings.background || '#0f1117'}
                onChange={(e) => onUpdateStage({ background: e.target.value })}
                className="w-8 h-8 rounded border border-studio-border bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={stageSettings.background || '#0f1117'}
                onChange={(e) => onUpdateStage({ background: e.target.value })}
                className="flex-1 bg-studio-panel border border-studio-border rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-studio-muted mb-1.5">
              Animation Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={stageSettings.duration}
                onChange={(e) => onUpdateStage({ duration: Math.max(0.5, Number(e.target.value) || 3) })}
                className="w-full bg-studio-panel border border-studio-border rounded px-2.5 py-1.5 text-white font-mono"
              />
              <span className="text-studio-muted">sec</span>
            </div>
          </div>

          <div className="pt-4 border-t border-studio-border">
            <p className="text-[11px] text-studio-muted leading-relaxed">
              💡 Select any layer on the canvas or timeline to inspect coordinates, keyframes, motion presets, and timing curves.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Selected Layer Inspector
  return (
    <div className="flex flex-col h-full bg-studio-surface border-l border-studio-border w-80 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-studio-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white truncate">
            {selectedLayer.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onOpenPresets && (
            <button
              onClick={onOpenPresets}
              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-medium transition-colors border border-amber-500/20"
              title="Add motion preset to this layer"
            >
              <Sparkles className="w-3 h-3" />
              Presets
            </button>
          )}
          <button
            onClick={() => onAddKeyframeAtTime(selectedLayer.id, currentTime)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-colors"
            title={`Create keyframe at ${currentTime.toFixed(2)}s`}
          >
            <BookmarkPlus className="w-3 h-3" />
            + Keyframe
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 ml-0.5 rounded text-studio-muted hover:text-white hover:bg-studio-panel transition-colors"
              title="Collapse Inspector"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 text-xs text-slate-300">
        {/* Stage Position & Drag Option */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-indigo-400" />
              Stage Position &amp; Drag
            </span>
            <span className="text-[10px] text-indigo-300/70 font-mono">
              X:{selectedLayer.x} Y:{selectedLayer.y}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-studio-muted">X Position</span>
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="number"
                  value={selectedLayer.x}
                  onChange={(e) => {
                    const nextX = Number(e.target.value) || 0;
                    handleNudge(nextX - selectedLayer.x, 0);
                  }}
                  className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
                />
              </div>
            </div>
            <div>
              <span className="text-[10px] text-studio-muted">Y Position</span>
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="number"
                  value={selectedLayer.y}
                  onChange={(e) => {
                    const nextY = Number(e.target.value) || 0;
                    handleNudge(0, nextY - selectedLayer.y);
                  }}
                  className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Alignment Actions */}
          <div>
            <span className="text-[10px] text-studio-muted block mb-1">Quick Align to Stage</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleAlign('center-h')}
                className="py-1 px-1.5 rounded bg-studio-surface hover:bg-studio-panel border border-studio-border text-[10px] text-slate-300 hover:text-white transition-colors text-center"
              >
                Center X
              </button>
              <button
                type="button"
                onClick={() => handleAlign('center-v')}
                className="py-1 px-1.5 rounded bg-studio-surface hover:bg-studio-panel border border-studio-border text-[10px] text-slate-300 hover:text-white transition-colors text-center"
              >
                Center Y
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAlign('center-h');
                  handleAlign('center-v');
                }}
                className="py-1 px-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-[10px] text-indigo-300 hover:text-white transition-colors text-center font-medium"
              >
                Center Both
              </button>
              <button
                type="button"
                onClick={() => handleAlign('left')}
                className="py-1 px-1.5 rounded bg-studio-surface hover:bg-studio-panel border border-studio-border text-[10px] text-slate-300 hover:text-white transition-colors text-center"
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => handleAlign('top')}
                className="py-1 px-1.5 rounded bg-studio-surface hover:bg-studio-panel border border-studio-border text-[10px] text-slate-300 hover:text-white transition-colors text-center"
              >
                Top
              </button>
              <button
                type="button"
                onClick={() => handleAlign('bottom')}
                className="py-1 px-1.5 rounded bg-studio-surface hover:bg-studio-panel border border-studio-border text-[10px] text-slate-300 hover:text-white transition-colors text-center"
              >
                Bottom
              </button>
            </div>
          </div>

          {/* Interactive Nudge D-Pad */}
          <div className="flex items-center justify-between pt-1 border-t border-indigo-500/20">
            <span className="text-[10px] text-studio-muted">Nudge (10px):</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleNudge(-10, 0)}
                className="p-1 rounded bg-studio-surface hover:bg-studio-panel text-slate-300 hover:text-white border border-studio-border"
                title="Nudge Left 10px"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleNudge(0, -10)}
                className="p-1 rounded bg-studio-surface hover:bg-studio-panel text-slate-300 hover:text-white border border-studio-border"
                title="Nudge Up 10px"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleNudge(0, 10)}
                className="p-1 rounded bg-studio-surface hover:bg-studio-panel text-slate-300 hover:text-white border border-studio-border"
                title="Nudge Down 10px"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleNudge(10, 0)}
                className="p-1 rounded bg-studio-surface hover:bg-studio-panel text-slate-300 hover:text-white border border-studio-border"
                title="Nudge Right 10px"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Keyframe Manager for the Active Asset */}
        <div className="rounded-xl border border-studio-border bg-studio-panel/50 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Keyframe Manager ({selectedLayer.keyframes?.length || 0})
            </span>
            <button
              onClick={() => onAddKeyframeAtTime(selectedLayer.id, currentTime)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Add at {currentTime.toFixed(1)}s
            </button>
          </div>

          {/* List of keyframes for this layer */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
            {(!selectedLayer.keyframes || selectedLayer.keyframes.length === 0) ? (
              <div className="p-3 text-center text-[11px] text-studio-muted bg-studio-surface/50 rounded-lg">
                No keyframes yet. Click &quot;+ Keyframe&quot; or choose a Preset to animate this asset.
              </div>
            ) : (
              selectedLayer.keyframes.map((kf, i) => {
                const isSelected = selectedKeyframeId === kf.id;
                return (
                  <div
                    key={kf.id}
                    onClick={() => {
                      if (onSelectKeyframe) onSelectKeyframe(kf.id);
                      if (onScrubTime) onScrubTime(kf.time);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-xs'
                        : 'bg-studio-surface border-studio-border hover:border-studio-borderHover text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="font-mono font-medium text-[11px]">
                        {kf.time.toFixed(2)}s
                      </span>
                      <span className="text-[10px] text-studio-muted">
                        {kf.properties.opacity !== undefined ? `op:${kf.properties.opacity} ` : ''}
                        {kf.properties.scaleX !== undefined ? `scale:${kf.properties.scaleX} ` : ''}
                        {kf.properties.rotation !== undefined ? `rot:${kf.properties.rotation}°` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {onDuplicateKeyframe && (
                        <button
                          onClick={() => onDuplicateKeyframe(selectedLayer.id, kf.id)}
                          className="p-1 hover:text-white text-studio-muted rounded"
                          title="Duplicate this keyframe"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                      {onDeleteKeyframe && selectedLayer.keyframes.length > 1 && (
                        <button
                          onClick={() => onDeleteKeyframe(selectedLayer.id, kf.id)}
                          className="p-1 hover:text-rose-400 text-studio-muted rounded"
                          title="Delete keyframe"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick preset chain prompt */}
          {onOpenPresets && (
            <button
              onClick={onOpenPresets}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-[11px] font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Chain Presets (Entrance, Loop, Exit)
            </button>
          )}
        </div>

        {/* Dimensions & Transform Details */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-studio-muted block mb-2">
            Size &amp; Scale
          </span>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <span className="text-[10px] text-studio-muted">Width (px)</span>
              <input
                type="number"
                min="10"
                value={selectedLayer.width}
                onChange={(e) =>
                  onUpdateLayer(selectedLayer.id, { width: Math.max(10, Number(e.target.value) || 100) })
                }
                className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-studio-muted">Height (px)</span>
              <input
                type="number"
                min="10"
                value={selectedLayer.height}
                onChange={(e) =>
                  onUpdateLayer(selectedLayer.id, { height: Math.max(10, Number(e.target.value) || 100) })
                }
                className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-studio-muted">Scale X</span>
              <input
                type="number"
                step="0.1"
                min="0.05"
                value={selectedLayer.scaleX}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { scaleX: Number(e.target.value) || 1 })}
                className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-studio-muted">Scale Y</span>
              <input
                type="number"
                step="0.1"
                min="0.05"
                value={selectedLayer.scaleY}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { scaleY: Number(e.target.value) || 1 })}
                className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Rotation & Opacity */}
        <div className="pt-2 border-t border-studio-border space-y-3">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-studio-muted">Rotation</span>
              <span className="font-mono text-white">{selectedLayer.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedLayer.rotation}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-studio-muted">Opacity</span>
              <span className="font-mono text-white">{Math.round(selectedLayer.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={selectedLayer.opacity}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        {/* Animation Timing & Easing Curves */}
        <div className="pt-2 border-t border-studio-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-studio-muted">
              Timing &amp; Curves
            </span>
            {onOpenBezier && (
              <button
                onClick={onOpenBezier}
                className="text-[10px] text-pink-400 hover:text-pink-300 font-medium"
              >
                Curve Editor →
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-studio-muted">Easing Model</span>
              <select
                value={selectedLayer.easing}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { easing: e.target.value })}
                className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1.5 text-white"
              >
                <option value="ease">Ease (Standard W3C)</option>
                <option value="ease-in">Ease-In (Accelerate)</option>
                <option value="ease-out">Ease-Out (Decelerate)</option>
                <option value="ease-in-out">Ease-In-Out (Smooth S-curve)</option>
                <option value="linear">Linear (Constant speed)</option>
                <option value="spring">Spring Physics (Reanimated style)</option>
                <option value="cubic-bezier(0.16, 1, 0.3, 1)">Snappy Arrival (0.16, 1, 0.3, 1)</option>
                <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">Overshoot (0.34, 1.56, 0.64, 1)</option>
              </select>
            </div>

            {selectedLayer.easing === 'spring' && onOpenSpring && (
              <button
                onClick={onOpenSpring}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors text-[11px] font-medium"
              >
                <Activity className="w-3.5 h-3.5" />
                Tune Spring Physics (Mass, Stiffness, Damping)
              </button>
            )}

            {/* Layer Timeline Active Span (Start & End Time) */}
            <div className="pt-2 border-t border-studio-border/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-studio-muted">
                  Active Timeline Span (In / Out)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateLayer(selectedLayer.id, {
                      startTime: 0,
                      endTime: stageSettings.duration,
                    })
                  }
                  className="text-[9px] text-indigo-400 hover:text-indigo-300"
                >
                  Full Duration
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-studio-muted">Start Time (s)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={Math.max(0, (selectedLayer.endTime !== undefined ? selectedLayer.endTime : stageSettings.duration) - 0.1)}
                    value={selectedLayer.startTime ?? 0}
                    onChange={(e) => {
                      const newStart = Math.max(0, Number(e.target.value) || 0);
                      onUpdateLayer(selectedLayer.id, { startTime: newStart });
                    }}
                    className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-studio-muted">End Time (s)</span>
                  <input
                    type="number"
                    step="0.1"
                    min={(selectedLayer.startTime ?? 0) + 0.1}
                    max={stageSettings.duration}
                    value={selectedLayer.endTime !== undefined ? selectedLayer.endTime : stageSettings.duration}
                    onChange={(e) => {
                      const newEnd = Math.min(
                        stageSettings.duration,
                        Math.max((selectedLayer.startTime ?? 0) + 0.1, Number(e.target.value) || stageSettings.duration)
                      );
                      onUpdateLayer(selectedLayer.id, { endTime: newEnd });
                    }}
                    className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-studio-muted">Delay (s)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={selectedLayer.delay}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { delay: Math.max(0, Number(e.target.value) || 0) })
                  }
                  className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-studio-muted">Fill Mode</span>
                <select
                  value={selectedLayer.fillMode}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { fillMode: e.target.value as any })}
                  className="w-full bg-studio-panel border border-studio-border rounded px-2 py-1 text-white"
                >
                  <option value="forwards">Forwards</option>
                  <option value="backwards">Backwards</option>
                  <option value="both">Both</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
