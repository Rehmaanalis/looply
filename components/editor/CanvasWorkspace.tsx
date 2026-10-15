'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { ProjectData, LayerRecord, AssetRecord, KeyframeRecord } from '@/types/animation';
import { interpolateLayer } from '@/lib/animation/interpolator';

interface CanvasWorkspaceProps {
  project: ProjectData;
  currentTime: number;
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onUpdateLayer: (layerId: string, updates: Partial<LayerRecord>) => void;
  onAddKeyframe: (layerId: string, time: number) => void;
  onAddAssetToStage?: (asset: AssetRecord, coords?: { x: number; y: number }) => void;
  onAddAsset?: (asset: AssetRecord) => void;
  isLeftPanelOpen?: boolean;
  isRightPanelOpen?: boolean;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

export default function CanvasWorkspace({
  project,
  currentTime,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onAddAssetToStage,
  onAddAsset,
  isLeftPanelOpen = true,
  isRightPanelOpen = true,
  onToggleLeftPanel,
  onToggleRightPanel,
}: CanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showCenterGuideX, setShowCenterGuideX] = useState(false);
  const [showCenterGuideY, setShowCenterGuideY] = useState(false);
  const [isStageDragOver, setIsStageDragOver] = useState(false);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialBaseX: number;
    initialBaseY: number;
    initialWidth: number;
    initialHeight: number;
    initialKfs: KeyframeRecord[];
    handle?: string;
  } | null>(null);

  const { width: stageWidth, height: stageHeight, background } = project.settings;

  // Auto-fit on initial mount
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const margin = 80;
      const availableW = clientWidth - margin;
      const availableH = clientHeight - margin;
      const scaleW = availableW / stageWidth;
      const scaleH = availableH / stageHeight;
      const fitScale = Math.min(1.0, Math.min(scaleW, scaleH));
      setZoom(Math.max(0.3, Math.round(fitScale * 100) / 100));
    }
  }, [stageWidth, stageHeight]);

  // Keyboard nudging for selected layer (updates base pos and translates keyframes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLayerId) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

      const layer = project.layers.find((l) => l.id === selectedLayerId);
      if (!layer || layer.locked) return;

      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        dx = -step;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        dx = step;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        dy = -step;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        dy = step;
      } else {
        return;
      }

      const updatedKeyframes = layer.keyframes?.map((k) => ({
        ...k,
        properties: {
          ...k.properties,
          x: k.properties.x !== undefined ? Math.round(k.properties.x + dx) : undefined,
          y: k.properties.y !== undefined ? Math.round(k.properties.y + dy) : undefined,
        },
      }));

      onUpdateLayer(selectedLayerId, {
        x: layer.x + dx,
        y: layer.y + dy,
        keyframes: updatedKeyframes && updatedKeyframes.length > 0 ? updatedKeyframes : undefined,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, project.layers, onUpdateLayer]);

  // Pointer down to move layer
  const handlePointerDownLayer = (e: React.PointerEvent, layer: LayerRecord) => {
    if (layer.locked) return;
    e.stopPropagation();
    onSelectLayer(layer.id);

    const targetLayer = project.layers.find((l) => l.id === layer.id) || layer;
    const initialKfs = targetLayer.keyframes ? JSON.parse(JSON.stringify(targetLayer.keyframes)) : [];

    setIsDraggingLayer(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialBaseX: targetLayer.x,
      initialBaseY: targetLayer.y,
      initialWidth: targetLayer.width,
      initialHeight: targetLayer.height,
      initialKfs,
    };

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  // Pointer down on corner resize handle
  const handlePointerDownResize = (e: React.PointerEvent, handle: string, layer: LayerRecord) => {
    e.stopPropagation();
    if (layer.locked) return;

    setIsResizing(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialBaseX: layer.x,
      initialBaseY: layer.y,
      initialWidth: layer.width,
      initialHeight: layer.height,
      initialKfs: layer.keyframes ? JSON.parse(JSON.stringify(layer.keyframes)) : [],
      handle,
    };

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !selectedLayerId) return;

    const dx = (e.clientX - dragStartRef.current.startX) / zoom;
    const dy = (e.clientY - dragStartRef.current.startY) / zoom;

    if (isResizing && dragStartRef.current.handle) {
      const h = dragStartRef.current.handle;
      let newW = dragStartRef.current.initialWidth;
      let newH = dragStartRef.current.initialHeight;

      if (h.includes('r')) newW = Math.max(20, Math.round(dragStartRef.current.initialWidth + dx));
      if (h.includes('b')) newH = Math.max(20, Math.round(dragStartRef.current.initialHeight + dy));
      if (h.includes('l')) newW = Math.max(20, Math.round(dragStartRef.current.initialWidth - dx));
      if (h.includes('t')) newH = Math.max(20, Math.round(dragStartRef.current.initialHeight - dy));

      onUpdateLayer(selectedLayerId, { width: newW, height: newH });
    } else if (isDraggingLayer) {
      let newX = Math.round(dragStartRef.current.initialBaseX + dx);
      let newY = Math.round(dragStartRef.current.initialBaseY + dy);

      // Snap to center
      const currentLayer = project.layers.find((l) => l.id === selectedLayerId);
      const layerW = currentLayer?.width || 100;
      const layerH = currentLayer?.height || 100;
      const centerX = (stageWidth - layerW) / 2;
      const centerY = (stageHeight - layerH) / 2;

      let effectiveDx = dx;
      let effectiveDy = dy;

      if (Math.abs(newX - centerX) < 8) {
        newX = Math.round(centerX);
        effectiveDx = newX - dragStartRef.current.initialBaseX;
        setShowCenterGuideX(true);
      } else {
        setShowCenterGuideX(false);
      }

      if (Math.abs(newY - centerY) < 8) {
        newY = Math.round(centerY);
        effectiveDy = newY - dragStartRef.current.initialBaseY;
        setShowCenterGuideY(true);
      } else {
        setShowCenterGuideY(false);
      }

      // Translate all keyframes proportionally so the animation path moves with the layer cleanly
      const updatedKeyframes = dragStartRef.current.initialKfs.map((k) => ({
        ...k,
        properties: {
          ...k.properties,
          x: k.properties.x !== undefined ? Math.round(k.properties.x + effectiveDx) : undefined,
          y: k.properties.y !== undefined ? Math.round(k.properties.y + effectiveDy) : undefined,
        },
      }));

      onUpdateLayer(selectedLayerId, {
        x: newX,
        y: newY,
        keyframes: updatedKeyframes.length > 0 ? updatedKeyframes : undefined,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingLayer(false);
    setIsResizing(false);
    setShowCenterGuideX(false);
    setShowCenterGuideY(false);
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  // Stage drag-and-drop handling
  const handleStageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsStageDragOver(true);
  };

  const handleStageDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsStageDragOver(false);
  };

  const handleStageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsStageDragOver(false);

    const stageEl = document.getElementById('looply-stage-canvas');
    if (!stageEl) return;
    const stageRect = stageEl.getBoundingClientRect();

    // Calculate drop coordinates relative to the stage
    const dropStageX = Math.round((e.clientX - stageRect.left) / zoom);
    const dropStageY = Math.round((e.clientY - stageRect.top) / zoom);

    // 1. Asset payload from AssetPanel
    const json = e.dataTransfer.getData('application/json');
    if (json) {
      try {
        const asset = JSON.parse(json) as AssetRecord;
        if (asset && onAddAssetToStage) {
          onAddAssetToStage(asset, { x: dropStageX, y: dropStageY });
          return;
        }
      } catch (err) {
        // ignore
      }
    }

    // 2. Asset ID fallback
    const assetId = e.dataTransfer.getData('text/plain');
    if (assetId && project.assets[assetId] && onAddAssetToStage) {
      onAddAssetToStage(project.assets[assetId], { x: dropStageX, y: dropStageY });
      return;
    }

    // 3. Desktop Image Files dropped directly onto stage
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const newAsset: AssetRecord = {
              id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              type: file.type,
              width: img.naturalWidth || 200,
              height: img.naturalHeight || 200,
              dataUrl,
              size: file.size,
            };
            if (onAddAsset) onAddAsset(newAsset);
            if (onAddAssetToStage) onAddAssetToStage(newAsset, { x: dropStageX, y: dropStageY });
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectLayer('')}
      onDragOver={handleStageDragOver}
      onDragLeave={handleStageDragLeave}
      onDrop={handleStageDrop}
      className="flex-1 h-full bg-[#090b10] relative overflow-hidden flex flex-col items-center justify-center select-none"
    >
      {/* Background canvas subtle dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #3b425c 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Floating Canvas Top Left Controls (Left Panel Toggle) */}
      {onToggleLeftPanel && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLeftPanel();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-studio-panel/90 backdrop-blur border rounded-lg text-xs font-medium shadow-lg transition-colors ${
              isLeftPanelOpen
                ? 'border-studio-border text-studio-muted hover:text-white hover:bg-studio-surface'
                : 'border-indigo-500/50 text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25'
            }`}
            title={isLeftPanelOpen ? 'Collapse Left Panel (Assets & Layers)' : 'Show Left Panel (Assets & Layers)'}
          >
            {isLeftPanelOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{isLeftPanelOpen ? 'Assets & Layers' : 'Show Panels'}</span>
          </button>
        </div>
      )}

      {/* Floating Canvas Zoom & Inspector Controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-studio-panel/90 backdrop-blur border border-studio-border rounded-lg p-1 text-xs text-studio-muted shadow-lg">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.max(0.25, Math.round((z - 0.1) * 10) / 10));
          }}
          className="p-1 rounded hover:bg-studio-surface hover:text-white"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono text-[11px] px-1 text-white min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(2.5, Math.round((z + 0.1) * 10) / 10));
          }}
          className="p-1 rounded hover:bg-studio-surface hover:text-white"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3 bg-studio-border" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom(1.0);
          }}
          className="p-1 rounded hover:bg-studio-surface hover:text-white"
          title="Reset Zoom to 100%"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {onToggleRightPanel && (
          <>
            <div className="w-px h-3 bg-studio-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleRightPanel();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isRightPanelOpen
                  ? 'hover:bg-studio-surface hover:text-white text-studio-muted'
                  : 'text-indigo-300 bg-indigo-500/20 font-medium'
              }`}
              title={isRightPanelOpen ? 'Collapse Inspector (Right Panel)' : 'Show Inspector (Right Panel)'}
            >
              {isRightPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-mono hidden sm:inline">Inspector</span>
            </button>
          </>
        )}
      </div>

      {/* Stage Wrapper */}
      <div
        className="relative shadow-2xl transition-transform"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {/* The Animated Stage */}
        <div
          id="looply-stage-canvas"
          className={`relative overflow-hidden rounded-md border shadow-2xl transition-colors ${
            isStageDragOver
              ? 'border-indigo-400 ring-4 ring-indigo-500/20 shadow-indigo-500/30'
              : 'border-studio-border'
          }`}
          style={{
            width: `${stageWidth}px`,
            height: `${stageHeight}px`,
            backgroundColor: background || '#0f1117',
          }}
        >
          {/* Center alignment guides */}
          {showCenterGuideX && (
            <div
              className="absolute top-0 bottom-0 w-px bg-indigo-500 z-40 pointer-events-none"
              style={{ left: `${stageWidth / 2}px` }}
            />
          )}
          {showCenterGuideY && (
            <div
              className="absolute left-0 right-0 h-px bg-indigo-500 z-40 pointer-events-none"
              style={{ top: `${stageHeight / 2}px` }}
            />
          )}

          {/* Visual Drop Overlay */}
          {isStageDragOver && (
            <div className="absolute inset-0 bg-indigo-600/15 border-2 border-dashed border-indigo-400 z-50 flex items-center justify-center text-white font-medium text-xs pointer-events-none backdrop-blur-[1px]">
              <div className="flex items-center gap-2 bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg">
                <Upload className="w-4 h-4 animate-bounce" />
                <span>Drop image onto stage</span>
              </div>
            </div>
          )}

          {/* Render Layers */}
          {project.layers
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((layer) => {
              if (!layer.visible) return null;

              const isSelected = selectedLayerId === layer.id;
              const asset = project.assets[layer.assetId];
              const state = interpolateLayer(layer, currentTime);

              return (
                <div
                  key={layer.id}
                  onPointerDown={(e) => handlePointerDownLayer(e, layer)}
                  className={`absolute transition-shadow ${
                    layer.locked ? 'cursor-not-allowed' : 'cursor-move'
                  }`}
                  style={{
                    left: 0,
                    top: 0,
                    width: `${state.width}px`,
                    height: `${state.height}px`,
                    transform: `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.rotation}deg) scale(${state.scaleX}, ${state.scaleY})`,
                    transformOrigin: `${state.originX}% ${state.originY}%`,
                    opacity: state.opacity,
                    zIndex: layer.zIndex,
                  }}
                >
                  {/* Layer Image Asset */}
                  {asset ? (
                    <img
                      src={asset.dataUrl}
                      alt={layer.name}
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-500/50 flex items-center justify-center text-xs text-white">
                      {layer.name}
                    </div>
                  )}

                  {/* Active Selection Outline & Interactive Drag Handles */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-indigo-400 rounded-[2px] shadow-sm pointer-events-none">
                      {/* Explicit Drag Option Handle to manage stage position */}
                      <div
                        onPointerDown={(e) => handlePointerDownLayer(e, layer)}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold shadow-md cursor-move pointer-events-auto select-none border border-indigo-300/40 whitespace-nowrap z-50 transition-transform active:scale-95"
                        title="Drag to manage stage position"
                      >
                        <Move className="w-3 h-3 shrink-0" />
                        <span>Drag Stage Position</span>
                      </div>

                      {/* Interactive Corner Resize Handles */}
                      <div
                        onPointerDown={(e) => handlePointerDownResize(e, 'tl', layer)}
                        className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize pointer-events-auto shadow-md"
                        title="Resize Top-Left"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDownResize(e, 'tr', layer)}
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize pointer-events-auto shadow-md"
                        title="Resize Top-Right"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDownResize(e, 'bl', layer)}
                        className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize pointer-events-auto shadow-md"
                        title="Resize Bottom-Left"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDownResize(e, 'br', layer)}
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize pointer-events-auto shadow-md"
                        title="Resize Bottom-Right"
                      />

                      {/* Origin center point */}
                      <div
                        className="absolute w-2 h-2 rounded-full bg-amber-400 ring-2 ring-black"
                        style={{
                          left: `${state.originX}%`,
                          top: `${state.originY}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />

                      {/* Floating Badge with coordinates */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur text-white text-[9px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap border border-white/10 pointer-events-none">
                        X:{Math.round(state.x)} Y:{Math.round(state.y)} • {Math.round(state.width)}×{Math.round(state.height)}px
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Stage Dimensions Label */}
        <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-mono text-studio-muted">
          Stage: {stageWidth} × {stageHeight}px • Drag layer or handle to position • Arrow keys to nudge (Shift: 10px)
        </div>
      </div>
    </div>
  );
}
