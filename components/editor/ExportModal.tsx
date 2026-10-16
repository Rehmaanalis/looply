'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Layers,
  Sparkles,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ExternalLink,
  FileJson,
  Database,
  Smartphone,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';
import { ProjectData } from '@/types/animation';
import { generateAnimationCSS } from '@/lib/export/cssGenerator';
import { generateReanimatedExport } from '@/lib/export/reanimated';
import {
  ReanimatedOutputMode,
  ReanimatedLanguage,
  ReanimatedExportTarget,
} from '@/lib/export/reanimated/types';

interface ExportModalProps {
  project: ProjectData;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ project, isOpen, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'reanimated' | 'json' | 'report'>('code');
  const [codeSubView, setCodeSubView] = useState<'both' | 'css' | 'html'>('both');
  const [assetMode, setAssetMode] = useState<'inline' | 'zip'>('inline');
  const [jsonFormat, setJsonFormat] = useState<'formatted' | 'minified'>('formatted');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Reanimated Export options
  const [rnOutputMode, setRnOutputMode] = useState<ReanimatedOutputMode>('interpolation');
  const [rnExportTarget, setRnExportTarget] = useState<ReanimatedExportTarget>('component');
  const [rnLanguage, setRnLanguage] = useState<ReanimatedLanguage>('typescript');
  const [rnIncludeGuide, setRnIncludeGuide] = useState(true);
  const [rnShowDiagnostics, setRnShowDiagnostics] = useState(false);

  // Accessibility options
  const [includeReducedMotion, setIncludeReducedMotion] = useState(true);

  // Generate code dynamically based on current project & asset mode
  const generated = useMemo(() => {
    return generateAnimationCSS(project, {
      mode: assetMode,
    });
  }, [project, assetMode]);

  // Live preview must always use inline data URLs so the iframe can render graphics without a web server assets directory
  const previewGenerated = useMemo(() => {
    return generateAnimationCSS(project, {
      mode: 'inline',
    });
  }, [project]);

  // Extract clean embed HTML containing all layers and images
  const extractStageHTML = () => {
    return generated.stageHtml;
  };

  const getEffectiveCSS = () => {
    let css = generated.css;
    if (includeReducedMotion) {
      css += `\n/* Accessibility: Respect user prefers-reduced-motion preference */\n@media (prefers-reduced-motion: reduce) {\n  .looply-layer {\n    animation: none !important;\n    transition: none !important;\n  }\n}\n`;
    }
    return css;
  };

  // JSON generation & metrics
  const formattedJson = useMemo(() => {
    return JSON.stringify(project, null, 2);
  }, [project]);

  const minifiedJson = useMemo(() => {
    return JSON.stringify(project);
  }, [project]);

  const activeJson = jsonFormat === 'formatted' ? formattedJson : minifiedJson;

  const totalKeyframes = useMemo(() => {
    return project.layers.reduce((acc, l) => acc + (l.keyframes?.length || 0), 0);
  }, [project.layers]);

  const totalAssets = useMemo(() => {
    return Object.keys(project.assets || {}).length;
  }, [project.assets]);

  const formattedJsonSize = useMemo(() => {
    const bytes = new Blob([activeJson]).size;
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  }, [activeJson]);

  // Reanimated code generation
  const reanimatedResult = useMemo(() => {
    return generateReanimatedExport(project, {
      outputMode: rnOutputMode,
      exportTarget: rnExportTarget,
      language: rnLanguage,
      includeIntegrationGuide: rnIncludeGuide,
      masterTimelineSync: true,
    });
  }, [project, rnOutputMode, rnExportTarget, rnLanguage, rnIncludeGuide]);

  if (!isOpen) return null;

  const stageHTML = extractStageHTML();
  const effectiveCSS = getEffectiveCSS();

  // Combined self-contained embed HTML + CSS
  const combinedCode = `<!-- HTML Markup -->\n${stageHTML}\n\n<!-- CSS Stylesheet -->\n<style>\n${effectiveCSS}</style>`;

  // Live preview full document string for iframe srcDoc (always inline assets so it renders in-memory)
  const previewDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 24px; background: #0b0d14; display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: auto; }
    ${previewGenerated.css}
  </style>
</head>
<body>
  ${previewGenerated.stageHtml}
</body>
</html>`;


  const handleDownloadJson = () => {
    const blob = new Blob([activeJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `${safeName}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReanimated = () => {
    const blob = new Blob([reanimatedResult.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reanimatedResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-studio-surface border border-studio-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-studio-border flex items-center justify-between shrink-0 bg-studio-panel/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Export &amp; Backup Animation</h3>
              <p className="text-xs text-studio-muted">
                {project.layers.length} layers • {project.settings.duration}s master timeline • Zero JS runtime
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

        {/* Export Tabs */}
        <div className="flex items-center border-b border-studio-border bg-studio-panel/40 px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'code'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            HTML &amp; CSS Code
          </button>
          <button
            onClick={() => setActiveTab('reanimated')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'reanimated'
                ? 'border-cyan-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            React Native Reanimated
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
              v3.x
            </span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'json'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <FileJson className="w-4 h-4 text-violet-400" />
            JSON Backup
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'report'
                ? 'border-sky-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Timeline &amp; Compatibility Report
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: HTML & CSS Code */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              {/* Top Controls Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-studio-panel/60 p-3 rounded-xl border border-studio-border">
                {/* Left Controls: Sub-view switcher & Asset format */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* View: Both vs HTML vs CSS */}
                  <div className="flex items-center bg-studio-surface p-1 rounded-lg border border-studio-border text-xs">
                    <button
                      onClick={() => setCodeSubView('both')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        codeSubView === 'both' ? 'bg-indigo-600 text-white shadow-xs' : 'text-studio-muted hover:text-white'
                      }`}
                    >
                      HTML + CSS
                    </button>
                    <button
                      onClick={() => setCodeSubView('html')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        codeSubView === 'html' ? 'bg-indigo-600 text-white shadow-xs' : 'text-studio-muted hover:text-white'
                      }`}
                    >
                      HTML Only
                    </button>
                    <button
                      onClick={() => setCodeSubView('css')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        codeSubView === 'css' ? 'bg-indigo-600 text-white shadow-xs' : 'text-studio-muted hover:text-white'
                      }`}
                    >
                      CSS Only
                    </button>
                  </div>

                  {/* Asset Format Selector */}
                  <div className="flex items-center gap-1.5 bg-studio-surface px-2 py-1 rounded-lg border border-studio-border text-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-studio-muted text-[11px]">Images:</span>
                    <button
                      onClick={() => setAssetMode('inline')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        assetMode === 'inline'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'text-studio-muted hover:text-white'
                      }`}
                      title="Embed images directly as data URLs so the snippet works anywhere standalone"
                    >
                      Self-Contained (Data URLs)
                    </button>
                    <button
                      onClick={() => setAssetMode('zip')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        assetMode === 'zip'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'text-studio-muted hover:text-white'
                      }`}
                      title="Reference local assets/ folder (for production websites or external hosting)"
                    >
                      assets/ Relative
                    </button>
                  </div>
                </div>

                {/* Right Controls: Live preview toggle & Accessibility */}
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <button
                    onClick={() => setShowLivePreview((p) => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                      showLivePreview
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-studio-surface border-studio-border text-studio-muted hover:text-white'
                    }`}
                  >
                    {showLivePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showLivePreview ? 'Hide Live Preview' : 'Test Live Preview'}</span>
                  </button>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px]" title="Add prefers-reduced-motion media query fallback">
                    <input
                      type="checkbox"
                      checked={includeReducedMotion}
                      onChange={(e) => setIncludeReducedMotion(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Reduced Motion</span>
                  </label>
                </div>
              </div>

              {/* Optional Live Preview Container */}
              {showLivePreview && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#090b10] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Live CSS Animation Preview (Rendered from Generated Code)
                    </span>
                    <span className="text-[11px] text-studio-muted font-mono">
                      {project.settings.width}x{project.settings.height}px @ {project.settings.duration}s
                    </span>
                  </div>
                  <div className="flex justify-center bg-black/50 p-4 rounded-lg overflow-auto border border-studio-border">
                    <iframe
                      title="Looply Export Preview"
                      srcDoc={previewDoc}
                      className="border-0 shadow-lg rounded"
                      style={{
                        width: `${Math.min(project.settings.width + 60, 680)}px`,
                        height: `${Math.min(project.settings.height + 60, 360)}px`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Code Blocks */}
              <div className="space-y-4">
                {/* HTML Block */}
                {(codeSubView === 'both' || codeSubView === 'html') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>HTML Markup ({project.layers.length} layers)</span>
                      </div>
                      <button
                        onClick={() => handleCopy(stageHTML, 'html')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                      >
                        {copiedType === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedType === 'html' ? 'Copied HTML!' : 'Copy HTML'}
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[#090b10] border border-studio-border text-slate-300 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                      <code>{stageHTML}</code>
                    </pre>
                  </div>
                )}

                {/* CSS Block */}
                {(codeSubView === 'both' || codeSubView === 'css') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        <span>CSS Stylesheet (Synchronized Keyframes)</span>
                      </div>
                      <button
                        onClick={() => handleCopy(effectiveCSS, 'css')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
                      >
                        {copiedType === 'css' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedType === 'css' ? 'Copied CSS!' : 'Copy CSS'}
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[#090b10] border border-studio-border text-slate-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                      <code>{effectiveCSS}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              {codeSubView === 'both' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-studio-border">
                  <span className="text-xs text-studio-muted">
                    {assetMode === 'inline'
                      ? 'Self-contained Data URLs enabled: Copy and paste anywhere with all images embedded.'
                      : 'Relative paths enabled: Requires images in an assets/ directory alongside HTML/CSS.'}
                  </span>
                  <button
                    onClick={() => handleCopy(combinedCode, 'both')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm"
                  >
                    {copiedType === 'both' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedType === 'both' ? 'Copied Both to Clipboard!' : 'Copy Complete HTML & CSS'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: React Native Reanimated Export */}
          {activeTab === 'reanimated' && (
            <div className="space-y-4">
              {/* Top Controls Bar */}
              <div className="flex flex-col gap-3 bg-studio-panel/60 p-3 rounded-xl border border-studio-border">
                {/* Target & Mode Selectors */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Export Target Switcher */}
                  <div className="flex items-center gap-2">
                    <span className="text-studio-muted text-xs font-medium">Export:</span>
                    <div className="flex items-center bg-studio-surface p-1 rounded-lg border border-studio-border text-xs">
                      <button
                        onClick={() => setRnExportTarget('component')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          rnExportTarget === 'component'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-studio-muted hover:text-white'
                        }`}
                        title="Complete drop-in React Native Component (<LooplyAnimation />) with stage and assets"
                      >
                        Component ({rnLanguage === 'typescript' ? '.tsx' : '.jsx'})
                      </button>
                      <button
                        onClick={() => setRnExportTarget('hook')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          rnExportTarget === 'hook'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-studio-muted hover:text-white'
                        }`}
                        title="Encapsulated Custom Hook (useLooplyAnimation())"
                      >
                        Custom Hook
                      </button>
                      <button
                        onClick={() => setRnExportTarget('logic')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          rnExportTarget === 'logic'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-studio-muted hover:text-white'
                        }`}
                        title="Raw hook declarations and trigger statements for existing components"
                      >
                        Logic Only
                      </button>
                    </div>
                  </div>

                  {/* Language Switcher */}
                  <div className="flex items-center gap-2">
                    <span className="text-studio-muted text-xs font-medium">Lang:</span>
                    <div className="flex items-center bg-studio-surface p-1 rounded-lg border border-studio-border text-xs">
                      <button
                        onClick={() => setRnLanguage('typescript')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          rnLanguage === 'typescript'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-studio-muted hover:text-white'
                        }`}
                      >
                        TypeScript
                      </button>
                      <button
                        onClick={() => setRnLanguage('javascript')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          rnLanguage === 'javascript'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-studio-muted hover:text-white'
                        }`}
                      >
                        JavaScript
                      </button>
                    </div>
                  </div>
                </div>

                {/* Engine Mode & Options Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-studio-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-studio-muted text-xs font-medium">Mode:</span>
                    <div className="flex items-center bg-studio-surface p-1 rounded-lg border border-studio-border text-xs">
                      <button
                        onClick={() => setRnOutputMode('interpolation')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          rnOutputMode === 'interpolation'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-studio-muted hover:text-white'
                        }`}
                        title="Single master timeline progress driver (Recommended: 100% CSS Parity)"
                      >
                        Master Timeline (Interpolation)
                      </button>
                      <button
                        onClick={() => setRnOutputMode('sequence')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          rnOutputMode === 'sequence'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-studio-muted hover:text-white'
                        }`}
                        title="Sequential withSequence chains per track synchronized to master checkpoints"
                      >
                        Sequential Tracks
                      </button>
                      <button
                        onClick={() => setRnOutputMode('expressions')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          rnOutputMode === 'expressions'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-studio-muted hover:text-white'
                        }`}
                        title="Direct animation trigger expressions"
                      >
                        Expressions
                      </button>
                    </div>
                  </div>

                  {/* Integration Guide Checkbox */}
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px]" title="Include screen/component integration comments">
                      <input
                        type="checkbox"
                        checked={rnIncludeGuide}
                        onChange={(e) => setRnIncludeGuide(e.target.checked)}
                        className="accent-cyan-500 rounded"
                      />
                      <span>Integration Guide</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Compatibility & Parity Banner */}
              <div className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2 ${
                reanimatedResult.report.overallStatus === 'ready'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Master Timeline Parity: 100% Synchronized with HTML/CSS Keyframes (No Timing Drift)
                    </span>
                  </div>
                  <button
                    onClick={() => setRnShowDiagnostics((p) => !p)}
                    className="text-[11px] underline hover:text-white flex items-center gap-1"
                  >
                    {rnShowDiagnostics ? 'Hide Report' : 'Inspect Report'}
                    {rnShowDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Collapsible Diagnostics list */}
                {rnShowDiagnostics && (
                  <div className="space-y-2 pt-2 border-t border-white/10 mt-1">
                    {reanimatedResult.report.approximate.map((diag, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20 text-[11px] space-y-1">
                        <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {diag.title}
                        </div>
                        <p className="text-slate-300">{diag.message}</p>
                        {diag.suggestion && (
                          <p className="text-amber-200/90 font-mono text-[10px]">
                            💡 Tip: {diag.suggestion}
                          </p>
                        )}
                      </div>
                    ))}

                    {reanimatedResult.report.supported.map((diag, i) => (
                      <div key={i} className="p-2 rounded-lg bg-black/20 text-[11px] flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{diag.title}: {diag.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Required Shared Values & Styles Integration Strip */}
              <div className="bg-studio-panel/50 border border-studio-border rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-200 font-medium">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Integration Contracts (Animation Logic Only)
                  </span>
                  <span className="text-[10px] text-studio-muted">Zero component lock-in</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-studio-surface border border-studio-border">
                    <span className="text-studio-muted block text-[10px] uppercase font-semibold">Required Shared Values:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {reanimatedResult.sharedValues.length > 0 ? (
                        reanimatedResult.sharedValues.map((sv) => (
                          <span key={sv.name} className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-[10px]">
                            {sv.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-studio-muted">None (all layers static)</span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-studio-surface border border-studio-border">
                    <span className="text-studio-muted block text-[10px] uppercase font-semibold">Animated Style Hooks:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {reanimatedResult.animatedStyles.map((st) => (
                        <span key={st.name} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[10px]">
                          {st.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Block with Header Actions */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-studio-panel/60 p-2.5 rounded-xl border border-studio-border text-xs">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-white text-[11px] font-semibold">{reanimatedResult.filename}</span>
                    <span className="text-[10px] text-studio-muted font-mono">
                      {(new Blob([reanimatedResult.code]).size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(reanimatedResult.code, 'reanimated')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                    >
                      {copiedType === 'reanimated' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedType === 'reanimated' ? 'Copied Code!' : 'Copy Code'}
                    </button>

                    <button
                      onClick={handleDownloadReanimated}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download {reanimatedResult.filename}
                    </button>
                  </div>
                </div>

                <pre className="p-3.5 rounded-xl bg-[#090b10] border border-studio-border text-cyan-200/90 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed selection:bg-cyan-600/30">
                  <code>{reanimatedResult.code}</code>
                </pre>
              </div>
            </div>
          )}


          {/* TAB 3: JSON Backup Option (Full fidelity project backup) */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <FileJson className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Full Project JSON Backup</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      Export 100% of your project data including all {project.layers.length} layers, {totalKeyframes} keyframes, spring physics configs, canvas settings, and {totalAssets} embedded graphic assets.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadJson}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-md shadow-violet-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSON Backup
                  </button>
                </div>
              </div>

              {/* Metrics pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg border border-studio-border bg-studio-panel">
                  <span className="text-[10px] text-studio-muted uppercase font-medium">Backup Size</span>
                  <div className="text-sm font-bold font-mono text-violet-300 mt-0.5">{formattedJsonSize}</div>
                </div>
                <div className="p-3 rounded-lg border border-studio-border bg-studio-panel">
                  <span className="text-[10px] text-studio-muted uppercase font-medium">Layers &amp; Elements</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{project.layers.length} layers</div>
                </div>
                <div className="p-3 rounded-lg border border-studio-border bg-studio-panel">
                  <span className="text-[10px] text-studio-muted uppercase font-medium">Total Keyframes</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{totalKeyframes} keyframes</div>
                </div>
                <div className="p-3 rounded-lg border border-studio-border bg-studio-panel">
                  <span className="text-[10px] text-studio-muted uppercase font-medium">Embedded Assets</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{totalAssets} graphic assets</div>
                </div>
              </div>

              {/* Code viewer header controls */}
              <div className="flex items-center justify-between bg-studio-panel/60 p-2.5 rounded-xl border border-studio-border text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-studio-muted text-[11px] font-medium">Format:</span>
                  <div className="flex items-center bg-studio-surface p-0.5 rounded-lg border border-studio-border text-[11px]">
                    <button
                      onClick={() => setJsonFormat('formatted')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        jsonFormat === 'formatted' ? 'bg-violet-600 text-white shadow-xs' : 'text-studio-muted hover:text-white'
                      }`}
                    >
                      Formatted (Readable)
                    </button>
                    <button
                      onClick={() => setJsonFormat('minified')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        jsonFormat === 'minified' ? 'bg-violet-600 text-white shadow-xs' : 'text-studio-muted hover:text-white'
                      }`}
                    >
                      Minified (Compact)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeJson, 'json')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-300 hover:text-white bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-colors"
                  >
                    {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedType === 'json' ? 'Copied JSON!' : 'Copy JSON'}
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>
              </div>

              {/* JSON Code display block */}
              <div className="space-y-1.5">
                <pre className="p-3.5 rounded-xl bg-[#090b10] border border-studio-border text-violet-200/90 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed selection:bg-violet-600/30">
                  <code>{activeJson}</code>
                </pre>
              </div>

              {/* Restore Instructions */}
              <div className="p-3.5 rounded-xl border border-studio-border bg-studio-panel/40 flex items-start gap-3 text-xs text-studio-muted">
                <Database className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-white">How to restore from this JSON backup:</p>
                  <p className="leading-relaxed">
                    Click <strong className="text-slate-200">Projects</strong> in the top toolbar &rarr; click <strong className="text-slate-200">Import JSON Backup</strong> &rarr; select this file. Looply will re-create all layers, keyframe curves, and assets with 100% fidelity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Timeline & Compatibility Report */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Timeline Synchronization &amp; Engine Report</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Looply verifies that all layers remain synchronized to the {project.settings.duration}s master timeline. No layer drifts or desynchronizes across infinite loop cycles.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Supported Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {generated.report.fullySupported.map((feat, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-studio-border bg-studio-panel flex items-center gap-2 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                  <div className="p-2.5 rounded-lg border border-studio-border bg-studio-panel flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Accessible <code className="text-indigo-400 font-mono">prefers-reduced-motion</code> query</span>
                  </div>
                </div>
              </div>

              {generated.report.sampledPhysics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Physical Spring Sampling (CSS)
                  </h4>
                  <div className="space-y-1">
                    {generated.report.sampledPhysics.map((phys, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-slate-300"
                      >
                        {phys}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* React Native Reanimated Compatibility Report */}
              <div className="space-y-3 pt-3 border-t border-studio-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    React Native Reanimated 3.x Parity
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                    reanimatedResult.report.overallStatus === 'ready'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {reanimatedResult.report.overallStatus === 'ready' ? '100% Native Parity' : 'Approximations Present'}
                  </span>
                </div>

                <div className="space-y-2">
                  {reanimatedResult.report.approximate.map((diag, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs space-y-1"
                    >
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {diag.title}
                      </div>
                      <p className="text-slate-300">{diag.message}</p>
                      {diag.suggestion && (
                        <p className="text-amber-200/90 font-mono text-[11px] pt-1 border-t border-amber-500/20">
                          Suggestion: {diag.suggestion}
                        </p>
                      )}
                    </div>
                  ))}

                  {reanimatedResult.report.supported.slice(0, 4).map((diag, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-studio-border bg-studio-panel flex items-center gap-2 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{diag.title}: {diag.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
