'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  Code2,
  Smartphone,
  FileCode,
  Layers,
} from 'lucide-react';
import {
  IconPreset,
  generatePresetCSS,
  generatePresetReanimatedV4,
  createProjectFromPreset,
} from '@/lib/presets/presetService';
import { saveProject } from '@/lib/storage/projectStore';
import PresetIcon from './PresetIcon';

interface QuickExportModalProps {
  preset: IconPreset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickExportModal({
  preset,
  isOpen,
  onClose,
}: QuickExportModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'css' | 'reanimated' | 'svg' | 'json'>('css');
  const [copied, setCopied] = useState(false);
  const [isOpeningStudio, setIsOpeningStudio] = useState(false);

  if (!isOpen || !preset) return null;

  const cssCode = generatePresetCSS(preset);
  const reanimatedCode = generatePresetReanimatedV4(preset);

  // SVG Animated Icon
  const svgCode = `<!-- Looply Studio — ${preset.name} Animated SVG -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <style>
    @keyframes anim-${preset.id} {
${preset.keyframes
  .map((k) => `      ${k.pct}% { ${k.transform ? `transform: ${k.transform};` : ''} ${k.opacity ? `opacity: ${k.opacity};` : ''} }`)
  .join('\n')}
    }
    .icon-target {
      transform-origin: center;
      animation: anim-${preset.id} ${preset.duration}s ${preset.easing} infinite;
    }
  </style>
  <g class="icon-target">
    <!-- Paste your SVG paths here -->
    <circle cx="50" cy="50" r="32" fill="#6366f1" />
    <path d="M50 30v40M30 50h40" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
  </g>
</svg>`;

  const projectData = createProjectFromPreset(preset);
  const jsonCode = JSON.stringify(projectData, null, 2);

  const getCodeContent = () => {
    switch (activeTab) {
      case 'css':
        return cssCode;
      case 'reanimated':
        return reanimatedCode;
      case 'svg':
        return svgCode;
      case 'json':
        return jsonCode;
    }
  };

  const getFilename = () => {
    switch (activeTab) {
      case 'css':
        return `${preset.id}.animation.css`;
      case 'reanimated':
        return `${preset.name.replace(/\s+/g, '')}Icon.tsx`;
      case 'svg':
        return `${preset.id}.animated.svg`;
      case 'json':
        return `${preset.id}.looply.json`;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCodeContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  const handleDownload = () => {
    const content = getCodeContent();
    const filename = getFilename();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenStudio = async () => {
    try {
      setIsOpeningStudio(true);
      await saveProject(projectData);
      router.push('/app');
    } catch (err) {
      console.error('Error opening project in Studio:', err);
      setIsOpeningStudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-studio-surface border border-studio-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border bg-studio-panel/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PresetIcon name={preset.icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-headline" className="text-base font-semibold text-white">
                {preset.name} — Animation Export
              </h3>
              <p className="text-xs text-studio-muted">
                {preset.duration}s duration · {preset.easing} · Ready for production
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-studio-muted hover:text-white hover:bg-studio-border transition-colors"
            aria-label="Close Export Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-studio-border bg-studio-surface">
          <button
            onClick={() => setActiveTab('css')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'css'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>CSS @keyframes</span>
          </button>

          <button
            onClick={() => setActiveTab('reanimated')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'reanimated'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>React Native (v4)</span>
          </button>

          <button
            onClick={() => setActiveTab('svg')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'svg'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Animated SVG</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-studio-muted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Looply JSON</span>
          </button>
        </div>

        {/* Code Content View */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="relative rounded-lg bg-[#0d0f17] border border-studio-border p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
            <pre>{getCodeContent()}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-studio-border bg-studio-panel/50">
          <button
            onClick={handleOpenStudio}
            disabled={isOpeningStudio}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
          >
            {isOpeningStudio ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Opening Studio...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in App Studio</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-studio-surface hover:bg-studio-border text-white text-xs font-medium border border-studio-border transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-studio-muted" />
              <span>Download</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
