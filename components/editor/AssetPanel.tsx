'use client';

import React, { useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Upload,
  Plus,
  Trash2,
  ImageIcon,
  AlertCircle,
  Move,
  Search,
  X,
} from 'lucide-react';
import { AssetRecord } from '@/types/animation';

interface AssetPanelProps {
  assets: Record<string, AssetRecord>;
  onAddAsset: (asset: AssetRecord) => void;
  onDeleteAsset: (assetId: string) => void;
  onAddAssetToStage: (asset: AssetRecord, coords?: { x: number; y: number }) => void;
}

export default function AssetPanel({
  assets,
  onAddAsset,
  onDeleteAsset,
  onAddAssetToStage,
}: AssetPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const processFile = (file: File) => {
    setErrorMsg(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported file type. Please upload PNG, JPG, WebP, or SVG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File too large (limit: 10MB). Optimize image before importing.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
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
        onAddAsset(newAsset);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => processFile(file));
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => processFile(file));
    }
  };

  const assetList = Object.values(assets);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assetList;
    const q = searchQuery.toLowerCase().trim();
    return assetList.filter((a) => a.name.toLowerCase().includes(q));
  }, [assetList, searchQuery]);

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-studio-surface border-r border-studio-border select-none overflow-hidden">
      {/* Panel Header */}
      <div className="p-3 border-b border-studio-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white">Assets</span>
        </div>
        <span className="text-[11px] font-mono text-studio-muted">
          {assetList.length} {assetList.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="p-3 shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          multiple
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-studio-border hover:border-indigo-500/50 hover:bg-studio-panel'
          }`}
        >
          <Upload className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
          <p className="text-xs font-medium text-white">Drop images or click to upload</p>
          <p className="text-[10px] text-studio-muted mt-0.5">Supports multi-image upload</p>
        </div>

        {errorMsg && (
          <div className="mt-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search input when multiple assets exist */}
        {assetList.length > 2 && (
          <div className="relative mt-2.5">
            <Search className="w-3.5 h-3.5 text-studio-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
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
        )}
      </div>

      {/* Asset List — Fully scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-2 overscroll-contain">
        {assetList.length === 0 ? (
          <div className="text-center py-8 text-xs text-studio-muted">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No assets yet. Upload graphics to start animating.
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-6 text-xs text-studio-muted">
            No assets match &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(asset));
                e.dataTransfer.setData('text/plain', asset.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className="group bg-studio-panel border border-studio-border hover:border-indigo-500/50 rounded-lg p-2.5 flex items-center gap-3 transition-all cursor-grab active:cursor-grabbing hover:shadow-md"
              title="Drag onto stage or click 'Add to Stage'"
            >
              <div className="w-12 h-12 bg-[#090a0f] rounded border border-studio-border flex items-center justify-center overflow-hidden shrink-0 pointer-events-none">
                <Image
                  src={asset.dataUrl}
                  alt={asset.name}
                  width={48}
                  height={48}
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-medium text-white truncate" title={asset.name}>
                    {asset.name}
                  </h4>
                  <Move className="w-3 h-3 text-studio-muted opacity-0 group-hover:opacity-70 shrink-0 ml-auto" />
                </div>
                <p className="text-[10px] font-mono text-studio-muted mt-0.5">
                  {asset.width}×{asset.height}px • {(asset.size / 1024).toFixed(0)}KB
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddAssetToStage(asset);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    title="Place this asset onto the canvas stage"
                  >
                    <Plus className="w-3 h-3" />
                    Add to Stage
                  </button>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAsset(asset.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-studio-muted hover:text-rose-400 rounded transition-all"
                title="Remove asset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
