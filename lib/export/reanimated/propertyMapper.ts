/**
 * Reanimated Property Mapper
 * Handles conversion between Looply properties and React Native Reanimated property structures.
 */

import { LayerRecord, KeyframeProperties } from '@/types/animation';

export function sanitizeIdentifier(str: string): string {
  // Convert string to valid JavaScript camelCase identifier
  const cleaned = str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      if (!word) return '';
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');

  const valid = /^[a-zA-Z_$]/.test(cleaned) ? cleaned : `val_${cleaned}`;
  return valid || 'anim';
}

export function generateLayerVarPrefix(layer: LayerRecord, fallbackIndex: number): string {
  const baseName = sanitizeIdentifier(layer.name) || `layer${fallbackIndex + 1}`;
  return baseName;
}

export interface ReanimatedValueFormat {
  key: string;
  isTransform: boolean;
  transformKey?: string;
  formatValue: (val: number) => string | number;
  formatStringValue?: (expr: string) => string;
  defaultValue: number;
}

export const REANIMATED_PROPERTY_SPECS: Record<string, ReanimatedValueFormat> = {
  x: {
    key: 'translateX',
    isTransform: true,
    transformKey: 'translateX',
    formatValue: (val: number) => Math.round(val * 100) / 100,
    defaultValue: 0,
  },
  y: {
    key: 'translateY',
    isTransform: true,
    transformKey: 'translateY',
    formatValue: (val: number) => Math.round(val * 100) / 100,
    defaultValue: 0,
  },
  scaleX: {
    key: 'scaleX',
    isTransform: true,
    transformKey: 'scaleX',
    formatValue: (val: number) => Math.round(val * 1000) / 1000,
    defaultValue: 1,
  },
  scaleY: {
    key: 'scaleY',
    isTransform: true,
    transformKey: 'scaleY',
    formatValue: (val: number) => Math.round(val * 1000) / 1000,
    defaultValue: 1,
  },
  rotation: {
    key: 'rotate',
    isTransform: true,
    transformKey: 'rotate',
    formatValue: (val: number) => `${Math.round(val * 100) / 100}deg`,
    formatStringValue: (expr: string) => `\`\${${expr}}deg\``,
    defaultValue: 0,
  },
  opacity: {
    key: 'opacity',
    isTransform: false,
    formatValue: (val: number) => Math.max(0, Math.min(1, Math.round(val * 1000) / 1000)),
    defaultValue: 1,
  },
  width: {
    key: 'width',
    isTransform: false,
    formatValue: (val: number) => Math.max(0, Math.round(val * 100) / 100),
    defaultValue: 100,
  },
  height: {
    key: 'height',
    isTransform: false,
    formatValue: (val: number) => Math.max(0, Math.round(val * 100) / 100),
    defaultValue: 100,
  },
};

/**
 * Checks if a property actually varies across keyframes or differs from base.
 */
export function isPropertyActuallyAnimated(layer: LayerRecord, prop: keyof KeyframeProperties): boolean {
  if (!layer.keyframes || layer.keyframes.length === 0) return false;
  const baseVal = getLayerBasePropertyValue(layer, prop);
  for (const kf of layer.keyframes) {
    if (kf.properties && kf.properties[prop] !== undefined) {
      if (Math.abs((kf.properties[prop] as number) - baseVal) > 0.001) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Extracts animated property keys from a layer's keyframes,
 * filtering out properties that remain completely static across the timeline.
 */
export function getAnimatedPropertyKeys(layer: LayerRecord): (keyof KeyframeProperties)[] {
  if (!layer.keyframes || layer.keyframes.length === 0) return [];

  // Consistent ordering
  const orderedProps: (keyof KeyframeProperties)[] = [
    'x',
    'y',
    'rotation',
    'scaleX',
    'scaleY',
    'opacity',
    'width',
    'height',
  ];

  return orderedProps.filter((p) => isPropertyActuallyAnimated(layer, p));
}

/**
 * Gets the base value for a property from the layer record.
 */
export function getLayerBasePropertyValue(layer: LayerRecord, prop: keyof KeyframeProperties): number {
  switch (prop) {
    case 'x':
      return layer.x ?? 0;
    case 'y':
      return layer.y ?? 0;
    case 'scaleX':
      return layer.scaleX ?? 1;
    case 'scaleY':
      return layer.scaleY ?? 1;
    case 'rotation':
      return layer.rotation ?? 0;
    case 'opacity':
      return layer.opacity ?? 1;
    case 'width':
      return layer.width ?? 100;
    case 'height':
      return layer.height ?? 100;
    default:
      return 0;
  }
}
