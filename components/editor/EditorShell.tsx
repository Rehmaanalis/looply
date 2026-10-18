'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Toolbar from './Toolbar';
import AssetPanel from './AssetPanel';
import LayerPanel from './LayerPanel';
import CanvasWorkspace from './CanvasWorkspace';
import PropertiesPanel from './PropertiesPanel';
import Timeline from './Timeline';
import ExportModal from './ExportModal';
import PresetsModal from './PresetsModal';
import ProjectsModal from './ProjectsModal';
import SpringConfigModal from './SpringConfigModal';
import CubicBezierModal from './CubicBezierModal';
import StaggerModal from './StaggerModal';
import LeaveBackupModal from './LeaveBackupModal';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  FolderOpen,
  Layers,
  Sliders,
} from 'lucide-react';

import {
  ProjectData,
  LayerRecord,
  AssetRecord,
  KeyframeRecord,
  SpringConfig,
} from '@/types/animation';
import {
  saveProject,
  loadProject,
  listAllProjects,
  getActiveProjectId,
  setActiveProjectId,
} from '@/lib/storage/projectStore';
import { createDefaultSampleProject } from '@/lib/storage/db';

export default function EditorShell() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Playback settings
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // History stacks for Undo / Redo
  const [undoStack, setUndoStack] = useState<ProjectData[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectData[]>([]);

  const router = useRouter();

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isSpringOpen, setIsSpringOpen] = useState(false);
  const [isBezierOpen, setIsBezierOpen] = useState(false);
  const [isStaggerOpen, setIsStaggerOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Leave & Backup Handlers
  const handleLeaveApp = useCallback(() => {
    setIsLeaveModalOpen(true);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    setIsLeaveModalOpen(false);
    router.push('/');
  }, [router]);

  // Active side panel tab on mobile ('assets' | 'layers')
  const [leftTab, setLeftTab] = useState<'assets' | 'layers'>('assets');

  // Workspace side panel toggle states
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Load project on mount
  useEffect(() => {
    async function init() {
      const activeId = await getActiveProjectId();
      let loaded = await loadProject(activeId);

      // Upgrade demo sample project if it still has the old loader icon or unencoded SVGs
      if (loaded && loaded.id === 'demo-sample-project') {
        const hasOldLoader = loaded.layers.some((l) => l.id === 'layer-halo' || l.assetId === 'asset-ring');
        const hasUnencodedSvg = Object.values(loaded.assets || {}).some(
          (a) => a.dataUrl && a.dataUrl.includes(';utf8,')
        );
        if (hasOldLoader || hasUnencodedSvg) {
          loaded = createDefaultSampleProject();
          await saveProject(loaded);
        }
      }

      if (!loaded) {
        const all = await listAllProjects();
        if (all.length > 0) {
          loaded = all[0].data;
        } else {
          loaded = createDefaultSampleProject();
          await saveProject(loaded);
        }
      }
      setProject(loaded);
      if (loaded.layers.length > 0) {
        setSelectedLayerId(loaded.layers[0].id);
      }
    }
    init();
  }, []);

  // Intercept beforeunload (browser close / tab close / reload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Intercept browser back button to display the backup notification modal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.history.pushState({ looplyStudio: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState({ looplyStudio: true }, '');
      setIsLeaveModalOpen(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Animation playback loop using requestAnimationFrame with speed & reduced motion
  useEffect(() => {
    if (!isPlaying || !project || reducedMotion) return;

    let animId: number;
    let lastStamp = performance.now();
    const duration = project.settings.duration || 3.0;

    const frame = (stamp: number) => {
      const delta = ((stamp - lastStamp) / 1000) * playbackSpeed;
      lastStamp = stamp;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= duration) {
          if (project.settings.loop) {
            return next % duration;
          } else {
            setIsPlaying(false);
            return duration;
          }
        }
        return next;
      });

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, project, playbackSpeed, reducedMotion]);

  // Debounced Auto-save to IndexedDB
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const scheduleSave = useCallback((updatedProject: ProjectData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveProject(updatedProject);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('error');
      }
    }, 400);
  }, []);

  // Mutate project with history snapshot
  const updateProject = useCallback(
    (updater: (prev: ProjectData) => ProjectData, recordHistory: boolean = true) => {
      setProject((prev) => {
        if (!prev) return null;
        if (recordHistory) {
          setUndoStack((u) => [...u.slice(-20), prev]);
          setRedoStack([]);
        }
        const updated = updater(prev);
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  // Undo / Redo handlers
  const handleUndo = () => {
    if (undoStack.length === 0 || !project) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, project]);
    setProject(previous);
    scheduleSave(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !project) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, project]);
    setProject(next);
    scheduleSave(next);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId && !selectedKeyframeId) {
          e.preventDefault();
          handleDeleteLayer(selectedLayerId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Layer CRUD
  const handleAddAsset = (asset: AssetRecord) => {
    updateProject((prev) => ({
      ...prev,
      assets: { ...prev.assets, [asset.id]: asset },
    }));
  };

  const handleDeleteAsset = (assetId: string) => {
    updateProject((prev) => {
      const nextAssets = { ...prev.assets };
      delete nextAssets[assetId];
      const nextLayers = prev.layers.filter((l) => l.assetId !== assetId);
      return { ...prev, assets: nextAssets, layers: nextLayers };
    });
  };

  const handleAddAssetToStage = (asset: AssetRecord, coords?: { x: number; y: number }) => {
    if (!project) return;

    // Detect if multiple layers are using the same asset to assign unique identifiers
    const sameAssetLayers = project.layers.filter((l) => l.assetId === asset.id);
    let updatedExistingLayers = [...project.layers];
    let newLayerName = asset.name;

    if (sameAssetLayers.length === 1 && sameAssetLayers[0].name === asset.name) {
      // First layer didn't have a numbered identifier; add "1" to it now that a sibling is added
      updatedExistingLayers = updatedExistingLayers.map((l) =>
        l.id === sameAssetLayers[0].id ? { ...l, name: `${asset.name} 1` } : l
      );
      newLayerName = `${asset.name} 2`;
    } else if (sameAssetLayers.length > 0) {
      newLayerName = `${asset.name} ${sameAssetLayers.length + 1}`;
    }

    const stageW = project.settings.width;
    const stageH = project.settings.height;
    const initialW = Math.min(asset.width || 150, stageW * 0.4);
    const aspect = (asset.height || 1) / (asset.width || 1);
    const initialH = Math.round(initialW * aspect);

    const initialX =
      coords?.x !== undefined
        ? Math.max(0, Math.min(stageW - initialW, Math.round(coords.x - initialW / 2)))
        : Math.round((stageW - initialW) / 2);
    const initialY =
      coords?.y !== undefined
        ? Math.max(0, Math.min(stageH - initialH, Math.round(coords.y - initialH / 2)))
        : Math.round((stageH - initialH) / 2);

    const newLayer: LayerRecord = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newLayerName,
      assetId: asset.id,
      visible: true,
      locked: false,
      zIndex: updatedExistingLayers.length + 1,
      x: initialX,
      y: initialY,
      width: initialW,
      height: initialH,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      originX: 50,
      originY: 50,
      delay: 0,
      duration: project.settings.duration,
      easing: 'ease-in-out',
      fillMode: 'forwards',
      iterationCount: 'infinite',
      keyframes: [
        {
          id: `kf-${Date.now()}-1`,
          time: 0,
          properties: { x: initialX, y: initialY, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
        },
        {
          id: `kf-${Date.now()}-2`,
          time: project.settings.duration,
          properties: { x: initialX, y: initialY, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
        },
      ],
    };

    updateProject((prev) => ({
      ...prev,
      layers: [...updatedExistingLayers, newLayer],
    }));
    setSelectedLayerId(newLayer.id);
  };

  const handleUpdateLayer = (layerId: string, updates: Partial<LayerRecord>) => {
    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, ...updates } : l)),
    }));
  };

  const handleDeleteLayer = (layerId: string) => {
    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== layerId),
    }));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  };

  const handleDuplicateLayer = (layerId: string) => {
    const target = project?.layers.find((l) => l.id === layerId);
    if (!target || !project) return;

    const asset = project.assets[target.assetId];
    const baseName = asset?.name || target.name.replace(/\s+\d+$/, '').replace(/\s+\(Copy\)$/, '');
    const sameAssetLayers = project.layers.filter((l) => l.assetId === target.assetId);

    let updatedExistingLayers = [...project.layers];
    if (sameAssetLayers.length === 1 && sameAssetLayers[0].name === baseName) {
      updatedExistingLayers = updatedExistingLayers.map((l) =>
        l.id === sameAssetLayers[0].id ? { ...l, name: `${baseName} 1` } : l
      );
    }

    const nextNumber = sameAssetLayers.length + 1;
    const dupName = `${baseName} ${nextNumber}`;

    const dup: LayerRecord = {
      ...target,
      id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: dupName,
      zIndex: updatedExistingLayers.length + 1,
      x: target.x + 20,
      y: target.y + 20,
      keyframes: target.keyframes.map((k) => ({
        ...k,
        id: `kf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        properties: {
          ...k.properties,
          x: k.properties.x !== undefined ? k.properties.x + 20 : undefined,
          y: k.properties.y !== undefined ? k.properties.y + 20 : undefined,
        },
      })),
    };

    updateProject((prev) => ({
      ...prev,
      layers: [...updatedExistingLayers, dup],
    }));
    setSelectedLayerId(dup.id);
  };

  const handleMoveLayerUp = (layerId: string) => {
    updateProject((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === layerId);
      if (idx === -1 || idx === prev.layers.length - 1) return prev;
      const copy = [...prev.layers];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return {
        ...prev,
        layers: copy.map((l, i) => ({ ...l, zIndex: i + 1 })),
      };
    });
  };

  const handleMoveLayerDown = (layerId: string) => {
    updateProject((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === layerId);
      if (idx <= 0) return prev;
      const copy = [...prev.layers];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return {
        ...prev,
        layers: copy.map((l, i) => ({ ...l, zIndex: i + 1 })),
      };
    });
  };

  const handleReorderLayers = (fromIndex: number, toIndex: number) => {
    updateProject((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.layers.length || toIndex < 0 || toIndex >= prev.layers.length) {
        return prev;
      }
      const copy = [...prev.layers];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return {
        ...prev,
        layers: copy.map((l, i) => ({ ...l, zIndex: i + 1 })),
      };
    });
  };

  const handleUpdateLayerTiming = (layerId: string, startTime: number, endTime: number) => {
    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              startTime: Math.max(0, Math.round(startTime * 100) / 100),
              endTime: Math.min(prev.settings.duration, Math.round(endTime * 100) / 100),
            }
          : l
      ),
    }));
  };

  const handleUpdateKeyframeEasing = (layerId: string, kfId: string, easing: string) => {
    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              keyframes: l.keyframes.map((k) => (k.id === kfId ? { ...k, easing } : k)),
            }
          : l
      ),
    }));
  };

  // Keyframes
  const handleAddKeyframeAtTime = (layerId: string, time: number) => {
    const target = project?.layers.find((l) => l.id === layerId);
    if (!target) return;

    const roundedTime = Math.round(time * 100) / 100;
    const existing = target.keyframes?.find((k) => Math.abs(k.time - roundedTime) < 0.05);

    const newProps = {
      x: target.x,
      y: target.y,
      width: target.width,
      height: target.height,
      rotation: target.rotation,
      scaleX: target.scaleX,
      scaleY: target.scaleY,
      opacity: target.opacity,
    };

    if (existing) {
      updateProject((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === layerId
            ? {
                ...l,
                keyframes: l.keyframes.map((k) =>
                  k.id === existing.id ? { ...k, properties: newProps } : k
                ),
              }
            : l
        ),
      }));
      setSelectedKeyframeId(existing.id);
    } else {
      const newKf: KeyframeRecord = {
        id: `kf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        time: roundedTime,
        properties: newProps,
      };

      updateProject((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === layerId
            ? { ...l, keyframes: [...(l.keyframes || []), newKf].sort((a, b) => a.time - b.time) }
            : l
        ),
      }));
      setSelectedKeyframeId(newKf.id);
    }
  };

  const handleDeleteKeyframe = (layerId: string, kfId: string) => {
    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === layerId
          ? { ...l, keyframes: l.keyframes.filter((k) => k.id !== kfId) }
          : l
      ),
    }));
    if (selectedKeyframeId === kfId) setSelectedKeyframeId(null);
  };

  const handleDuplicateKeyframe = (layerId: string, kfId: string) => {
    const layer = project?.layers.find((l) => l.id === layerId);
    const kf = layer?.keyframes?.find((k) => k.id === kfId);
    if (!layer || !kf) return;

    const newTime = Math.min(project!.settings.duration, Math.round((kf.time + 0.3) * 100) / 100);
    const dupKf: KeyframeRecord = {
      ...kf,
      id: `kf-${Date.now()}`,
      time: newTime,
    };

    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === layerId
          ? { ...l, keyframes: [...l.keyframes, dupKf].sort((a, b) => a.time - b.time) }
          : l
      ),
    }));
    setSelectedKeyframeId(dupKf.id);
  };

  const handleApplyPreset = (keyframes: KeyframeRecord[]) => {
    if (!selectedLayerId) return;
    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === selectedLayerId ? { ...l, keyframes } : l
      ),
    }));
  };

  const handleApplySpring = (springConfig: SpringConfig) => {
    if (!selectedLayerId) return;
    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === selectedLayerId
          ? {
              ...l,
              easing: 'spring',
              springConfig,
            }
          : l
      ),
    }));
  };

  const handleApplyBezier = (easingStr: string) => {
    if (!selectedLayerId) return;
    updateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === selectedLayerId
          ? {
              ...l,
              easing: easingStr,
            }
          : l
      ),
    }));
  };

  const handleApplyStagger = (staggeredLayers: LayerRecord[]) => {
    updateProject((prev) => ({
      ...prev,
      layers: staggeredLayers,
    }));
  };

  if (!project) {
    return (
      <div className="h-screen w-screen bg-studio-bg flex items-center justify-center text-white text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing Looply Studio...</span>
        </div>
      </div>
    );
  }

  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId) || null;

  return (
    <div className="flex flex-col h-full w-full bg-studio-bg text-studio-text overflow-hidden select-none">
      {/* Top Application Toolbar */}
      <Toolbar
        project={project}
        currentTime={currentTime}
        isPlaying={isPlaying}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        playbackSpeed={playbackSpeed}
        reducedMotion={reducedMotion}
        saveStatus={saveStatus}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onRestart={() => setCurrentTime(0)}
        onToggleLoop={() =>
          updateProject((prev) => ({
            ...prev,
            settings: { ...prev.settings, loop: !prev.settings.loop },
          }))
        }
        onChangeSpeed={setPlaybackSpeed}
        onToggleReducedMotion={() => setReducedMotion((r) => !r)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenSpring={() => setIsSpringOpen(true)}
        onOpenBezier={() => setIsBezierOpen(true)}
        onOpenStagger={() => setIsStaggerOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onUpdateProjectName={(name) => updateProject((prev) => ({ ...prev, name }))}
        onUpdateStageSettings={(settings) =>
          updateProject((prev) => ({
            ...prev,
            settings: { ...prev.settings, ...settings },
          }))
        }
        isLeftPanelOpen={isLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        onToggleLeftPanel={() => setIsLeftPanelOpen((p) => !p)}
        onToggleRightPanel={() => setIsRightPanelOpen((p) => !p)}
        onLeaveApp={handleLeaveApp}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side Panel: Tabs for Assets & Layers (Toggleable) */}
        {isLeftPanelOpen ? (
          <div className="hidden md:flex flex-col shrink-0 h-full min-h-0 overflow-hidden w-64 border-r border-studio-border bg-studio-surface transition-all">
            <div className="flex border-b border-studio-border bg-studio-panel/50 shrink-0 items-center justify-between">
              <div className="flex flex-1">
                <button
                  onClick={() => setLeftTab('assets')}
                  className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
                    leftTab === 'assets'
                      ? 'border-indigo-500 text-white bg-studio-surface'
                      : 'border-transparent text-studio-muted hover:text-white'
                  }`}
                >
                  Assets ({Object.keys(project.assets).length})
                </button>
                <button
                  onClick={() => setLeftTab('layers')}
                  className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
                    leftTab === 'layers'
                      ? 'border-indigo-500 text-white bg-studio-surface'
                      : 'border-transparent text-studio-muted hover:text-white'
                  }`}
                >
                  Layers ({project.layers.length})
                </button>
              </div>

              {/* Collapse Button */}
              <button
                onClick={() => setIsLeftPanelOpen(false)}
                className="px-2 py-2 text-studio-muted hover:text-white hover:bg-studio-surface border-l border-studio-border transition-colors"
                title="Collapse Assets &amp; Layers Panel"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {leftTab === 'assets' ? (
                <AssetPanel
                  assets={project.assets}
                  onAddAsset={handleAddAsset}
                  onDeleteAsset={handleDeleteAsset}
                  onAddAssetToStage={handleAddAssetToStage}
                />
              ) : (
                <LayerPanel
                  layers={project.layers}
                  assets={project.assets}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={setSelectedLayerId}
                  onToggleVisibility={(id) => {
                    const target = project.layers.find((l) => l.id === id);
                    if (target) handleUpdateLayer(id, { visible: !target.visible });
                  }}
                  onToggleLock={(id) => {
                    const target = project.layers.find((l) => l.id === id);
                    if (target) handleUpdateLayer(id, { locked: !target.locked });
                  }}
                  onDuplicateLayer={handleDuplicateLayer}
                  onDeleteLayer={handleDeleteLayer}
                  onMoveLayerUp={handleMoveLayerUp}
                  onMoveLayerDown={handleMoveLayerDown}
                  onRenameLayer={(id, name) => handleUpdateLayer(id, { name })}
                />
              )}
            </div>
          </div>
        ) : (
          /* Collapsed Mini Rail for Left Panel */
          <div className="hidden md:flex flex-col items-center py-2.5 px-1 border-r border-studio-border bg-studio-surface shrink-0 w-11 z-10 select-none">
            <button
              onClick={() => setIsLeftPanelOpen(true)}
              className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-studio-panel transition-colors mb-2.5"
              title="Expand Assets &amp; Layers Panel"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setLeftTab('assets');
                setIsLeftPanelOpen(true);
              }}
              className="p-1.5 rounded-lg text-studio-muted hover:text-white hover:bg-studio-panel transition-colors mb-1.5"
              title="Open Assets"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setLeftTab('layers');
                setIsLeftPanelOpen(true);
              }}
              className="p-1.5 rounded-lg text-studio-muted hover:text-white hover:bg-studio-panel transition-colors"
              title="Open Layers"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Center: Stage Canvas (Expands dynamically to fill workspace) */}
        <CanvasWorkspace
          project={project}
          currentTime={currentTime}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={handleUpdateLayer}
          onAddKeyframe={(id, t) => handleAddKeyframeAtTime(id, t)}
          onAddAssetToStage={handleAddAssetToStage}
          onAddAsset={handleAddAsset}
          isLeftPanelOpen={isLeftPanelOpen}
          isRightPanelOpen={isRightPanelOpen}
          onToggleLeftPanel={() => setIsLeftPanelOpen((p) => !p)}
          onToggleRightPanel={() => setIsRightPanelOpen((p) => !p)}
        />

        {/* Right: Properties Inspector (Toggleable) */}
        {isRightPanelOpen ? (
          <div className="hidden lg:flex shrink-0 h-full min-h-0 overflow-hidden transition-all">
            <PropertiesPanel
              selectedLayer={selectedLayer}
              stageSettings={project.settings}
              currentTime={currentTime}
              selectedKeyframeId={selectedKeyframeId}
              onSelectKeyframe={setSelectedKeyframeId}
              onUpdateLayer={handleUpdateLayer}
              onUpdateStage={(updates) =>
                updateProject((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, ...updates },
                }))
              }
              onAddKeyframeAtTime={handleAddKeyframeAtTime}
              onDeleteKeyframe={handleDeleteKeyframe}
              onDuplicateKeyframe={handleDuplicateKeyframe}
              onScrubTime={(t) => setCurrentTime(t)}
              onOpenPresets={() => setIsPresetsOpen(true)}
              onOpenSpring={() => setIsSpringOpen(true)}
              onOpenBezier={() => setIsBezierOpen(true)}
              onOpenStagger={() => setIsStaggerOpen(true)}
              onToggleCollapse={() => setIsRightPanelOpen(false)}
            />
          </div>
        ) : (
          /* Collapsed Mini Rail for Right Panel */
          <div className="hidden lg:flex flex-col items-center py-2.5 px-1 border-l border-studio-border bg-studio-surface shrink-0 w-11 z-10 select-none">
            <button
              onClick={() => setIsRightPanelOpen(true)}
              className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-studio-panel transition-colors mb-2.5"
              title="Expand Properties Inspector"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRightPanelOpen(true)}
              className="p-1.5 rounded-lg text-studio-muted hover:text-white hover:bg-studio-panel transition-colors"
              title="Inspector Properties"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Timeline */}
      <Timeline
        project={project}
        currentTime={currentTime}
        selectedLayerId={selectedLayerId}
        selectedKeyframeId={selectedKeyframeId}
        onSelectLayer={setSelectedLayerId}
        onSelectKeyframe={setSelectedKeyframeId}
        onScrubTime={(t) => setCurrentTime(t)}
        onAddKeyframe={handleAddKeyframeAtTime}
        onDeleteKeyframe={handleDeleteKeyframe}
        onMoveKeyframe={(layerId, kfId, newTime) => {
          updateProject((prev) => ({
            ...prev,
            layers: prev.layers.map((l) =>
              l.id === layerId
                ? {
                    ...l,
                    keyframes: l.keyframes
                      .map((k) => (k.id === kfId ? { ...k, time: newTime } : k))
                      .sort((a, b) => a.time - b.time),
                  }
                : l
            ),
          }));
        }}
        onDuplicateKeyframe={handleDuplicateKeyframe}
        onDeleteLayer={handleDeleteLayer}
        onReorderLayers={handleReorderLayers}
        onUpdateLayerTiming={handleUpdateLayerTiming}
        onUpdateKeyframeEasing={handleUpdateKeyframeEasing}
      />

      {/* Export Modal */}
      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Presets Modal */}
      <PresetsModal
        selectedLayer={selectedLayer}
        assets={project.assets}
        duration={project.settings.duration}
        currentTime={currentTime}
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onApplyPreset={handleApplyPreset}
      />

      {/* Projects Manager Modal */}
      <ProjectsModal
        currentProjectId={project.id}
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        onSwitchProject={(p) => {
          setActiveProjectId(p.id);
          setProject(p);
          setSelectedLayerId(p.layers[0]?.id || null);
          setCurrentTime(0);
        }}
      />

      {/* Spring Config Modal */}
      <SpringConfigModal
        isOpen={isSpringOpen}
        onClose={() => setIsSpringOpen(false)}
        selectedLayer={selectedLayer}
        onApplySpring={handleApplySpring}
      />

      {/* Cubic-Bézier Modal */}
      <CubicBezierModal
        isOpen={isBezierOpen}
        onClose={() => setIsBezierOpen(false)}
        initialEasing={selectedLayer?.easing}
        onApplyEasing={handleApplyBezier}
      />

      {/* Stagger Modal */}
      <StaggerModal
        isOpen={isStaggerOpen}
        onClose={() => setIsStaggerOpen(false)}
        layers={project.layers}
        onApplyStagger={handleApplyStagger}
      />

      {/* Leave & Backup Notification Modal */}
      <LeaveBackupModal
        project={project}
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirmLeave={handleConfirmLeave}
      />
    </div>
  );
}
