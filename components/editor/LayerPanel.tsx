'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { LayerRecord, AssetRecord } from '@/types/animation';

interface LayerPanelProps {
  layers: LayerRecord[];
  assets: Record<string, AssetRecord>;
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onMoveLayerUp: (layerId: string) => void;
  onMoveLayerDown: (layerId: string) => void;
  onRenameLayer: (layerId: string, newName: string) => void;
}

export default function LayerPanel({
  layers,
  assets,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onRenameLayer,
}: LayerPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort layers by z-index descending (top layer first in list)
  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => b.zIndex - a.zIndex);
  }, [layers]);

  const filteredLayers = useMemo(() => {
    if (!searchQuery.trim()) return sortedLayers;
    const q = searchQuery.toLowerCase().trim();
    return sortedLayers.filter((l) => l.name.toLowerCase().includes(q));
  }, [sortedLayers, searchQuery]);

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-studio-surface border-r border-studio-border select-none overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-studio-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white">Layers</span>
        </div>
        <span className="text-[11px] font-mono text-studio-muted">
          {layers.length} {layers.length === 1 ? 'layer' : 'layers'}
        </span>
      </div>

      {/* Search filter when multiple layers exist */}
      {layers.length > 4 && (
        <div className="px-3 pt-2.5 pb-1 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-studio-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search layers..."
              className="w-full pl-8 pr-7 py-1 text-xs bg-studio-panel border border-studio-border rounded-lg text-white placeholder-studio-muted focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-studio-muted hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Layers list — Fully scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5 overscroll-contain">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-xs text-studio-muted">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No layers yet. Click &quot;Add to Stage&quot; from the Assets panel.
          </div>
        ) : filteredLayers.length === 0 ? (
          <div className="text-center py-6 text-xs text-studio-muted">
            No layers match &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredLayers.map((layer) => {
            const isSelected = selectedLayerId === layer.id;
            const asset = assets[layer.assetId];

            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`group rounded-lg border p-2 flex items-center gap-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-sm'
                    : 'bg-studio-panel border-studio-border hover:border-studio-borderHover'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-8 h-8 rounded bg-[#090a0f] border border-studio-border flex items-center justify-center shrink-0 overflow-hidden">
                  {asset ? (
                    <Image src={asset.dataUrl} alt={layer.name} width={32} height={32} className="max-w-full max-h-full object-contain pointer-events-none select-none" unoptimized />
                  ) : (
                    <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
                  )}
                </div>

                {/* Name & Details */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => onRenameLayer(layer.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent text-xs font-medium text-white focus:outline-none focus:bg-studio-surface px-1 py-0.5 rounded truncate"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-studio-muted px-1">
                    <span>z: {layer.zIndex}</span>
                    <span>•</span>
                    <span>{layer.keyframes?.length || 0} keyframes</span>
                  </div>
                </div>

                {/* Layer Quick Actions */}
                <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Visibility toggle */}
                  <button
                    onClick={() => onToggleVisibility(layer.id)}
                    className={`p-1 rounded hover:bg-studio-surface ${
                      layer.visible ? 'text-studio-muted hover:text-white' : 'text-slate-600'
                    }`}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Lock toggle */}
                  <button
                    onClick={() => onToggleLock(layer.id)}
                    className={`p-1 rounded hover:bg-studio-surface ${
                      layer.locked ? 'text-amber-400' : 'text-studio-muted hover:text-white'
                    }`}
                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Move up / down */}
                  <button
                    onClick={() => onMoveLayerUp(layer.id)}
                    className="p-1 rounded text-studio-muted hover:text-white hover:bg-studio-surface"
                    title="Bring forward"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onMoveLayerDown(layer.id)}
                    className="p-1 rounded text-studio-muted hover:text-white hover:bg-studio-surface"
                    title="Send backward"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => onDuplicateLayer(layer.id)}
                    className="p-1 rounded text-studio-muted hover:text-white hover:bg-studio-surface opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Duplicate layer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteLayer(layer.id)}
                    className="p-1 rounded text-studio-muted hover:text-rose-400 hover:bg-studio-surface opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
