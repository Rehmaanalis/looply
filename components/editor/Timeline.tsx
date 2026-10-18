'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GripVertical,
  MoveHorizontal,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { LayerRecord, ProjectData, KeyframeRecord } from '@/types/animation';

interface TimelineProps {
  project: ProjectData;
  currentTime: number;
  selectedLayerId: string | null;
  selectedKeyframeId: string | null;
  onSelectLayer: (layerId: string) => void;
  onSelectKeyframe: (keyframeId: string | null) => void;
  onScrubTime: (time: number) => void;
  onAddKeyframe: (layerId: string, time: number) => void;
  onDeleteKeyframe: (layerId: string, keyframeId: string) => void;
  onMoveKeyframe: (layerId: string, keyframeId: string, newTime: number) => void;
  onDuplicateKeyframe?: (layerId: string, keyframeId: string) => void;
  onDeleteLayer?: (layerId: string) => void;
  onReorderLayers?: (fromIndex: number, toIndex: number) => void;
  onUpdateLayerTiming?: (layerId: string, startTime: number, endTime: number) => void;
  onUpdateKeyframeEasing?: (layerId: string, keyframeId: string, easing: string) => void;
}

export default function Timeline({
  project,
  currentTime,
  selectedLayerId,
  selectedKeyframeId,
  onSelectLayer,
  onSelectKeyframe,
  onScrubTime,
  onAddKeyframe,
  onDeleteKeyframe,
  onMoveKeyframe,
  onDuplicateKeyframe,
  onDeleteLayer,
  onReorderLayers,
  onUpdateLayerTiming,
  onUpdateKeyframeEasing,
}: TimelineProps) {
  const rulerTrackRef = useRef<HTMLDivElement>(null);
  const leftHeadersRef = useRef<HTMLDivElement>(null);
  const rightLanesRef = useRef<HTMLDivElement>(null);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1.0);
  const [expandedLayerIds, setExpandedLayerIds] = useState<Record<string, boolean>>({});
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Interaction dragging states for keyframes and layer timing trim
  const [activeDrag, setActiveDrag] = useState<{
    type: 'keyframe' | 'layer-start' | 'layer-end' | 'layer-span';
    layerId: string;
    keyframeId?: string;
    startX: number;
    initialKfTime?: number;
    initialStartTime?: number;
    initialEndTime?: number;
  } | null>(null);

  const duration = project.settings.duration || 3.0;
  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId) || null;
  const selectedKeyframe = selectedLayer?.keyframes?.find((k) => k.id === selectedKeyframeId) || null;

  // Toggle expanded keyframe management view for a layer track
  const toggleLayerExpanded = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLayerIds((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  // Keyboard navigation for selected keyframe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLayerId || !selectedKeyframeId) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

      const layer = project.layers.find((l) => l.id === selectedLayerId);
      const kf = layer?.keyframes?.find((k) => k.id === selectedKeyframeId);
      if (!kf) return;

      const step = e.shiftKey ? 0.2 : 0.05;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newT = Math.max(0, Math.round((kf.time - step) * 100) / 100);
        onMoveKeyframe(selectedLayerId, selectedKeyframeId, newT);
        onScrubTime(newT);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newT = Math.min(duration, Math.round((kf.time + step) * 100) / 100);
        onMoveKeyframe(selectedLayerId, selectedKeyframeId, newT);
        onScrubTime(newT);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteKeyframe(selectedLayerId, selectedKeyframeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, selectedKeyframeId, project.layers, duration, onMoveKeyframe, onScrubTime, onDeleteKeyframe]);

  // Synchronized vertical scrolling between left headers and right lanes
  const handleScrollLeft = (e: React.UIEvent<HTMLDivElement>) => {
    if (rightLanesRef.current) {
      rightLanesRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleScrollRight = (e: React.UIEvent<HTMLDivElement>) => {
    if (leftHeadersRef.current) {
      leftHeadersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Playhead scrubbing on ruler
  const handlePointerDownRuler = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    updateTimeFromPointer(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveRuler = (e: React.PointerEvent) => {
    if (isScrubbing) {
      updateTimeFromPointer(e.clientX);
    }
  };

  const handlePointerUpRuler = (e: React.PointerEvent) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  };

  const updateTimeFromPointer = (clientX: number) => {
    if (!rulerTrackRef.current) return;
    const rect = rulerTrackRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = offsetX / rect.width;
    const newTime = Math.max(0, Math.min(duration, Math.round(ratio * duration * 100) / 100));
    onScrubTime(newTime);
  };

  // Convert clientX to timeline time
  const getTimeFromClientX = useCallback(
    (clientX: number): number => {
      if (!rulerTrackRef.current) return 0;
      const rect = rulerTrackRef.current.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      return Math.max(0, Math.min(duration, (offsetX / rect.width) * duration));
    },
    [duration]
  );

  // Pointer dragging handler for keyframes and layer start/end trim handles
  useEffect(() => {
    if (!activeDrag) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!rulerTrackRef.current) return;
      const rect = rulerTrackRef.current.getBoundingClientRect();
      const currentT = getTimeFromClientX(e.clientX);

      if (activeDrag.type === 'keyframe' && activeDrag.keyframeId) {
        const roundedTime = Math.max(0, Math.min(duration, Math.round(currentT * 20) / 20));
        onMoveKeyframe(activeDrag.layerId, activeDrag.keyframeId, roundedTime);
        onScrubTime(roundedTime);
      } else if (activeDrag.type === 'layer-start' && onUpdateLayerTiming) {
        const targetLayer = project.layers.find((l) => l.id === activeDrag.layerId);
        const currentEnd = targetLayer?.endTime !== undefined ? targetLayer.endTime : duration;
        const newStart = Math.max(0, Math.min(currentEnd - 0.1, Math.round(currentT * 20) / 20));
        onUpdateLayerTiming(activeDrag.layerId, newStart, currentEnd);
      } else if (activeDrag.type === 'layer-end' && onUpdateLayerTiming) {
        const targetLayer = project.layers.find((l) => l.id === activeDrag.layerId);
        const currentStart = targetLayer?.startTime ?? 0;
        const newEnd = Math.max(currentStart + 0.1, Math.min(duration, Math.round(currentT * 20) / 20));
        onUpdateLayerTiming(activeDrag.layerId, currentStart, newEnd);
      } else if (activeDrag.type === 'layer-span' && onUpdateLayerTiming) {
        const dxSeconds = ((e.clientX - activeDrag.startX) / rect.width) * duration;
        const initStart = activeDrag.initialStartTime ?? 0;
        const initEnd = activeDrag.initialEndTime ?? duration;
        const spanLength = initEnd - initStart;

        let newStart = Math.max(0, Math.min(duration - spanLength, initStart + dxSeconds));
        newStart = Math.round(newStart * 20) / 20;
        const newEnd = Math.round((newStart + spanLength) * 20) / 20;
        onUpdateLayerTiming(activeDrag.layerId, newStart, newEnd);
      }
    };

    const handlePointerUp = () => {
      setActiveDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDrag, duration, getTimeFromClientX, onMoveKeyframe, onScrubTime, onUpdateLayerTiming, project.layers]);

  // Generate tick markers
  const step = duration > 6 ? 1.0 : duration > 3 ? 0.5 : 0.25;
  const numTicks = Math.floor(duration / step) + 1;
  const ticks = Array.from({ length: numTicks }, (_, i) => Math.round(i * step * 100) / 100);

  return (
    <div className="h-64 bg-studio-surface border-t border-studio-border flex flex-col select-none">
      {/* Timeline Header Bar */}
      <div className="h-9 border-b border-studio-border flex items-center px-4 bg-studio-panel/70 justify-between text-xs text-studio-muted shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-white">Timeline</span>
          <span className="font-mono text-[11px] text-slate-300 bg-studio-surface px-1.5 py-0.5 rounded border border-studio-border">
            {currentTime.toFixed(2)}s / {duration.toFixed(1)}s
          </span>

          {selectedLayer && (
            <span className="text-[11px] text-indigo-300 font-medium ml-1">
              Active: <strong className="text-white">{selectedLayer.name}</strong>
            </span>
          )}
        </div>

        {/* Middle: Selected Keyframe Inspector */}
        <div className="flex-1 flex justify-center items-center px-2 min-w-0">
          {selectedKeyframe && selectedLayer && (
            <div className="flex items-center gap-2 bg-studio-surface px-2.5 py-1 rounded-lg border border-indigo-500/30 text-[11px] max-w-full overflow-x-auto shadow-xs">
              <span className="text-amber-400 font-medium flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-xs rotate-45 bg-amber-400" />
                Keyframe @ {selectedKeyframe.time.toFixed(2)}s
              </span>

              {/* Time nudge buttons */}
              <div className="flex items-center gap-0.5 bg-studio-panel rounded px-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const newT = Math.max(0, Math.round((selectedKeyframe.time - 0.1) * 100) / 100);
                    onMoveKeyframe(selectedLayer.id, selectedKeyframe.id, newT);
                    onScrubTime(newT);
                  }}
                  className="px-1 text-[10px] text-slate-300 hover:text-white hover:bg-studio-surface rounded"
                  title="Shift -0.1s"
                >
                  -0.1s
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newT = Math.min(duration, Math.round((selectedKeyframe.time + 0.1) * 100) / 100);
                    onMoveKeyframe(selectedLayer.id, selectedKeyframe.id, newT);
                    onScrubTime(newT);
                  }}
                  className="px-1 text-[10px] text-slate-300 hover:text-white hover:bg-studio-surface rounded"
                  title="Shift +0.1s"
                >
                  +0.1s
                </button>
              </div>

              {/* Easing selector */}
              {onUpdateKeyframeEasing && (
                <select
                  value={selectedKeyframe.easing || selectedLayer.easing || 'ease'}
                  onChange={(e) => onUpdateKeyframeEasing(selectedLayer.id, selectedKeyframe.id, e.target.value)}
                  className="bg-studio-panel border border-studio-border rounded px-1.5 py-0.5 text-[10px] text-white shrink-0"
                >
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease-In</option>
                  <option value="ease-out">Ease-Out</option>
                  <option value="ease-in-out">Ease-In-Out</option>
                  <option value="linear">Linear</option>
                  <option value="spring">Spring</option>
                  <option value="cubic-bezier(0.16, 1, 0.3, 1)">Snappy (0.16, 1, 0.3, 1)</option>
                  <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">Overshoot (0.34, 1.56, 0.64, 1)</option>
                </select>
              )}

              {/* Duplicate button */}
              {onDuplicateKeyframe && (
                <button
                  type="button"
                  onClick={() => onDuplicateKeyframe(selectedLayer.id, selectedKeyframe.id)}
                  className="p-1 text-slate-300 hover:text-amber-300 hover:bg-studio-panel rounded shrink-0"
                  title="Duplicate Keyframe"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}

              {/* Unmissable, prominent Keyframe Delete Button */}
              <button
                type="button"
                onClick={() => onDeleteKeyframe(selectedLayer.id, selectedKeyframe.id)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors text-[10px] font-medium shrink-0"
                title="Delete selected keyframe"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Keyframe</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions and Zoom controls */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {/* Prominent "+ Add Keyframe" button */}
          {selectedLayerId && (
            <button
              onClick={() => onAddKeyframe(selectedLayerId, currentTime)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors shrink-0"
              title={`Add Keyframe at ${currentTime.toFixed(2)}s`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Keyframe @ {currentTime.toFixed(2)}s</span>
            </button>
          )}

          {/* Timeline Zoom */}
          <div className="hidden sm:flex items-center gap-1 bg-studio-panel px-1.5 py-0.5 rounded-lg border border-studio-border shrink-0">
            <button
              onClick={() => setTimelineZoom((z) => Math.max(0.75, z - 0.25))}
              className="p-1 hover:text-white rounded hover:bg-studio-surface transition-colors"
              title="Zoom out timeline"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 select-none text-slate-300 font-medium">{Math.round(timelineZoom * 100)}%</span>
            <button
              onClick={() => setTimelineZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1 hover:text-white rounded hover:bg-studio-surface transition-colors"
              title="Zoom in timeline"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Track Grid Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Layer Headers Column (Draggable to Reorder & Manage) */}
        <div
          ref={leftHeadersRef}
          onScroll={handleScrollLeft}
          className="w-64 shrink-0 border-r border-studio-border bg-studio-surface flex flex-col overflow-y-auto"
        >
          {/* Ruler Corner Header */}
          <div className="h-8 border-b border-studio-border px-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-studio-muted bg-studio-panel/40 shrink-0">
            <span>Layers ({project.layers.length})</span>
            <span className="text-[9px] text-studio-muted lowercase font-normal">drag handle to reorder</span>
          </div>

          {/* Layer Track Headers */}
          {project.layers.map((layer, index) => {
            const isSelected = selectedLayerId === layer.id;
            const isExpanded = !!expandedLayerIds[layer.id];
            const asset = project.assets[layer.assetId];
            const isDropTarget = dropTargetIndex === index;
            const kfCount = layer.keyframes?.length || 0;

            const startTime = layer.startTime ?? 0;
            const endTime = layer.endTime !== undefined ? layer.endTime : duration;

            return (
              <div key={layer.id} className="flex flex-col shrink-0">
                {/* Main Layer Row */}
                <div
                  draggable
                  onDragStart={(e) => {
                    setDraggedLayerIndex(index);
                    e.dataTransfer.setData('text/plain', String(index));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTargetIndex(index);
                  }}
                  onDragLeave={() => {
                    if (dropTargetIndex === index) setDropTargetIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedLayerIndex !== null && onReorderLayers && draggedLayerIndex !== index) {
                      onReorderLayers(draggedLayerIndex, index);
                    }
                    setDraggedLayerIndex(null);
                    setDropTargetIndex(null);
                  }}
                  onClick={() => onSelectLayer(layer.id)}
                  className={`h-11 border-b border-studio-border px-2 flex items-center justify-between cursor-pointer text-xs transition-colors relative group ${
                    isSelected ? 'bg-indigo-600/15 text-white font-medium' : 'text-slate-300 hover:bg-studio-panel'
                  } ${isDropTarget ? 'border-t-2 border-t-indigo-500 bg-indigo-500/10' : ''}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    {/* Drag Handle to reorder layer position on track */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-0.5 text-studio-muted hover:text-white rounded"
                      title="Drag to change layer track order"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-studio-muted" />
                    </div>

                    {/* Expand/Collapse Keyframe Management in Track */}
                    <button
                      type="button"
                      onClick={(e) => toggleLayerExpanded(layer.id, e)}
                      className="p-0.5 text-studio-muted hover:text-white rounded hover:bg-studio-surface"
                      title={isExpanded ? 'Collapse keyframe manager' : 'Expand keyframe manager in track'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Small image in the box */}
                    <div className="w-6 h-6 rounded bg-[#090a0f] border border-studio-border flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {asset?.dataUrl ? (
                        <img
                          src={asset.dataUrl}
                          alt={layer.name}
                          className="max-w-full max-h-full object-contain pointer-events-none select-none"
                        />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-xs bg-indigo-500" />
                      )}
                    </div>

                    {/* Layer Name & Timing Summary */}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-[11px] font-medium leading-tight">{layer.name}</span>
                      <span className="text-[9px] font-mono text-studio-muted truncate">
                        {startTime.toFixed(1)}s – {endTime.toFixed(1)}s ({kfCount} kfs)
                      </span>
                    </div>
                  </div>

                  {/* Actions: Add Keyframe & Delete Layer */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddKeyframe(layer.id, currentTime);
                      }}
                      className="p-1 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded transition-colors"
                      title={`Add Keyframe to ${layer.name} at playhead (${currentTime.toFixed(2)}s)`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {onDeleteLayer && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLayer(layer.id);
                        }}
                        className="p-1 text-studio-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                        title={`Delete layer "${layer.name}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-lane: Expanded Keyframe Track Details Header */}
                {isExpanded && (
                  <div className="h-14 border-b border-studio-border bg-studio-panel/50 px-3 py-1.5 flex flex-col justify-between text-[10px] text-studio-muted shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Keyframe Manager</span>
                      <span className="font-mono text-[9px] text-indigo-400">{kfCount} keyframes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddKeyframe(layer.id, currentTime);
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                      >
                        + Add at {currentTime.toFixed(2)}s
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Ruler + Keyframe Track Lanes */}
        <div
          ref={rightLanesRef}
          onScroll={handleScrollRight}
          className="flex-1 flex flex-col overflow-x-auto relative"
        >
          <div style={{ minWidth: `${100 * timelineZoom}%`, width: '100%' }}>
            {/* Time Ruler (Fixed Height, Not overlapping layer markers) */}
            <div
              ref={rulerTrackRef}
              onPointerDown={handlePointerDownRuler}
              onPointerMove={handlePointerMoveRuler}
              onPointerUp={handlePointerUpRuler}
              className="h-8 border-b border-studio-border relative cursor-pointer bg-studio-panel/30 hover:bg-studio-panel/60 transition-colors shrink-0"
            >
              {/* Ticks and timestamps */}
              {ticks.map((t) => {
                const leftPct = (t / duration) * 100;
                return (
                  <div
                    key={t}
                    className="absolute top-0 bottom-0 pointer-events-none flex flex-col justify-end"
                    style={{ left: `${leftPct}%` }}
                  >
                    <div className="h-2.5 w-px bg-studio-border" />
                    <span className="text-[9px] font-mono text-studio-muted -translate-x-1/2 mb-0.5 select-none">
                      {t.toFixed(1)}s
                    </span>
                  </div>
                );
              })}

              {/* Playhead marker on ruler */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none shadow"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="w-3 h-3 bg-rose-500 -translate-x-[5px] rotate-45 shadow-md" />
              </div>
            </div>

            {/* Layer Keyframe Tracks Container */}
            <div className="relative">
              {/* Playhead line down through all tracks */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-20 pointer-events-none"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />

              {/* Vertical grid lines for each tick */}
              {ticks.map((t) => (
                <div
                  key={`line-${t}`}
                  className="absolute top-0 bottom-0 w-px bg-studio-border/20 pointer-events-none"
                  style={{ left: `${(t / duration) * 100}%` }}
                />
              ))}

              {/* Tracks for each layer */}
              {project.layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const isExpanded = !!expandedLayerIds[layer.id];
                const startTime = layer.startTime ?? 0;
                const endTime = layer.endTime !== undefined ? layer.endTime : duration;

                const startPct = Math.max(0, Math.min(100, (startTime / duration) * 100));
                const endPct = Math.max(0, Math.min(100, (endTime / duration) * 100));
                const widthPct = Math.max(1, endPct - startPct);

                return (
                  <div key={layer.id} className="flex flex-col shrink-0">
                    {/* Main Track Lane */}
                    <div
                      onClick={() => onSelectLayer(layer.id)}
                      onDoubleClick={(e) => {
                        // Double-click track lane to create keyframe at clicked time!
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        const clickTime = Math.round(clickRatio * duration * 20) / 20;
                        onAddKeyframe(layer.id, clickTime);
                        onScrubTime(clickTime);
                      }}
                      className={`h-11 border-b border-studio-border/60 relative cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-600/5' : 'hover:bg-studio-panel/20'
                      }`}
                      title="Double-click anywhere to add keyframe"
                    >
                      {/* Inactive shaded areas before start and after end */}
                      {startPct > 0 && (
                        <div
                          className="absolute top-0 bottom-0 left-0 bg-black/40 border-r border-dashed border-studio-border pointer-events-none"
                          style={{ width: `${startPct}%` }}
                        />
                      )}
                      {endPct < 100 && (
                        <div
                          className="absolute top-0 bottom-0 right-0 bg-black/40 border-l border-dashed border-studio-border pointer-events-none"
                          style={{ width: `${100 - endPct}%` }}
                        />
                      )}

                      {/* Active Layer Span Bar (Draggable Start / End & Shift Body) */}
                      <div
                        className={`absolute top-1.5 bottom-1.5 rounded-md border flex items-center transition-shadow ${
                          isSelected
                            ? 'bg-indigo-600/25 border-indigo-500/70 shadow-sm'
                            : 'bg-studio-panel/60 border-studio-border hover:border-slate-500'
                        }`}
                        style={{
                          left: `${startPct}%`,
                          width: `${widthPct}%`,
                        }}
                      >
                        {/* Left Trim Handle (Start Time) */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setActiveDrag({
                              type: 'layer-start',
                              layerId: layer.id,
                              startX: e.clientX,
                              initialStartTime: startTime,
                              initialEndTime: endTime,
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize bg-indigo-500/50 hover:bg-indigo-400 rounded-l flex items-center justify-center transition-colors z-20 group/handle"
                          title={`Drag to change start time (currently ${startTime.toFixed(2)}s)`}
                        >
                          <div className="w-0.5 h-3 bg-white/70" />
                        </div>

                        {/* Middle Span Label & Move Handle */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            onSelectLayer(layer.id);
                            setActiveDrag({
                              type: 'layer-span',
                              layerId: layer.id,
                              startX: e.clientX,
                              initialStartTime: startTime,
                              initialEndTime: endTime,
                            });
                          }}
                          className="flex-1 h-full flex items-center justify-between px-3 cursor-grab active:cursor-grabbing text-[9px] font-mono text-indigo-300 overflow-hidden select-none"
                          title="Drag to shift layer start & end time along timeline"
                        >
                          <span className="truncate opacity-80">{layer.name}</span>
                          <span className="shrink-0 opacity-90 font-semibold">
                            {startTime.toFixed(1)}s – {endTime.toFixed(1)}s ({(endTime - startTime).toFixed(1)}s)
                          </span>
                        </div>

                        {/* Right Trim Handle (End Time) */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setActiveDrag({
                              type: 'layer-end',
                              layerId: layer.id,
                              startX: e.clientX,
                              initialStartTime: startTime,
                              initialEndTime: endTime,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize bg-indigo-500/50 hover:bg-indigo-400 rounded-r flex items-center justify-center transition-colors z-20 group/handle"
                          title={`Drag to change end time (currently ${endTime.toFixed(2)}s)`}
                        >
                          <div className="w-0.5 h-3 bg-white/70" />
                        </div>
                      </div>

                      {/* Keyframe Markers on Track (Tactile, draggable, unclipped!) */}
                      {layer.keyframes?.map((kf) => {
                        const leftPct = Math.max(0, Math.min(100, (kf.time / duration) * 100));
                        const isKfSelected = selectedKeyframeId === kf.id;

                        return (
                          <div
                            key={kf.id}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              onSelectLayer(layer.id);
                              onSelectKeyframe(kf.id);
                              onScrubTime(kf.time);
                              setActiveDrag({
                                type: 'keyframe',
                                layerId: layer.id,
                                keyframeId: kf.id,
                                startX: e.clientX,
                                initialKfTime: kf.time,
                              });
                            }}
                            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 cursor-ew-resize flex items-center justify-center transition-transform ${
                              isKfSelected ? 'scale-125' : 'hover:scale-110'
                            }`}
                            style={{ left: `${leftPct}%` }}
                            title={`Keyframe at ${kf.time.toFixed(2)}s (drag to move, click to manage)`}
                          >
                            {/* Keyframe Diamond */}
                            <div
                              className={`w-4 h-4 rotate-45 rounded-xs transition-colors shadow-md ${
                                isKfSelected
                                  ? 'bg-amber-400 ring-2 ring-white shadow-amber-400/50'
                                  : 'bg-indigo-400 hover:bg-white'
                              }`}
                            />

                            {/* Safe In-Bounds Delete Button - positioned below keyframe, never clipped by ruler! */}
                            {isKfSelected && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteKeyframe(layer.id, kf.id);
                                }}
                                className="absolute top-5 -left-2 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow-lg z-30 transition-transform hover:scale-110"
                                title="Delete keyframe"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Sub-lane: Detailed Keyframe Management Strip (Requirement 5) */}
                    {isExpanded && (
                      <div className="h-14 border-b border-studio-border bg-studio-panel/30 px-3 py-1.5 flex items-center gap-2 overflow-x-auto shrink-0">
                        {(!layer.keyframes || layer.keyframes.length === 0) ? (
                          <span className="text-[10px] text-studio-muted italic">
                            No keyframes on this layer yet. Click &quot;+ Keyframe&quot; to add motion.
                          </span>
                        ) : (
                          layer.keyframes
                            .slice()
                            .sort((a, b) => a.time - b.time)
                            .map((kf, kfIdx) => {
                              const isKfSelected = selectedKeyframeId === kf.id;
                              const easing = kf.easing || layer.easing || 'ease';

                              return (
                                <div
                                  key={kf.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectLayer(layer.id);
                                    onSelectKeyframe(kf.id);
                                    onScrubTime(kf.time);
                                  }}
                                  className={`px-2 py-1 rounded-lg border text-[10px] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                                    isKfSelected
                                      ? 'bg-indigo-600/30 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/50'
                                      : 'bg-studio-surface border-studio-border text-slate-300 hover:border-slate-500 hover:text-white'
                                  }`}
                                >
                                  <div className="w-2 h-2 rounded-xs rotate-45 bg-amber-400 shrink-0" />
                                  <span className="font-semibold text-white">#{kfIdx + 1}</span>
                                  <span className="font-mono text-amber-300">{kf.time.toFixed(2)}s</span>
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-studio-panel text-studio-muted border border-studio-border">
                                    {easing}
                                  </span>

                                  {/* Delete keyframe button inside card */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteKeyframe(layer.id, kf.id);
                                    }}
                                    className="p-0.5 text-studio-muted hover:text-rose-400 rounded hover:bg-rose-500/10 ml-0.5"
                                    title="Delete keyframe"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
