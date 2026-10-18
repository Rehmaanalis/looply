'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Download,
  Code2,
  Sparkles,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import {
  IconPreset,
  PresetCategoryMeta,
  createProjectFromPreset,
} from '@/lib/presets/presetService';
import { saveProject } from '@/lib/storage/projectStore';
import PresetIcon from './PresetIcon';
import QuickExportModal from './QuickExportModal';

interface PresetsExplorerProps {
  initialPresets: IconPreset[];
  categories: PresetCategoryMeta[];
}

export default function PresetsExplorer({
  initialPresets,
  categories,
}: PresetsExplorerProps) {
  const router = useRouter();

  // Filters & Controls State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [themeColor, setThemeColor] = useState<'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'>('indigo');
  const [replayTriggerMap, setReplayTriggerMap] = useState<Record<string, number>>({});

  // Active Export Modal State
  const [selectedExportPreset, setSelectedExportPreset] = useState<IconPreset | null>(null);
  const [openingStudioId, setOpeningStudioId] = useState<string | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialPresets.length };
    initialPresets.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [initialPresets]);

  // Filtered presets
  const filteredPresets = useMemo(() => {
    return initialPresets.filter((preset) => {
      const matchesCategory =
        selectedCategory === 'all' || preset.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        preset.name.toLowerCase().includes(q) ||
        preset.description.toLowerCase().includes(q) ||
        preset.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialPresets, selectedCategory, search]);

  // Color mappings
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/25',
      text: 'text-indigo-400',
      glow: 'shadow-indigo-500/15',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/25',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/15',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/25',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/15',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/25',
      text: 'text-rose-400',
      glow: 'shadow-rose-500/15',
    },
    sky: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/25',
      text: 'text-sky-400',
      glow: 'shadow-sky-500/15',
    },
  };

  const activeColor = colorMap[themeColor];

  // Dynamic CSS stylesheet for all 85+ presets
  const dynamicKeyframesCSS = useMemo(() => {
    let css = '';
    initialPresets.forEach((preset) => {
      const animName = `looply-preview-${preset.id}`;
      const effectiveDuration = preset.duration / speedMultiplier;

      css += `@keyframes ${animName} {\n`;
      preset.keyframes.forEach((k) => {
        const rules: string[] = [];
        if (k.transform) rules.push(`transform: ${k.transform};`);
        if (k.opacity !== undefined) rules.push(`opacity: ${k.opacity};`);
        if (k.filter) rules.push(`filter: ${k.filter};`);
        if (k.transformOrigin) rules.push(`transform-origin: ${k.transformOrigin};`);
        css += `  ${k.pct}% { ${rules.join(' ')} }\n`;
      });
      css += `}\n`;

      css += `.anim-preview-${preset.id} {\n`;
      css += `  animation: ${animName} ${effectiveDuration.toFixed(2)}s ${preset.easing} infinite;\n`;
      css += `  animation-play-state: ${isPlaying ? 'running' : 'paused'};\n`;
      css += `  will-change: transform, opacity;\n`;
      css += `}\n`;
    });
    return css;
  }, [initialPresets, speedMultiplier, isPlaying]);

  const handleReplay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReplayTriggerMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleOpenStudio = async (preset: IconPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setOpeningStudioId(preset.id);
      const project = createProjectFromPreset(preset);
      await saveProject(project);
      router.push('/app');
    } catch (err) {
      console.error('Failed to open preset in App Studio', err);
      setOpeningStudioId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Inject compiled CSS keyframes */}
      <style dangerouslySetInnerHTML={{ __html: dynamicKeyframesCSS }} />

      {/* Control Toolbar: Search, Filters & Interactive Controls */}
      <div className="mb-8 space-y-4">
        {/* Top search & quick settings bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-studio-surface border border-studio-border p-3.5 rounded-xl shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 85+ presets (e.g. bounce, heart, shake, spin)..."
              className="w-full pl-10 pr-9 py-2 bg-studio-panel border border-studio-border rounded-lg text-sm text-white placeholder-studio-muted focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-studio-muted hover:text-white"
                aria-label="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Interactive Controls: Play/Pause, Speed, Color */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-studio-muted">
            {/* Play/Pause Toggle */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-panel border border-studio-border text-white hover:bg-studio-border transition-colors font-medium"
              title={isPlaying ? 'Pause All Previews' : 'Play All Previews'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            {/* Speed Multiplier Segmented Control */}
            <div className="flex items-center gap-1 bg-studio-panel border border-studio-border rounded-lg p-0.5">
              {[0.5, 1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    speedMultiplier === spd
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-studio-muted hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Accent Color Palette Selector */}
            <div className="flex items-center gap-1.5 bg-studio-panel border border-studio-border rounded-lg px-2 py-1">
              <span className="text-[11px] mr-1 hidden sm:inline">Color:</span>
              <button
                onClick={() => setThemeColor('indigo')}
                className={`w-3.5 h-3.5 rounded-full bg-indigo-500 transition-transform ${
                  themeColor === 'indigo' ? 'scale-125 ring-2 ring-indigo-400' : 'opacity-70 hover:opacity-100'
                }`}
                title="Indigo Accent"
              />
              <button
                onClick={() => setThemeColor('emerald')}
                className={`w-3.5 h-3.5 rounded-full bg-emerald-500 transition-transform ${
                  themeColor === 'emerald' ? 'scale-125 ring-2 ring-emerald-400' : 'opacity-70 hover:opacity-100'
                }`}
                title="Emerald Accent"
              />
              <button
                onClick={() => setThemeColor('amber')}
                className={`w-3.5 h-3.5 rounded-full bg-amber-500 transition-transform ${
                  themeColor === 'amber' ? 'scale-125 ring-2 ring-amber-400' : 'opacity-70 hover:opacity-100'
                }`}
                title="Amber Accent"
              />
              <button
                onClick={() => setThemeColor('rose')}
                className={`w-3.5 h-3.5 rounded-full bg-rose-500 transition-transform ${
                  themeColor === 'rose' ? 'scale-125 ring-2 ring-rose-400' : 'opacity-70 hover:opacity-100'
                }`}
                title="Rose Accent"
              />
              <button
                onClick={() => setThemeColor('sky')}
                className={`w-3.5 h-3.5 rounded-full bg-sky-500 transition-transform ${
                  themeColor === 'sky' ? 'scale-125 ring-2 ring-sky-400' : 'opacity-70 hover:opacity-100'
                }`}
                title="Sky Accent"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                    : 'bg-studio-surface border-studio-border text-studio-muted hover:text-white hover:border-studio-border/90'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-studio-panel text-studio-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Metric */}
      <div className="flex items-center justify-between text-xs text-studio-muted mb-5 px-1">
        <span>
          Showing <strong className="text-white font-mono tabular-nums">{filteredPresets.length}</strong> of{' '}
          <strong className="text-white font-mono tabular-nums">{initialPresets.length}</strong> animation presets
        </span>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Reset Category
          </button>
        )}
      </div>

      {/* Preset Card Grid */}
      {filteredPresets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-studio-border p-12 text-center bg-studio-surface/50">
          <Sparkles className="w-8 h-8 text-studio-muted mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No presets matched your search</h3>
          <p className="text-xs text-studio-muted max-w-sm mx-auto mb-4">
            Try searching for another keyword like &quot;bounce&quot;, &quot;pulse&quot;, or &quot;pop&quot;.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPresets.map((preset) => {
            const replayKey = replayTriggerMap[preset.id] || 0;
            const isOpeningThis = openingStudioId === preset.id;

            return (
              <div
                key={preset.id}
                id={preset.id}
                className="group relative bg-studio-surface border border-studio-border/75 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5"
              >
                {/* Top Section: Icon Preview Stage */}
                <div>
                  <div className="relative w-full h-32 rounded-lg bg-[#0e111a] border border-studio-border/60 flex items-center justify-center overflow-hidden mb-3.5 group-hover:bg-[#121622] transition-colors">
                    {/* Subtle grid backdrop */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:12px_12px]" />

                    {/* Replay Button in stage top-right */}
                    <button
                      onClick={(e) => handleReplay(preset.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-studio-surface/80 hover:bg-studio-surface text-studio-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all border border-studio-border"
                      title="Replay Animation"
                      aria-label={`Replay ${preset.name} animation`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Animated Icon Target */}
                    <div
                      key={replayKey}
                      className={`anim-preview-${preset.id} w-14 h-14 rounded-xl ${activeColor.bg} border ${activeColor.border} flex items-center justify-center ${activeColor.text} shadow-sm transition-transform`}
                    >
                      <PresetIcon name={preset.icon} className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Header & Category info */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors">
                      {preset.name}
                    </h3>
                    <span className="text-[10px] text-studio-muted font-mono uppercase tracking-wider shrink-0">
                      {preset.duration}s
                    </span>
                  </div>

                  {/* Metadata (Clean unboxed text with · separators per anti-slop rules) */}
                  <div className="text-[11px] text-studio-muted flex items-center gap-1.5 mb-2 capitalize">
                    <span>{preset.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate max-w-[130px]">{preset.useCase}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {preset.description}
                  </p>
                </div>

                {/* Card Action Buttons (2 distinct actions) */}
                <div className="pt-3 border-t border-studio-border/60 flex items-center gap-2">
                  {/* Action 1: Quick Export (1-click code) */}
                  <button
                    onClick={() => setSelectedExportPreset(preset)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-studio-panel hover:bg-studio-border border border-studio-border text-white text-xs font-medium transition-colors"
                    title="Export CSS or Reanimated code"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quick Export</span>
                  </button>

                  {/* Action 2: Open in App Studio */}
                  <button
                    onClick={(e) => handleOpenStudio(preset, e)}
                    disabled={isOpeningThis}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30"
                    title="Open on Studio canvas and timeline"
                  >
                    {isOpeningThis ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Studio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Export Modal */}
      <QuickExportModal
        preset={selectedExportPreset}
        isOpen={!!selectedExportPreset}
        onClose={() => setSelectedExportPreset(null)}
      />
    </div>
  );
}
