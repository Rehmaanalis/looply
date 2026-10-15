'use client';

import React from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Download,
  FolderOpen,
  Sparkles,
  Undo2,
  Redo2,
  CheckCircle2,
  Clock,
  Layers,
  Sliders,
  ChevronLeft,
  Activity,
  ArrowDownUp,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  RefreshCw,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import { ProjectData } from '@/types/animation';

interface ToolbarProps {
  project: ProjectData;
  currentTime: number;
  isPlaying: boolean;
  canUndo: boolean;
  canRedo: boolean;
  playbackSpeed: number;
  reducedMotion: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  onTogglePlay: () => void;
  onRestart: () => void;
  onToggleLoop: () => void;
  onChangeSpeed: (speed: number) => void;
  onToggleReducedMotion: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenProjects: () => void;
  onOpenPresets: () => void;
  onOpenSpring: () => void;
  onOpenBezier: () => void;
  onOpenStagger: () => void;
  onOpenExport: () => void;
  onUpdateProjectName: (name: string) => void;
  onUpdateStageSettings: (settings: Partial<ProjectData['settings']>) => void;
  isLeftPanelOpen?: boolean;
  isRightPanelOpen?: boolean;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

export default function Toolbar({
  project,
  currentTime,
  isPlaying,
  canUndo,
  canRedo,
  playbackSpeed,
  reducedMotion,
  saveStatus,
  onTogglePlay,
  onRestart,
  onToggleLoop,
  onChangeSpeed,
  onToggleReducedMotion,
  onUndo,
  onRedo,
  onOpenProjects,
  onOpenPresets,
  onOpenSpring,
  onOpenBezier,
  onOpenStagger,
  onOpenExport,
  onUpdateProjectName,
  onUpdateStageSettings,
  isLeftPanelOpen,
  isRightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
}: ToolbarProps) {
  return (
    <header className="h-14 bg-studio-surface border-b border-studio-border px-4 flex items-center justify-between select-none">
      {/* Left: Brand + Project Info */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-studio-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-studio-panel"
          title="Back to Homepage"
        >
          <ChevronLeft className="w-5 h-5" />
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
            L
          </div>
        </Link>

        <div className="h-4 w-px bg-studio-border" />

        {/* Project Name Editable Input */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={project.name}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="bg-transparent hover:bg-studio-panel focus:bg-studio-panel px-2 py-1 rounded text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[140px] sm:max-w-[180px] truncate"
            title="Click to rename project"
          />
          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-studio-muted hover:text-white hover:bg-studio-panel transition-colors border border-studio-border"
            title="Open or Manage Projects"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Projects</span>
          </button>

          {/* Autosave Status Indicator */}
          <div className="hidden lg:flex items-center">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400/90 font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400/80 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20" title="All changes saved to IndexedDB">
                <Check className="w-2.5 h-2.5" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <button
                onClick={onOpenProjects}
                className="flex items-center gap-1 text-[11px] text-rose-300 font-mono px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
                title="Storage issue detected - Click to open storage manager & download JSON backup"
              >
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                <span>Storage Warning</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-studio-panel rounded-lg p-1 border border-studio-border">
          <button
            onClick={onRestart}
            className="p-1.5 rounded hover:bg-studio-surface text-studio-muted hover:text-white transition-colors"
            title="Restart to 0s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>
          <button
            onClick={onToggleLoop}
            className={`p-1.5 rounded transition-colors ${
              project.settings.loop
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-studio-muted hover:text-white hover:bg-studio-surface'
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <select
          value={playbackSpeed}
          onChange={(e) => onChangeSpeed(Number(e.target.value))}
          className="bg-studio-panel border border-studio-border rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
          title="Playback speed"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1.0x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2.0x</option>
        </select>

        {/* Reduced motion preview toggle */}
        <button
          onClick={onToggleReducedMotion}
          className={`p-1.5 rounded-lg border transition-colors ${
            reducedMotion
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-studio-panel border-studio-border text-studio-muted hover:text-white'
          }`}
          title={reducedMotion ? 'Reduced Motion: ON' : 'Preview Reduced Motion'}
        >
          <span className="text-[10px] font-mono uppercase font-semibold">RM</span>
        </button>

        {/* Time display */}
        <div className="hidden sm:flex items-center font-mono text-xs px-2.5 py-1 bg-studio-panel rounded-lg border border-studio-border text-slate-300">
          <span className="text-white font-semibold">{currentTime.toFixed(2)}s</span>
          <span className="text-studio-muted mx-1">/</span>
          <span className="text-studio-muted">{project.settings.duration.toFixed(1)}s</span>
        </div>
      </div>

      {/* Right: Advanced tools, History & Export */}
      <div className="flex items-center gap-2">
        {/* Precision Motion Tools (Spring, Bézier, Stagger) */}
        <div className="hidden xl:flex items-center gap-1.5">
          <button
            onClick={onOpenSpring}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-studio-panel hover:bg-studio-border text-xs text-indigo-300 border border-studio-border transition-colors"
            title="Configure Spring physics simulation"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Spring</span>
          </button>
          <button
            onClick={onOpenBezier}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-studio-panel hover:bg-studio-border text-xs text-pink-300 border border-studio-border transition-colors"
            title="Edit Cubic-Bézier motion curve"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Bézier</span>
          </button>
          <button
            onClick={onOpenStagger}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-studio-panel hover:bg-studio-border text-xs text-sky-300 border border-studio-border transition-colors"
            title="Choreograph staggered layer delays"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Stagger</span>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center border border-studio-border rounded-lg bg-studio-panel p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded text-studio-muted hover:text-white disabled:opacity-30 disabled:hover:text-studio-muted transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded text-studio-muted hover:text-white disabled:opacity-30 disabled:hover:text-studio-muted transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Panel View Toggles (Left: Assets/Layers, Right: Inspector) */}
        {(onToggleLeftPanel || onToggleRightPanel) && (
          <div className="hidden md:flex items-center border border-studio-border rounded-lg bg-studio-panel p-0.5">
            {onToggleLeftPanel && (
              <button
                onClick={onToggleLeftPanel}
                className={`p-1.5 rounded transition-colors ${
                  isLeftPanelOpen
                    ? 'bg-studio-surface text-indigo-400 shadow-xs'
                    : 'text-studio-muted hover:text-white hover:bg-studio-surface'
                }`}
                title={isLeftPanelOpen ? 'Collapse Left Panel (Assets & Layers)' : 'Show Left Panel (Assets & Layers)'}
              >
                <PanelLeft className="w-3.5 h-3.5" />
              </button>
            )}
            {onToggleRightPanel && (
              <button
                onClick={onToggleRightPanel}
                className={`p-1.5 rounded transition-colors ${
                  isRightPanelOpen
                    ? 'bg-studio-surface text-indigo-400 shadow-xs'
                    : 'text-studio-muted hover:text-white hover:bg-studio-surface'
                }`}
                title={isRightPanelOpen ? 'Collapse Inspector (Right Panel)' : 'Show Inspector (Right Panel)'}
              >
                <PanelRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Animation Presets Browser */}
        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-panel hover:bg-studio-border text-xs font-medium text-slate-200 border border-studio-border transition-colors"
          title="Browse animation presets"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Presets</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30"
          title="Export production-ready CSS and ZIP bundle"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSS</span>
        </button>
      </div>
    </header>
  );
}
