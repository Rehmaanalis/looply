'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  Upload,
  Download,
  Database,
  AlertTriangle,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { ProjectData } from '@/types/animation';
import {
  listAllProjects,
  saveProject,
  deleteProject,
  duplicateProject,
  exportProjectJson,
  exportAllProjectsBundle,
  importProjectsBundle,
  setActiveProjectId,
  getStorageDiagnostics,
  requestPersistentStorage,
  formatBytes,
  StorageDiagnostics,
} from '@/lib/storage/projectStore';
import { StoredProject } from '@/lib/storage/db';

interface ProjectsModalProps {
  currentProjectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSwitchProject: (project: ProjectData) => void;
}

export default function ProjectsModal({
  currentProjectId,
  isOpen,
  onClose,
  onSwitchProject,
}: ProjectsModalProps) {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageDiagnostics | null>(null);
  const [persisting, setPersisting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bundleExporting, setBundleExporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const [list, diag] = await Promise.all([listAllProjects(), getStorageDiagnostics()]);
      setProjects(list);
      setStorageInfo(diag);
    } catch (err) {
      console.error('Failed to load projects or storage info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setDeleteConfirmId(null);
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCreateNew = async () => {
    const now = new Date().toISOString();
    const newProj: ProjectData = {
      schemaVersion: 1,
      id: `project-${Date.now()}`,
      name: `Untitled Project ${projects.length + 1}`,
      settings: {
        width: 640,
        height: 400,
        background: '#0f1117',
        duration: 3.0,
        fps: 60,
        loop: true,
        direction: 'normal',
      },
      assets: {},
      layers: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveProject(newProj);
      setActiveProjectId(newProj.id);
      onSwitchProject(newProj);
      onClose();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to create new project.', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const dup = await duplicateProject(id);
      if (dup) {
        showNotification(`Duplicated as "${dup.name}"`);
        refreshList();
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to duplicate project.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (projects.length <= 1) {
      showNotification('Cannot delete the only remaining project.', 'error');
      setDeleteConfirmId(null);
      return;
    }
    try {
      await deleteProject(id);
      setDeleteConfirmId(null);
      showNotification('Project deleted.');
      await refreshList();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to delete project.', 'error');
    }
  };

  const handleExportBackup = (proj: ProjectData) => {
    const jsonStr = exportProjectJson(proj);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = proj.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `${safeName}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(`Backup downloaded: ${proj.name}`);
  };

  const handleExportAllBundle = async () => {
    setBundleExporting(true);
    try {
      const bundleJson = await exportAllProjectsBundle();
      const blob = new Blob([bundleJson], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `looply_all_projects_backup_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(`All ${projects.length} projects backed up successfully!`);
    } catch {
      showNotification('Failed to generate full bundle backup.', 'error');
    } finally {
      setBundleExporting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const content = ev.target?.result as string;
          const result = await importProjectsBundle(content);
          if (result.importedCount > 0) {
            showNotification(`Imported ${result.importedCount} project(s) successfully!`);
            await refreshList();
            // Switch to latest project
            const updatedList = await listAllProjects();
            if (updatedList.length > 0) {
              onSwitchProject(updatedList[0].data);
            }
          } else {
            showNotification(result.errors[0] || 'Invalid Looply backup file.', 'error');
          }
        } catch (err) {
          showNotification(err instanceof Error ? err.message : 'Failed to read backup file.', 'error');
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRequestPersistent = async () => {
    setPersisting(true);
    const granted = await requestPersistentStorage();
    if (granted) {
      showNotification('Persistent browser storage granted! Browser will not clear Looply data.');
    } else {
      showNotification('Persistent storage not granted or not supported by browser.');
    }
    const diag = await getStorageDiagnostics();
    setStorageInfo(diag);
    setPersisting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-studio-surface border border-studio-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-studio-border flex items-center justify-between bg-studio-panel/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Project Manager &amp; Storage</h3>
              <p className="text-xs text-studio-muted">
                {projects.length} saved project{projects.length !== 1 ? 's' : ''} in IndexedDB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-studio-muted hover:text-white rounded-lg hover:bg-studio-panel transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 border-b transition-all ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Storage Quota Health Meter */}
        {storageInfo && (
          <div className="px-6 py-3 bg-studio-panel/60 border-b border-studio-border text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Storage: <strong className="text-white font-mono">{storageInfo.formattedUsed}</strong>
                  {storageInfo.quotaBytes > 0 ? ` of ${storageInfo.formattedQuota}` : ''}
                </span>
                <span className="text-studio-muted">({storageInfo.assetCount} assets across {storageInfo.projectCount} projects)</span>
              </div>

              <div className="flex items-center gap-2">
                {storageInfo.persisted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Storage Protected
                  </span>
                ) : (
                  <button
                    onClick={handleRequestPersistent}
                    disabled={persisting}
                    className="text-[10px] text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium transition-colors"
                    title="Ask browser to protect storage against automatic eviction under disk pressure"
                  >
                    {persisting ? 'Protecting...' : 'Protect Storage'}
                  </button>
                )}
              </div>
            </div>

            {/* Storage bar */}
            {storageInfo.quotaBytes > 0 && (
              <div className="w-full h-1.5 rounded-full bg-studio-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    storageInfo.percentUsed > 80 ? 'bg-rose-500' : storageInfo.percentUsed > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.max(storageInfo.percentUsed, 1)}%` }}
                />
              </div>
            )}

            {storageInfo.warning && (
              <div className="flex items-center gap-1.5 text-amber-300 text-[11px] bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{storageInfo.warning}</span>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Input for Single or Multi-Project Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="p-12 text-center text-xs text-studio-muted flex flex-col items-center justify-center gap-2">
              <Database className="w-6 h-6 text-indigo-400/40 animate-pulse" />
              <span>Accessing local storage...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-xs text-studio-muted">No projects found. Create a new one to begin!</div>
          ) : (
            projects.map((proj) => {
              const isCurrent = proj.id === currentProjectId;
              const isConfirmingDelete = deleteConfirmId === proj.id;
              const formattedSize = proj.sizeBytes ? formatBytes(proj.sizeBytes) : '—';
              const assetCount = Object.keys(proj.data?.assets || {}).length;

              return (
                <div
                  key={proj.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-sm'
                      : 'bg-studio-panel border-studio-border hover:border-studio-borderHover'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">{proj.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-studio-muted mt-1 font-mono">
                      <span>{proj.data?.layers?.length || 0} layers</span>
                      <span>•</span>
                      <span>{assetCount} assets</span>
                      <span>•</span>
                      <span>{proj.data?.settings?.duration || 3}s</span>
                      <span>•</span>
                      <span className="text-indigo-300/80">{formattedSize}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">Saved {new Date(proj.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onSwitchProject(proj.data);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                      >
                        Open
                      </button>
                    )}

                    <button
                      onClick={() => handleExportBackup(proj.data)}
                      className="p-1.5 text-studio-muted hover:text-violet-300 rounded-lg hover:bg-studio-surface transition-colors"
                      title="Download JSON backup"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(proj.id)}
                      className="p-1.5 text-studio-muted hover:text-white rounded-lg hover:bg-studio-surface transition-colors"
                      title="Duplicate project"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 rounded-lg p-1">
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium"
                          title="Confirm permanent deletion"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-slate-300 hover:text-white text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(proj.id)}
                        className="p-1.5 text-studio-muted hover:text-rose-400 rounded-lg hover:bg-studio-surface transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Backup Options */}
        <div className="p-4 border-t border-studio-border bg-studio-panel/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-studio-muted">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>High-capacity IndexedDB active.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAllBundle}
              disabled={bundleExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-surface hover:bg-studio-border border border-studio-border text-slate-200 font-medium text-xs transition-colors"
              title="Download all projects in a single JSON archive"
            >
              <Download className="w-3.5 h-3.5 text-violet-400" />
              <span>{bundleExporting ? 'Packaging...' : 'Backup All Projects'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm"
              title="Import a single project JSON or master bundle backup"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
