import { LayerRecord } from '@/types/animation';

export interface StaggerOptions {
  interval: number; // seconds between each layer's start
  order: 'top-to-bottom' | 'bottom-to-top';
  baseDelay: number;
}

/**
 * Distributes start delays across multiple layers to achieve staggered entrance/orchestration.
 */
export function applyStaggerToLayers(
  layers: LayerRecord[],
  options: StaggerOptions
): LayerRecord[] {
  const ordered = [...layers].sort((a, b) =>
    options.order === 'top-to-bottom' ? b.zIndex - a.zIndex : a.zIndex - b.zIndex
  );

  return layers.map((layer) => {
    const idx = ordered.findIndex((l) => l.id === layer.id);
    if (idx === -1) return layer;

    const delay = Math.round((options.baseDelay + idx * options.interval) * 100) / 100;
    return {
      ...layer,
      delay,
    };
  });
}
