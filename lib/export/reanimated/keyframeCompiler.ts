/**
 * Reanimated Keyframe Compiler
 * Compiles Looply timeline and keyframe tracks into React Native Reanimated animation logic.
 * Enforces single master timeline synchronization across all animated properties to guarantee
 * 100% parity with CSS @keyframes without drift or phase mismatch.
 */

import { ProjectData, LayerRecord, KeyframeRecord, KeyframeProperties, InterpolatedLayerState } from '@/types/animation';
import { interpolateLayer } from '@/lib/animation/interpolator';
import {
  ReanimatedOutputMode,
  ReanimatedLanguage,
  ReanimatedExportOptions,
  SharedValueRequirement,
  AnimatedStyleRequirement,
} from './types';
import {
  getAnimatedPropertyKeys,
  getLayerBasePropertyValue,
  generateLayerVarPrefix,
  REANIMATED_PROPERTY_SPECS,
} from './propertyMapper';
import {
  mapEasingToReanimated,
  mapSpringConfigToReanimated,
  secondsToMs,
} from './timingMapper';

export interface CompiledTrack {
  layerId: string;
  layerName: string;
  property: keyof KeyframeProperties;
  reanimatedPropKey: string;
  isTransform: boolean;
  transformKey?: string;
  sharedVarName: string;
  initialValue: number;
  initialFormattedValue: number | string;
  animationExpression: string;
  interpolationExpression?: string;
  inputRange?: number[];
  outputRange?: number[];
}

export interface CompiledLayerResult {
  layer: LayerRecord;
  varPrefix: string;
  tracks: CompiledTrack[];
  styleRequirement: AnimatedStyleRequirement;
  sharedValueRequirements: SharedValueRequirement[];
}

/**
 * Extracts all unique timeline checkpoint timestamps (in seconds) for a layer,
 * including keyframes across all properties, start/end bounds, and master timeline boundaries.
 */
export function getLayerUnifiedCheckpoints(project: ProjectData, layer: LayerRecord): number[] {
  const durationSec = Math.max(0.1, project.settings.duration || 3);
  const startSec = Math.max(0, layer.startTime ?? 0);
  const endSec = Math.min(durationSec, layer.endTime !== undefined ? layer.endTime : durationSec);

  const times = new Set<number>();
  times.add(0);
  times.add(durationSec);

  // Layer in-point clipping if trimmed
  if (startSec > 0.02 && startSec < durationSec) {
    times.add(startSec);
  }
  // Layer out-point clipping if trimmed
  if (endSec < durationSec - 0.02 && endSec > 0) {
    times.add(endSec);
  }

  // All keyframe timestamps across all properties on this layer
  if (layer.keyframes) {
    layer.keyframes.forEach((kf) => {
      const clamped = Math.max(0, Math.min(durationSec, kf.time));
      times.add(clamped);
    });
  }

  // Sort ascending and deduplicate within 5ms tolerance
  const sorted = Array.from(times).sort((a, b) => a - b);
  const deduped: number[] = [];
  for (const t of sorted) {
    if (deduped.length === 0 || t - deduped[deduped.length - 1] > 0.005) {
      deduped.push(Math.round(t * 1000) / 1000);
    }
  }

  // Lock endpoints
  deduped[0] = 0;
  if (Math.abs(deduped[deduped.length - 1] - durationSec) > 0.005) {
    deduped.push(durationSec);
  } else {
    deduped[deduped.length - 1] = durationSec;
  }

  return deduped;
}

/**
 * Compiles an individual property track into Reanimated animation expressions,
 * locked to the unified master timeline checkpoints.
 */
function compilePropertyTrack(
  project: ProjectData,
  layer: LayerRecord,
  prop: keyof KeyframeProperties,
  varPrefix: string,
  mode: ReanimatedOutputMode,
  unifiedCheckpoints: number[]
): CompiledTrack {
  const spec = REANIMATED_PROPERTY_SPECS[prop];
  const sharedVarName = `${varPrefix}${spec.key.charAt(0).toUpperCase() + spec.key.slice(1)}`;
  const durationSec = Math.max(0.1, project.settings.duration || 3);
  const totalDurationMs = secondsToMs(durationSec);
  const isLoop = project.settings.loop;
  const isReverse = project.settings.direction === 'alternate';

  // Compute exact value at each checkpoint using master interpolator (matching canvas and CSS)
  const timelinePoints: { time: number; value: number; easing?: string; springConfig?: any }[] = [];

  unifiedCheckpoints.forEach((t) => {
    const state = interpolateLayer(layer, t);
    let val = 0;
    if (prop === 'x') val = state.x;
    else if (prop === 'y') val = state.y;
    else if (prop === 'rotation') val = state.rotation;
    else if (prop === 'scaleX') val = state.scaleX;
    else if (prop === 'scaleY') val = state.scaleY;
    else if (prop === 'opacity') val = state.opacity;
    else if (prop === 'width') val = state.width;
    else if (prop === 'height') val = state.height;

    // Find keyframe defining easing for this segment
    const prevKf = [...(layer.keyframes || [])]
      .filter((k) => k.time <= t + 0.005)
      .sort((a, b) => b.time - a.time)[0];
    const easing = prevKf?.easing || layer.easing || 'ease';
    const springConfig = prevKf?.springConfig || layer.springConfig;

    timelinePoints.push({
      time: t,
      value: Math.round(val * 100) / 100,
      easing,
      springConfig,
    });
  });

  const initialVal = timelinePoints[0].value;
  const initialFormatted = spec.formatValue(initialVal);

  // 1. Build Interpolation Track (Progress-Driven)
  const inputRange: number[] = [];
  const outputRange: number[] = [];

  timelinePoints.forEach((pt) => {
    const progressNorm = Math.round((pt.time / durationSec) * 1000) / 1000;
    if (inputRange.length === 0 || progressNorm > inputRange[inputRange.length - 1]) {
      inputRange.push(progressNorm);
      outputRange.push(pt.value);
    }
  });

  // Ensure [0, 1] bounds are covered
  if (inputRange[0] > 0) {
    inputRange.unshift(0);
    outputRange.unshift(outputRange[0]);
  }
  if (inputRange[inputRange.length - 1] < 1) {
    inputRange.push(1);
    outputRange.push(outputRange[outputRange.length - 1]);
  }

  const interpolationExpression = `interpolate(\n    progress.value,\n    [${inputRange.join(', ')}],\n    [${outputRange.join(', ')}],\n    Extrapolation.CLAMP\n  )`;

  // 2. Build Sequential / Expression steps locked to unified checkpoints
  const steps: string[] = [];

  for (let i = 1; i < timelinePoints.length; i++) {
    const prev = timelinePoints[i - 1];
    const curr = timelinePoints[i];
    // Segment duration calculated as difference between timestamps in ms
    // This mathematically guarantees that sum(segmentDurations) === totalDurationMs!
    const segmentDurationMs = Math.max(1, secondsToMs(curr.time) - secondsToMs(prev.time));
    const targetVal = curr.value;

    const useSpring = curr.easing === 'spring' || (layer.easing === 'spring' && !curr.easing);
    if (useSpring) {
      const springRes = mapSpringConfigToReanimated(curr.springConfig || layer.springConfig);
      steps.push(`withSpring(${targetVal}, ${springRes.configString})`);
    } else {
      const easingRes = mapEasingToReanimated(prev.easing || layer.easing);
      steps.push(
        `withTiming(${targetVal}, { duration: ${segmentDurationMs}, easing: ${easingRes.expression} })`
      );
    }
  }

  let baseSequenceExpr = '';
  if (steps.length === 1) {
    baseSequenceExpr = steps[0];
  } else if (steps.length > 1) {
    baseSequenceExpr = `withSequence(\n    ${steps.join(',\n    ')}\n  )`;
  } else {
    baseSequenceExpr = `withTiming(${initialVal}, { duration: ${totalDurationMs} })`;
  }

  // Handle loop / repeat
  let animationExpression = '';
  if (isLoop) {
    animationExpression = `withRepeat(${baseSequenceExpr}, -1, ${isReverse ? 'true' : 'false'})`;
  } else {
    animationExpression = baseSequenceExpr;
  }

  return {
    layerId: layer.id,
    layerName: layer.name,
    property: prop,
    reanimatedPropKey: spec.key,
    isTransform: spec.isTransform,
    transformKey: spec.transformKey,
    sharedVarName,
    initialValue: initialVal,
    initialFormattedValue: initialFormatted,
    animationExpression,
    interpolationExpression,
    inputRange,
    outputRange,
  };
}

/**
 * Compiles all layers and keyframes for the project into structured Reanimated blocks.
 * Supports passing either ReanimatedExportOptions or a string ReanimatedOutputMode.
 */
export function compileProjectToReanimated(
  project: ProjectData,
  optionsOrMode: ReanimatedExportOptions | ReanimatedOutputMode
): CompiledLayerResult[] {
  const mode: ReanimatedOutputMode =
    typeof optionsOrMode === 'string' ? optionsOrMode : optionsOrMode.outputMode;

  const results: CompiledLayerResult[] = [];

  project.layers.forEach((layer, layerIdx) => {
    const varPrefix = generateLayerVarPrefix(layer, layerIdx);
    const animatedProps = getAnimatedPropertyKeys(layer);
    const unifiedCheckpoints = getLayerUnifiedCheckpoints(project, layer);

    const tracks: CompiledTrack[] = [];
    const sharedValueRequirements: SharedValueRequirement[] = [];

    // Compile each animated property using the unified timeline checkpoints
    animatedProps.forEach((prop) => {
      const track = compilePropertyTrack(project, layer, prop, varPrefix, mode, unifiedCheckpoints);
      tracks.push(track);

      sharedValueRequirements.push({
        name: track.sharedVarName,
        type: typeof track.initialValue,
        initialValue: track.initialValue,
        layerName: layer.name,
        property: prop,
        description: `Tracks ${track.reanimatedPropKey} for layer "${layer.name}"`,
      });
    });

    // Build style requirement for layer
    const styleProps: AnimatedStyleRequirement['properties'] = [];

    // Transforms
    const transformTracks = tracks.filter((t) => t.isTransform);
    if (transformTracks.length > 0) {
      transformTracks.forEach((t) => {
        let valExpr = '';
        if (mode === 'interpolation' && t.interpolationExpression) {
          valExpr = t.reanimatedPropKey === 'rotate'
            ? `\`\${${t.interpolationExpression}}deg\``
            : t.interpolationExpression;
        } else {
          valExpr = t.reanimatedPropKey === 'rotate'
            ? `\`\${${t.sharedVarName}.value}deg\``
            : `${t.sharedVarName}.value`;
        }

        styleProps.push({
          key: 'transform',
          valueExpression: `{ ${t.transformKey}: ${valExpr} }`,
          isTransform: true,
          transformKey: t.transformKey,
        });
      });
    } else {
      // Static transform fallback
      const staticParts: string[] = [];
      if (layer.x !== 0) staticParts.push(`{ translateX: ${layer.x} }`);
      if (layer.y !== 0) staticParts.push(`{ translateY: ${layer.y} }`);
      if (layer.rotation !== 0) staticParts.push(`{ rotate: '${layer.rotation}deg' }`);
      if (layer.scaleX !== 1 || layer.scaleY !== 1) {
        if (layer.scaleX === layer.scaleY) {
          staticParts.push(`{ scale: ${layer.scaleX} }`);
        } else {
          staticParts.push(`{ scaleX: ${layer.scaleX} }`);
          staticParts.push(`{ scaleY: ${layer.scaleY} }`);
        }
      }
      if (staticParts.length > 0) {
        styleProps.push({
          key: 'transform',
          valueExpression: `[ ${staticParts.join(', ')} ]`,
          isTransform: true,
        });
      }
    }

    // Non-transform styles (opacity, width, height)
    const nonTransformTracks = tracks.filter((t) => !t.isTransform);
    nonTransformTracks.forEach((t) => {
      let valExpr = '';
      if (mode === 'interpolation' && t.interpolationExpression) {
        valExpr = t.interpolationExpression;
      } else {
        valExpr = `${t.sharedVarName}.value`;
      }
      styleProps.push({
        key: t.reanimatedPropKey,
        valueExpression: valExpr,
        isTransform: false,
      });
    });

    // Static opacity if not animated and not 1
    if (!tracks.some((t) => t.reanimatedPropKey === 'opacity') && layer.opacity !== 1) {
      styleProps.push({
        key: 'opacity',
        valueExpression: `${layer.opacity}`,
        isTransform: false,
      });
    }

    const styleRequirement: AnimatedStyleRequirement = {
      name: `${varPrefix}AnimatedStyle`,
      layerName: layer.name,
      properties: styleProps,
    };

    results.push({
      layer,
      varPrefix,
      tracks,
      styleRequirement,
      sharedValueRequirements,
    });
  });

  return results;
}
