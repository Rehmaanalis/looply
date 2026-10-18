import { LayerRecord, InterpolatedLayerState, KeyframeRecord } from '@/types/animation';
import { evaluateSpring } from './spring';
import { parseCubicBezier, evaluateCubicBezier } from './bezier';

export function evaluateEasing(easing: string = 'ease', t: number, keyframe?: KeyframeRecord): number {
  const clampT = Math.max(0, Math.min(1, t));

  // Check if spring easing
  if (easing === 'spring' || keyframe?.springConfig) {
    const config = keyframe?.springConfig || { mass: 1, stiffness: 180, damping: 14, initialVelocity: 0 };
    return evaluateSpring(config, clampT);
  }

  // Check if cubic-bezier
  if (easing.startsWith('cubic-bezier')) {
    const points = parseCubicBezier(easing);
    if (points) {
      return evaluateCubicBezier(points, clampT);
    }
  }

  // Steps
  if (easing.startsWith('steps(')) {
    const match = easing.match(/steps\((\d+)\)/);
    if (match) {
      const stepCount = Math.max(1, parseInt(match[1], 10));
      return Math.floor(clampT * stepCount) / stepCount;
    }
  }

  switch (easing) {
    case 'linear':
      return clampT;
    case 'ease-in':
      return clampT * clampT;
    case 'ease-out':
      return clampT * (2 - clampT);
    case 'ease-in-out':
      return clampT < 0.5 ? 2 * clampT * clampT : -1 + (4 - 2 * clampT) * clampT;
    case 'ease':
    default: {
      const sq = clampT * clampT;
      return 3 * sq - 2 * clampT * sq;
    }
  }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function interpolateLayer(layer: LayerRecord, currentTime: number): InterpolatedLayerState {
  // Check if current time is outside layer timeline active span
  const startTime = layer.startTime ?? 0;
  const endTime = layer.endTime !== undefined ? layer.endTime : Infinity;
  const isTimeInRange = currentTime >= startTime && currentTime <= endTime;

  const baseState: InterpolatedLayerState = {
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    rotation: layer.rotation,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    opacity: isTimeInRange ? layer.opacity : 0,
    originX: layer.originX,
    originY: layer.originY,
    visible: layer.visible && isTimeInRange,
  };

  if (!isTimeInRange) {
    if (currentTime < startTime && layer.keyframes && layer.keyframes.length > 0) {
      const sorted = [...layer.keyframes].sort((a, b) => a.time - b.time);
      const first = sorted[0];
      return {
        ...baseState,
        x: first.properties.x ?? baseState.x,
        y: first.properties.y ?? baseState.y,
        width: first.properties.width ?? baseState.width,
        height: first.properties.height ?? baseState.height,
        rotation: first.properties.rotation ?? baseState.rotation,
        scaleX: first.properties.scaleX ?? baseState.scaleX,
        scaleY: first.properties.scaleY ?? baseState.scaleY,
        opacity: 0,
        visible: false,
      };
    }
    if (currentTime > endTime && layer.keyframes && layer.keyframes.length > 0) {
      const sorted = [...layer.keyframes].sort((a, b) => a.time - b.time);
      const last = sorted[sorted.length - 1];
      return {
        ...baseState,
        x: last.properties.x ?? baseState.x,
        y: last.properties.y ?? baseState.y,
        width: last.properties.width ?? baseState.width,
        height: last.properties.height ?? baseState.height,
        rotation: last.properties.rotation ?? baseState.rotation,
        scaleX: last.properties.scaleX ?? baseState.scaleX,
        scaleY: last.properties.scaleY ?? baseState.scaleY,
        opacity: 0,
        visible: false,
      };
    }
    return baseState;
  }

  if (!layer.keyframes || layer.keyframes.length === 0) {
    return applyValueMappings(baseState, layer);
  }

  const sorted = [...layer.keyframes].sort((a, b) => a.time - b.time);

  // If time is before or at the first keyframe
  if (currentTime <= sorted[0].time) {
    const k = sorted[0];
    const state = {
      ...baseState,
      x: k.properties.x ?? baseState.x,
      y: k.properties.y ?? baseState.y,
      width: k.properties.width ?? baseState.width,
      height: k.properties.height ?? baseState.height,
      rotation: k.properties.rotation ?? baseState.rotation,
      scaleX: k.properties.scaleX ?? baseState.scaleX,
      scaleY: k.properties.scaleY ?? baseState.scaleY,
      opacity: k.properties.opacity ?? baseState.opacity,
    };
    return applyValueMappings(state, layer);
  }

  // If time is after or at the last keyframe
  if (currentTime >= sorted[sorted.length - 1].time) {
    const k = sorted[sorted.length - 1];
    const state = {
      ...baseState,
      x: k.properties.x ?? baseState.x,
      y: k.properties.y ?? baseState.y,
      width: k.properties.width ?? baseState.width,
      height: k.properties.height ?? baseState.height,
      rotation: k.properties.rotation ?? baseState.rotation,
      scaleX: k.properties.scaleX ?? baseState.scaleX,
      scaleY: k.properties.scaleY ?? baseState.scaleY,
      opacity: k.properties.opacity ?? baseState.opacity,
    };
    return applyValueMappings(state, layer);
  }

  // Find bounding keyframes
  let k1: KeyframeRecord = sorted[0];
  let k2: KeyframeRecord = sorted[1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (currentTime >= sorted[i].time && currentTime <= sorted[i + 1].time) {
      k1 = sorted[i];
      k2 = sorted[i + 1];
      break;
    }
  }

  const dt = k2.time - k1.time;
  if (dt <= 0.0001) {
    const state = {
      ...baseState,
      x: k1.properties.x ?? baseState.x,
      y: k1.properties.y ?? baseState.y,
      width: k1.properties.width ?? baseState.width,
      height: k1.properties.height ?? baseState.height,
      rotation: k1.properties.rotation ?? baseState.rotation,
      scaleX: k1.properties.scaleX ?? baseState.scaleX,
      scaleY: k1.properties.scaleY ?? baseState.scaleY,
      opacity: k1.properties.opacity ?? baseState.opacity,
    };
    return applyValueMappings(state, layer);
  }

  const rawProgress = (currentTime - k1.time) / dt;
  const easingCurve = k1.easing || layer.easing || 'ease';
  const easedProgress = evaluateEasing(easingCurve, rawProgress, k1);

  const getProp = (prop: keyof InterpolatedLayerState, fallback: number) => {
    const val1 = (k1.properties as any)[prop] ?? (layer as any)[prop] ?? fallback;
    const val2 = (k2.properties as any)[prop] ?? (layer as any)[prop] ?? fallback;
    return lerp(val1, val2, easedProgress);
  };

  const interpolated: InterpolatedLayerState = {
    ...baseState,
    x: getProp('x', baseState.x),
    y: getProp('y', baseState.y),
    width: getProp('width', baseState.width),
    height: getProp('height', baseState.height),
    rotation: getProp('rotation', baseState.rotation),
    scaleX: getProp('scaleX', baseState.scaleX),
    scaleY: getProp('scaleY', baseState.scaleY),
    opacity: Math.max(0, Math.min(1, getProp('opacity', baseState.opacity))),
  };

  return applyValueMappings(interpolated, layer);
}

/**
 * Applies optional Reanimated-style value mappings (e.g. mapping X translation to Opacity or Rotation)
 */
function applyValueMappings(state: InterpolatedLayerState, layer: LayerRecord): InterpolatedLayerState {
  if (!layer.valueMappings || layer.valueMappings.length === 0) {
    return state;
  }

  const result = { ...state };

  for (const mapping of layer.valueMappings) {
    const sourceVal = (result as any)[mapping.sourceProp];
    if (typeof sourceVal !== 'number') continue;

    const [inMin, inMax] = mapping.inputRange;
    const [outMin, outMax] = mapping.outputRange;

    const range = inMax - inMin;
    if (Math.abs(range) < 0.0001) continue;

    let progress = (sourceVal - inMin) / range;
    if (mapping.clamp) {
      progress = Math.max(0, Math.min(1, progress));
    }

    const mappedVal = outMin + (outMax - outMin) * progress;

    if (mapping.targetProp === 'opacity') {
      result.opacity = Math.max(0, Math.min(1, mappedVal));
    } else if (mapping.targetProp === 'rotation') {
      result.rotation = mappedVal;
    } else if (mapping.targetProp === 'scaleX') {
      result.scaleX = mappedVal;
    } else if (mapping.targetProp === 'scaleY') {
      result.scaleY = mappedVal;
    }
  }

  return result;
}
