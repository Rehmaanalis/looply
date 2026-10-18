/**
 * Reanimated Capability Registry
 * Explicit registry for supported, approximate, and unsupported properties & animation capabilities.
 */

export interface CapabilityEntry {
  id: string;
  name: string;
  status: 'supported' | 'approximate' | 'unsupported';
  description: string;
  notes?: string;
}

export const REANIMATED_CAPABILITIES: Record<string, CapabilityEntry> = {
  translateX: {
    id: 'translateX',
    name: 'Translate X',
    status: 'supported',
    description: 'Horizontal translation mapped to transform array: [{ translateX }].',
  },
  translateY: {
    id: 'translateY',
    name: 'Translate Y',
    status: 'supported',
    description: 'Vertical translation mapped to transform array: [{ translateY }].',
  },
  scale: {
    id: 'scale',
    name: 'Uniform Scale',
    status: 'supported',
    description: 'Uniform scaling mapped to transform array: [{ scale }].',
  },
  scaleX: {
    id: 'scaleX',
    name: 'Horizontal Scale',
    status: 'supported',
    description: 'Non-uniform horizontal scaling mapped to [{ scaleX }].',
  },
  scaleY: {
    id: 'scaleY',
    name: 'Vertical Scale',
    status: 'supported',
    description: 'Non-uniform vertical scaling mapped to [{ scaleY }].',
  },
  rotate: {
    id: 'rotate',
    name: 'Z-Axis Rotation',
    status: 'supported',
    description: 'Rotation mapped to degrees string: [{ rotate: `${val}deg` }].',
  },
  opacity: {
    id: 'opacity',
    name: 'Opacity',
    status: 'supported',
    description: 'Direct numeric opacity value in range [0, 1].',
  },
  width: {
    id: 'width',
    name: 'Width',
    status: 'supported',
    description: 'Dimension width in logical pixels.',
  },
  height: {
    id: 'height',
    name: 'Height',
    status: 'supported',
    description: 'Dimension height in logical pixels.',
  },
  borderRadius: {
    id: 'borderRadius',
    name: 'Border Radius',
    status: 'supported',
    description: 'Corner rounding in logical pixels.',
  },
  backgroundColor: {
    id: 'backgroundColor',
    name: 'Background Color',
    status: 'supported',
    description: 'Interpolated RGBA or hex color.',
  },
  transformOrigin: {
    id: 'transformOrigin',
    name: 'Transform Origin',
    status: 'approximate',
    description: 'React Native transforms pivot around the center (50% 50%) by default unless transformOrigin is supported.',
    notes: 'Reanimated 4.x (Latest) and 3.5+ (React Native 0.73+) support transformOrigin natively. For older versions, coordinate offsets can be used.',
  },
  springPhysics: {
    id: 'springPhysics',
    name: 'Spring Dynamics (withSpring)',
    status: 'supported',
    description: 'Full translation of mass, damping, stiffness, initial velocity, and overshootClamping.',
  },
  cubicBezier: {
    id: 'cubicBezier',
    name: 'Cubic Bézier Easing',
    status: 'supported',
    description: 'Translated directly to Easing.bezier(x1, y1, x2, y2).',
  },
  infiniteRepeat: {
    id: 'infiniteRepeat',
    name: 'Repeating & Infinite Loops',
    status: 'supported',
    description: 'Translated to withRepeat(animation, -1, reverse).',
  },
  delaysAndSequences: {
    id: 'delaysAndSequences',
    name: 'Delays and Sequences',
    status: 'supported',
    description: 'Translated using withDelay(ms, ...) and withSequence(...).',
  },
  layerClipping: {
    id: 'layerClipping',
    name: 'Layer Start/End Time Clipping',
    status: 'supported',
    description: 'Compiles layer in-points and out-points into opacity clamps and delay timing.',
  },
  cssFilters: {
    id: 'cssFilters',
    name: 'CSS Filter Effects (blur, drop-shadow, brightness)',
    status: 'unsupported',
    description: 'CSS web filters are not natively supported in React Native StyleSheet.',
    notes: 'Requires platform-specific shader or SVG filter libraries.',
  },
  clipPath: {
    id: 'clipPath',
    name: 'CSS Clip Path',
    status: 'unsupported',
    description: 'Arbitrary polygonal clip-paths require react-native-svg or custom native modules.',
  },
};
