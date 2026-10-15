'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Archive,
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
} from 'lucide-react';
import { ProjectData } from '@/types/animation';
import { generateAnimationCSS } from '@/lib/export/cssGenerator';
import { createProjectZip, triggerDownload } from '@/lib/export/zipExporter';

interface ExportModalProps {
  project: ProjectData;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ project, isOpen, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'zip' | 'code' | 'json' | 'report'>('code');
  const [codeSubView, setCodeSubView] = useState<'both' | 'css' | 'html'>('both');
  const [assetMode, setAssetMode] = useState<'inline' | 'zip'>('inline');
  const [jsonFormat, setJsonFormat] = useState<'formatted' | 'minified'>('formatted');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Accessibility options
  const [includeReducedMotion, setIncludeReducedMotion] = useState(true);
  const [includeAriaLabels, setIncludeAriaLabels] = useState(true);

  // Generate code dynamically based on current project & asset mode
  const generated = useMemo(() => {
    return generateAnimationCSS(project, {
      mode: assetMode,
    });
  }, [project, assetMode]);

  // Extract clean embed HTML containing all layers and images
  const extractStageHTML = () => {
    let stageHtml = generated.stageHtml;

    if (includeAriaLabels) {
      stageHtml = stageHtml.replace(
        '<div class="looply-stage">',
        `<div class="looply-stage" role="img" aria-label="Animated visual: ${project.name}">`
      );
    }
    return stageHtml;
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

  if (!isOpen) return null;

  const stageHTML = extractStageHTML();
  const effectiveCSS = getEffectiveCSS();

  // Combined self-contained embed HTML + CSS
  const combinedCode = `<!-- HTML Markup -->\n${stageHTML}\n\n<!-- CSS Stylesheet -->\n<style>\n${effectiveCSS}</style>`;

  // Live preview full document string for iframe srcDoc
  const previewDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 24px; background: #0b0d14; display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: auto; }
    ${effectiveCSS}
  </style>
</head>
<body>
  ${stageHTML}
</body>
</html>`;

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      const blob = await createProjectZip(project);
      const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      triggerDownload(blob, `${safeName}_looply_animation.zip`);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

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
            onClick={() => setActiveTab('zip')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'zip'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4 text-emerald-400" />
            ZIP Package
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
                      title="Reference local assets/ folder (ideal for ZIP or production websites)"
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
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px]" title="Add role='img' and aria-label attributes">
                    <input
                      type="checkbox"
                      checked={includeAriaLabels}
                      onChange={(e) => setIncludeAriaLabels(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>ARIA</span>
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

          {/* TAB 2: ZIP Package */}
          {activeTab === 'zip' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                    Primary Deliverables (HTML &amp; CSS)
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-medium">Ready to deploy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CSS File Card */}
                  <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-mono font-semibold text-white">animation.css</span>
                      </div>
                      <span className="text-[10px] text-studio-muted font-mono">
                        {(new Blob([effectiveCSS]).size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      GPU-accelerated <code className="text-indigo-300">@keyframes</code>, synchronized timeline, and layer transforms.
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-indigo-500/20 text-[11px]">
                      <span className="text-studio-muted">{project.layers.length} layers in sync</span>
                      <button
                        onClick={() => handleCopy(effectiveCSS, 'zip-css')}
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        {copiedType === 'zip-css' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedType === 'zip-css' ? 'Copied' : 'Copy CSS'}
                      </button>
                    </div>
                  </div>

                  {/* HTML File Card */}
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-mono font-semibold text-white">index.html</span>
                      </div>
                      <span className="text-[10px] text-studio-muted font-mono">
                        {(new Blob([generated.html]).size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Semantic stage markup linking to <code className="text-amber-300">animation.css</code> and bundled graphic assets.
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[11px]">
                      <span className="text-studio-muted">Accessible &amp; responsive</span>
                      <button
                        onClick={() => handleCopy(stageHTML, 'zip-html')}
                        className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                      >
                        {copiedType === 'zip-html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedType === 'zip-html' ? 'Copied' : 'Copy HTML'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete ZIP Bundle Card */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
                <Archive className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Complete Standalone Package</p>
                  <p className="text-studio-muted leading-relaxed">
                    Bundles <code className="text-emerald-400">animation.css</code>, <code className="text-emerald-400">index.html</code>, all {Object.keys(project.assets).length} graphic assets inside <code className="text-emerald-400">assets/</code>, and portable backup JSON.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-studio-muted">
                  Project: <span className="text-white font-medium">{project.name}</span> ({project.settings.duration}s duration, {project.layers.length} layers)
                </div>

                <button
                  onClick={handleDownloadZip}
                  disabled={isExportingZip}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:shadow-emerald-600/40 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExportingZip ? 'Packaging ZIP...' : 'Download Complete ZIP Package'}
                </button>
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
                    Physical Spring Sampling
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
