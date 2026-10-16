'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Check,
  FileJson,
  AlertTriangle,
  HardDrive,
  LogOut,
  Layers,
  Clock,
  Database,
  ArrowRight,
} from 'lucide-react';
import { ProjectData } from '@/types/animation';

interface LeaveBackupModalProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
}

export default function LeaveBackupModal({
  project,
  isOpen,
  onClose,
  onConfirmLeave,
}: LeaveBackupModalProps) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen || !project) return null;

  const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = `${safeName || 'project'}_backup.json`;
  const totalLayers = project.layers?.length || 0;
  const totalKeyframes = project.layers?.reduce((acc, l) => acc + (l.keyframes?.length || 0), 0) || 0;
  const totalAssets = Object.keys(project.assets || {}).length;

  const handleDownloadJson = () => {
    try {
      const jsonStr = JSON.stringify(project, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      console.error('Failed to export JSON backup:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="bg-studio-surface border border-studio-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-studio-border flex items-center justify-between bg-studio-panel/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Before You Leave Looply</h3>
              <p className="text-xs text-studio-muted">Take a backup of your animation progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-studio-muted hover:text-white rounded-lg hover:bg-studio-panel transition-colors"
            title="Cancel and continue editing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Informational Banner */}
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-medium text-xs">
              <HardDrive className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Progress is saved in your browser</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your animations and assets are automatically saved locally in this browser (IndexedDB). However, clearing cache, private browsing, or switching devices can remove browser data.
            </p>
            <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
              We recommend downloading a JSON backup file so you never lose your work.
            </p>
          </div>

          {/* Project Summary Card */}
          <div className="bg-studio-panel/60 border border-studio-border rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate max-w-[240px]">
                {project.name}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Auto-saved
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-studio-border/60 text-center">
              <div className="p-1.5 rounded bg-studio-surface/60">
                <span className="text-[10px] text-studio-muted block">Duration</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {project.settings?.duration || 0}s
                </span>
              </div>
              <div className="p-1.5 rounded bg-studio-surface/60">
                <span className="text-[10px] text-studio-muted block">Layers</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {totalLayers} ({totalKeyframes} kf)
                </span>
              </div>
              <div className="p-1.5 rounded bg-studio-surface/60">
                <span className="text-[10px] text-studio-muted block">Assets</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {totalAssets} files
                </span>
              </div>
            </div>
          </div>

          {/* Download JSON Primary Action */}
          <div className="space-y-2">
            <button
              onClick={handleDownloadJson}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                downloaded
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30'
              }`}
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Backup Downloaded! ({filename})</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <FileJson className="w-4 h-4" />
                  <span>Download JSON Backup</span>
                </>
              )}
            </button>

            {downloaded && (
              <p className="text-[11px] text-emerald-400 text-center font-medium">
                Safe to leave anytime! You can re-import this JSON from the Projects menu.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-studio-border bg-studio-panel/40 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-studio-muted hover:text-white bg-studio-surface hover:bg-studio-panel border border-studio-border transition-colors"
          >
            Cancel (Stay in App)
          </button>

          <button
            onClick={onConfirmLeave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave App</span>
          </button>
        </div>
      </div>
    </div>
  );
}
