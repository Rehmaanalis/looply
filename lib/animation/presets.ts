import { KeyframeRecord, LayerRecord } from '@/types/animation';

export type PresetCategory =
  | 'entrance'
  | 'exit'
  | 'movement'
  | 'attention'
  | 'loop'
  | 'transform'
  | 'creative';

export interface PresetDefinition {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  tags?: string[];
  generateKeyframes: (layer: LayerRecord, duration: number) => KeyframeRecord[];
}

export const ANIMATION_PRESETS: PresetDefinition[] = [
  // --- ENTRANCE ---
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Smoothly transitions opacity from 0 to 100%',
    category: 'entrance',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { opacity: 0 }, easing: 'ease-out' },
      { id: `kf-${Date.now()}-2`, time: Math.min(1.0, duration), properties: { opacity: layer.opacity || 1 } },
    ],
  },
  {
    id: 'slide-in-left',
    name: 'Slide In (Left)',
    description: 'Slides smoothly into position from left margin',
    category: 'entrance',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { x: layer.x - 220, opacity: 0 }, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { id: `kf-${Date.now()}-2`, time: Math.min(1.0, duration), properties: { x: layer.x, opacity: layer.opacity || 1 } },
    ],
  },
  {
    id: 'slide-in-right',
    name: 'Slide In (Right)',
    description: 'Slides into position from right margin',
    category: 'entrance',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { x: layer.x + 220, opacity: 0 }, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { id: `kf-${Date.now()}-2`, time: Math.min(1.0, duration), properties: { x: layer.x, opacity: layer.opacity || 1 } },
    ],
  },
  {
    id: 'slide-in-top',
    name: 'Slide In (Top)',
    description: 'Descends into position from above',
    category: 'entrance',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { y: layer.y - 180, opacity: 0 }, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { id: `kf-${Date.now()}-2`, time: Math.min(1.0, duration), properties: { y: layer.y, opacity: layer.opacity || 1 } },
    ],
  },
  {
    id: 'slide-in-bottom',
    name: 'Slide In (Bottom)',
    description: 'Glides up from below into final stage coordinates',
    category: 'entrance',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { y: layer.y + 180, opacity: 0 }, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { id: `kf-${Date.now()}-2`, time: Math.min(1.0, duration), properties: { y: layer.y, opacity: layer.opacity || 1 } },
    ],
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Scales up gracefully from miniature size with opacity fade',
    category: 'entrance',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { scaleX: 0.2, scaleY: 0.2, opacity: 0 }, easing: 'ease-out' },
      { id: `kf-${Date.now()}-2`, time: Math.min(0.9, duration), properties: { scaleX: layer.scaleX || 1, scaleY: layer.scaleY || 1, opacity: layer.opacity || 1 } },
    ],
  },
  {
    id: 'pop-in',
    name: 'Pop In (Spring)',
    description: 'Elastic pop arrival with spring overshoot',
    category: 'entrance',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { scaleX: 0.05, scaleY: 0.05, opacity: 0 }, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      { id: `kf-${Date.now()}-2`, time: Math.min(0.8, duration), properties: { scaleX: layer.scaleX || 1, scaleY: layer.scaleY || 1, opacity: 1 } },
    ],
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    description: 'Dynamic physics overshoot bounce landing',
    category: 'entrance',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(1.4, duration);
      return [
        { id: `kf-${Date.now()}-1`, time: 0, properties: { y: layer.y - 140, opacity: 0 }, easing: 'ease-in' },
        { id: `kf-${Date.now()}-2`, time: d * 0.4, properties: { y: layer.y, opacity: 1 }, easing: 'ease-out' },
        { id: `kf-${Date.now()}-3`, time: d * 0.65, properties: { y: layer.y - 35, opacity: 1 }, easing: 'ease-in' },
        { id: `kf-${Date.now()}-4`, time: d * 0.85, properties: { y: layer.y, opacity: 1 }, easing: 'ease-out' },
        { id: `kf-${Date.now()}-5`, time: d, properties: { y: layer.y, opacity: 1 } },
      ];
    },
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    description: 'Spins while scaling up into position',
    category: 'entrance',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { rotation: -120, scaleX: 0.3, scaleY: 0.3, opacity: 0 }, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { id: `kf-${Date.now()}-2`, time: Math.min(1.0, duration), properties: { rotation: layer.rotation || 0, scaleX: layer.scaleX || 1, scaleY: layer.scaleY || 1, opacity: 1 } },
    ],
  },

  // --- EXIT ---
  {
    id: 'fade-out',
    name: 'Fade Out',
    description: 'Smooth fade to zero opacity',
    category: 'exit',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { opacity: layer.opacity || 1 }, easing: 'ease-in' },
      { id: `kf-${Date.now()}-2`, time: Math.min(1.0, duration), properties: { opacity: 0 } },
    ],
  },
  {
    id: 'slide-out',
    name: 'Slide Out (Right)',
    description: 'Rapid exit to the right margin with fade',
    category: 'exit',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { x: layer.x, opacity: layer.opacity || 1 }, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
      { id: `kf-${Date.now()}-2`, time: Math.min(0.8, duration), properties: { x: layer.x + 250, opacity: 0 } },
    ],
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Shrinks into distance and vanishes',
    category: 'exit',
    generateKeyframes: (layer, duration) => [
      { id: `kf-${Date.now()}-1`, time: 0, properties: { scaleX: layer.scaleX || 1, scaleY: layer.scaleY || 1, opacity: layer.opacity || 1 }, easing: 'ease-in' },
      { id: `kf-${Date.now()}-2`, time: Math.min(0.8, duration), properties: { scaleX: 0.1, scaleY: 0.1, opacity: 0 } },
    ],
  },

  // --- ATTENTION & EMPHASIS ---
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Cyclical heartbeat scale pulsation',
    category: 'attention',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(2.0, duration);
      return [
        { id: `kf-${Date.now()}-1`, time: 0, properties: { scaleX: 1, scaleY: 1 }, easing: 'ease-in-out' },
        { id: `kf-${Date.now()}-2`, time: d * 0.5, properties: { scaleX: 1.18, scaleY: 1.18 }, easing: 'ease-in-out' },
        { id: `kf-${Date.now()}-3`, time: d, properties: { scaleX: 1, scaleY: 1 } },
      ];
    },
  },
  {
    id: 'shake',
    name: 'Shake (Horizontal)',
    description: 'Vigorous horizontal alert shake',
    category: 'attention',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(0.8, duration);
      return [
        { id: `kf-1`, time: 0, properties: { x: layer.x } },
        { id: `kf-2`, time: d * 0.2, properties: { x: layer.x - 16 } },
        { id: `kf-3`, time: d * 0.4, properties: { x: layer.x + 16 } },
        { id: `kf-4`, time: d * 0.6, properties: { x: layer.x - 10 } },
        { id: `kf-5`, time: d * 0.8, properties: { x: layer.x + 8 } },
        { id: `kf-6`, time: d, properties: { x: layer.x } },
      ];
    },
  },
  {
    id: 'swing',
    name: 'Swing',
    description: 'Pendulum rotational swing from top anchor',
    category: 'attention',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(1.5, duration);
      return [
        { id: `kf-1`, time: 0, properties: { rotation: 0 }, easing: 'ease-in-out' },
        { id: `kf-2`, time: d * 0.25, properties: { rotation: 18 }, easing: 'ease-in-out' },
        { id: `kf-3`, time: d * 0.5, properties: { rotation: -14 }, easing: 'ease-in-out' },
        { id: `kf-4`, time: d * 0.75, properties: { rotation: 8 }, easing: 'ease-in-out' },
        { id: `kf-5`, time: d, properties: { rotation: 0 } },
      ];
    },
  },
  {
    id: 'wobble',
    name: 'Wobble',
    description: 'Simultaneous lateral sway and rotation',
    category: 'attention',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(1.2, duration);
      return [
        { id: `kf-1`, time: 0, properties: { x: layer.x, rotation: 0 } },
        { id: `kf-2`, time: d * 0.25, properties: { x: layer.x - 20, rotation: -6 } },
        { id: `kf-3`, time: d * 0.5, properties: { x: layer.x + 16, rotation: 5 } },
        { id: `kf-4`, time: d * 0.75, properties: { x: layer.x - 8, rotation: -3 } },
        { id: `kf-5`, time: d, properties: { x: layer.x, rotation: 0 } },
      ];
    },
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    description: 'Double quick thump pulse rhythm',
    category: 'attention',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(1.4, duration);
      return [
        { id: `kf-1`, time: 0, properties: { scaleX: 1, scaleY: 1 } },
        { id: `kf-2`, time: d * 0.15, properties: { scaleX: 1.25, scaleY: 1.25 } },
        { id: `kf-3`, time: d * 0.3, properties: { scaleX: 1, scaleY: 1 } },
        { id: `kf-4`, time: d * 0.45, properties: { scaleX: 1.15, scaleY: 1.15 } },
        { id: `kf-5`, time: d * 0.6, properties: { scaleX: 1, scaleY: 1 } },
        { id: `kf-6`, time: d, properties: { scaleX: 1, scaleY: 1 } },
      ];
    },
  },

  // --- LOOPING & MOVEMENT ---
  {
    id: 'floating',
    name: 'Floating Motion',
    description: 'Gentle organic hovering float effect',
    category: 'loop',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(3.0, duration);
      return [
        { id: `kf-1`, time: 0, properties: { y: layer.y, rotation: 0 }, easing: 'ease-in-out' },
        { id: `kf-2`, time: d * 0.5, properties: { y: layer.y - 25, rotation: 3 }, easing: 'ease-in-out' },
        { id: `kf-3`, time: d, properties: { y: layer.y, rotation: 0 } },
      ];
    },
  },
  {
    id: 'drift',
    name: 'Drift & Bob',
    description: 'Diagonal floating glide for floating badges',
    category: 'loop',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(3.0, duration);
      return [
        { id: `kf-1`, time: 0, properties: { x: layer.x, y: layer.y }, easing: 'ease-in-out' },
        { id: `kf-2`, time: d * 0.5, properties: { x: layer.x + 20, y: layer.y - 18 }, easing: 'ease-in-out' },
        { id: `kf-3`, time: d, properties: { x: layer.x, y: layer.y } },
      ];
    },
  },
  {
    id: 'pendulum',
    name: 'Pendulum',
    description: 'Continuous harmonic angular oscillation',
    category: 'loop',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(2.5, duration);
      return [
        { id: `kf-1`, time: 0, properties: { rotation: -15 }, easing: 'ease-in-out' },
        { id: `kf-2`, time: d * 0.5, properties: { rotation: 15 }, easing: 'ease-in-out' },
        { id: `kf-3`, time: d, properties: { rotation: -15 } },
      ];
    },
  },
  {
    id: 'rotate-360',
    name: 'Spin 360°',
    description: 'Continuous smooth 360-degree rotation',
    category: 'loop',
    generateKeyframes: (layer, duration) => [
      { id: `kf-1`, time: 0, properties: { rotation: 0 }, easing: 'linear' },
      { id: `kf-2`, time: duration, properties: { rotation: 360 } },
    ],
  },
  {
    id: 'hover-loop',
    name: 'Hover Scale',
    description: 'Calm breathing scale motion for icons and cards',
    category: 'loop',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(2.5, duration);
      return [
        { id: `kf-1`, time: 0, properties: { scaleX: 1, scaleY: 1 }, easing: 'ease-in-out' },
        { id: `kf-2`, time: d * 0.5, properties: { scaleX: 1.08, scaleY: 1.08 }, easing: 'ease-in-out' },
        { id: `kf-3`, time: d, properties: { scaleX: 1, scaleY: 1 } },
      ];
    },
  },

  // --- COMBINATION & CREATIVE ---
  {
    id: 'fade-and-slide',
    name: 'Fade + Slide Combo',
    description: 'Combined diagonal translation and smooth fade',
    category: 'creative',
    generateKeyframes: (layer, duration) => [
      { id: `kf-1`, time: 0, properties: { x: layer.x - 80, y: layer.y + 40, opacity: 0 }, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { id: `kf-2`, time: Math.min(1.2, duration), properties: { x: layer.x, y: layer.y, opacity: 1 } },
    ],
  },
  {
    id: 'scale-and-rotate',
    name: 'Scale + Rotate Combo',
    description: 'Pop expansion combined with 45-degree rotational spin',
    category: 'creative',
    generateKeyframes: (layer, duration) => [
      { id: `kf-1`, time: 0, properties: { scaleX: 0.1, scaleY: 0.1, rotation: -45, opacity: 0 }, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      { id: `kf-2`, time: Math.min(1.0, duration), properties: { scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 } },
    ],
  },
  {
    id: 'flip',
    name: 'Horizontal Flip',
    description: 'Mirror flip effect using scaleX inversion',
    category: 'transform',
    generateKeyframes: (layer, duration) => {
      const d = Math.min(1.2, duration);
      return [
        { id: `kf-1`, time: 0, properties: { scaleX: 1 }, easing: 'ease-in' },
        { id: `kf-2`, time: d * 0.5, properties: { scaleX: -1 }, easing: 'ease-out' },
        { id: `kf-3`, time: d, properties: { scaleX: 1 } },
      ];
    },
  },
];

/**
 * Combines a new preset with existing keyframes by merging property tracks rather than wiping unrelated ones.
 */
export function combinePresetWithLayer(
  existingKeyframes: KeyframeRecord[],
  newPresetKeyframes: KeyframeRecord[]
): KeyframeRecord[] {
  if (!existingKeyframes || existingKeyframes.length === 0) {
    return newPresetKeyframes;
  }

  // Map of timestamps to merged properties
  const timeMap = new Map<number, KeyframeRecord>();

  // Add existing
  for (const kf of existingKeyframes) {
    timeMap.set(Math.round(kf.time * 100) / 100, { ...kf, properties: { ...kf.properties } });
  }

  // Merge new
  for (const nKf of newPresetKeyframes) {
    const t = Math.round(nKf.time * 100) / 100;
    const existing = timeMap.get(t);
    if (existing) {
      existing.properties = { ...existing.properties, ...nKf.properties };
      if (nKf.easing) existing.easing = nKf.easing;
    } else {
      timeMap.set(t, { ...nKf });
    }
  }

  return Array.from(timeMap.values()).sort((a, b) => a.time - b.time);
}
