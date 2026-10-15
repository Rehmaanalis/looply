'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Search,
  Layers,
  Plus,
  RefreshCw,
  Play,
  RotateCcw,
  Check,
} from 'lucide-react';
import { LayerRecord, KeyframeRecord, AssetRecord } from '@/types/animation';
import { ANIMATION_PRESETS, PresetCategory, PresetDefinition, combinePresetWithLayer } from '@/lib/animation/presets';

interface PresetsModalProps {
  selectedLayer: LayerRecord | null;
  assets?: Record<string, AssetRecord>;
  duration: number;
  currentTime?: number;
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (keyframes: KeyframeRecord[]) => void;
}

export default function PresetsModal({
  selectedLayer,
  assets = {},
  duration,
  currentTime = 0,
  isOpen,
  onClose,
  onApplyPreset,
}: PresetsModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory | 'all'>('all');
  const [applyMode, setApplyMode] = useState<'append' | 'merge' | 'replace'>('append');
  const [includeExistingMotion, setIncludeExistingMotion] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  const selectedAsset = selectedLayer ? assets[selectedLayer.assetId] : null;
  const existingKfCount = selectedLayer?.keyframes?.length || 0;

  const categories: { id: PresetCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Presets' },
    { id: 'entrance', label: 'Entrance' },
    { id: 'exit', label: 'Exit' },
    { id: 'attention', label: 'Attention' },
    { id: 'loop', label: 'Looping' },
    { id: 'creative', label: 'Creative & Combos' },
    { id: 'transform', label: 'Transform' },
  ];

  const filtered = ANIMATION_PRESETS.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Generate dynamic CSS @keyframes for every preset card preview
  const generatedPreviewCSS = useMemo(() => {
    if (!selectedLayer) return '';

    let css = '';
    const previewDuration = 2.0;

    ANIMATION_PRESETS.forEach((preset) => {
      let kfs: KeyframeRecord[] = [];

      if (includeExistingMotion && existingKfCount > 0) {
        // Show selected layer's existing animation followed by this preset!
        const existing = selectedLayer.keyframes || [];
        const presetKfs = preset.generateKeyframes(selectedLayer, 1.2);
        const maxExistingTime = existing.reduce((max, k) => Math.max(max, k.time), 0);
        const shiftedPresetKfs = presetKfs.map((k) => ({
          ...k,
          time: maxExistingTime + k.time,
        }));
        kfs = [...existing, ...shiftedPresetKfs].sort((a, b) => a.time - b.time);
      } else {
        kfs = preset.generateKeyframes(selectedLayer, previewDuration);
      }

      if (kfs.length < 2) return;

      const totalTime = Math.max(0.5, kfs[kfs.length - 1].time || previewDuration);
      const animName = `anim-preview-${preset.id}`;

      css += `@keyframes ${animName} {\n`;
      kfs.forEach((k) => {
        const pct = Math.max(0, Math.min(100, Math.round((k.time / totalTime) * 100)));
        // Scale delta relative to selectedLayer
        const dx = (k.properties.x ?? selectedLayer.x) - selectedLayer.x;
        const dy = (k.properties.y ?? selectedLayer.y) - selectedLayer.y;
        // Clamp preview delta for compact preview card container
        const previewDx = Math.max(-45, Math.min(45, dx * 0.25));
        const previewDy = Math.max(-30, Math.min(30, dy * 0.25));
        const sx = k.properties.scaleX ?? selectedLayer.scaleX ?? 1;
        const sy = k.properties.scaleY ?? selectedLayer.scaleY ?? 1;
        const rot = k.properties.rotation ?? selectedLayer.rotation ?? 0;
        const op = k.properties.opacity ?? selectedLayer.opacity ?? 1;

        css += `  ${pct}% {\n`;
        css += `    transform: translate3d(${previewDx}px, ${previewDy}px, 0) scale(${sx}, ${sy}) rotate(${rot}deg);\n`;
        css += `    opacity: ${op};\n`;
        css += `  }\n`;
      });
      css += `}\n`;
    });

    return css;
  }, [selectedLayer, includeExistingMotion, existingKfCount]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: PresetDefinition) => {
    if (!selectedLayer) return;
    const remainingTime = Math.max(0.2, duration - currentTime);
    const newKfs = preset.generateKeyframes(selectedLayer, remainingTime);

    if (applyMode === 'append') {
      // Shift keyframes so they start at current playhead time
      const shifted = newKfs.map((k, idx) => ({
        ...k,
        id: `kf-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        time: Math.min(duration, Math.round((currentTime + k.time) * 100) / 100),
      }));

      const existing = selectedLayer.keyframes || [];
      const merged = combinePresetWithLayer(existing, shifted);
      onApplyPreset(merged);
    } else if (applyMode === 'merge') {
      const merged = combinePresetWithLayer(selectedLayer.keyframes || [], newKfs);
      onApplyPreset(merged);
    } else {
      onApplyPreset(newKfs);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      {/* Inject Dynamic Keyframe Styles for Live Previews */}
      {generatedPreviewCSS && (
        <style dangerouslySetInnerHTML={{ __html: generatedPreviewCSS }} />
      )}

      <div className="bg-studio-surface border border-studio-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-studio-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Preset Motion Library</h3>
              <p className="text-xs text-studio-muted">
                {selectedLayer ? (
                  <span>
                    Selected layer: <strong className="text-white">{selectedLayer.name}</strong> ({existingKfCount} keyframes currently)
                  </span>
                ) : (
                  'Select a layer to apply motion presets'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-studio-muted hover:text-white rounded-lg hover:bg-studio-panel transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Multiple Keyframe Strategy Selector */}
        <div className="p-4 border-b border-studio-border bg-studio-panel/40 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-studio-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search presets (e.g. bounce, pulse, slide, spin, float, pop)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-studio-surface border border-studio-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-studio-muted focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Application Mode: Append / Merge / Replace */}
            <div className="flex items-center bg-studio-surface p-1 rounded-xl border border-studio-border shrink-0">
              <button
                type="button"
                onClick={() => setApplyMode('append')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  applyMode === 'append'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-studio-muted hover:text-white'
                }`}
                title={`Chain animation starting from playhead (${currentTime.toFixed(2)}s)`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Append @ {currentTime.toFixed(1)}s</span>
              </button>
              <button
                type="button"
                onClick={() => setApplyMode('merge')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  applyMode === 'merge'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-studio-muted hover:text-white'
                }`}
                title="Merge properties into existing keyframe tracks"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Merge</span>
              </button>
              <button
                type="button"
                onClick={() => setApplyMode('replace')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  applyMode === 'replace'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-studio-muted hover:text-white'
                }`}
                title="Wipe existing keyframes and apply fresh"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace All</span>
              </button>
            </div>
          </div>

          {/* Options Row: Filter Categories & Selected Layer Preview Options */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-studio-border/40">
            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-studio-surface text-studio-muted hover:text-white hover:bg-studio-panel'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Requirement 3: Card animation preview option (Include existing motion vs preset only) */}
            {selectedLayer && existingKfCount > 0 && (
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setIncludeExistingMotion((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                    includeExistingMotion
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-studio-surface text-studio-muted border-studio-border hover:text-white'
                  }`}
                  title="Show how the preset will look chained with your layer's existing keyframe animation"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Preview with Existing Motion ({existingKfCount} kfs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="p-1 text-studio-muted hover:text-white rounded hover:bg-studio-panel"
                  title="Replay all previews"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Presets Grid with Live Selected Layer Motion Cards */}
        <div className="flex-1 overflow-y-auto p-5" key={previewKey}>
          {!selectedLayer ? (
            <div className="p-12 text-center text-xs text-studio-muted">
              Please select a layer on the canvas or timeline first to preview and apply motion presets.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-studio-muted">
              No presets found matching &quot;{search}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="rounded-xl border border-studio-border bg-studio-panel hover:border-indigo-500/70 hover:bg-studio-panel/90 transition-all flex flex-col justify-between cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg"
                >
                  {/* Live Card Animation Preview Container showcasing the selected layer! */}
                  <div className="h-28 bg-[#07090e] border-b border-studio-border/70 relative flex items-center justify-center overflow-hidden">
                    {/* Grid Pattern in Preview Box */}
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
                        backgroundSize: '12px 12px',
                      }}
                    />

                    {/* Miniature Selected Layer Element Animated with the Preset Motion! */}
                    <div
                      className="relative z-10 w-14 h-14 flex items-center justify-center transition-all select-none pointer-events-none"
                      style={{
                        animation: `anim-preview-${preset.id} 2.2s infinite ease-in-out`,
                      }}
                    >
                      {selectedAsset?.dataUrl ? (
                        <img
                          src={selectedAsset.dataUrl}
                          alt={selectedLayer.name}
                          className="max-w-full max-h-full object-contain filter drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                          {selectedLayer.name.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Preview overlay tags */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 z-20">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-studio-muted border border-studio-border/60 uppercase">
                        {preset.category}
                      </span>
                    </div>

                    <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-studio-muted/75 z-20">
                      {includeExistingMotion && existingKfCount > 0 ? 'Chained preview' : 'Preset motion'}
                    </div>
                  </div>

                  {/* Card Description & Details */}
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {preset.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-studio-muted leading-relaxed mb-3">
                        {preset.description}
                      </p>
                    </div>

                    {/* Apply Action Bar */}
                    <div className="w-full flex items-center justify-between pt-2 border-t border-studio-border/50 text-[11px] text-indigo-400 font-medium">
                      <span>
                        {applyMode === 'append'
                          ? `+ Append @ ${currentTime.toFixed(1)}s`
                          : applyMode === 'merge'
                          ? '+ Merge Keyframes'
                          : 'Apply Preset (Replace)'}
                      </span>
                      <Zap className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
