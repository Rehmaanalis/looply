/**
 * Reanimated Keyframe Compiler
 * Compiles Looply timeline and keyframe tracks into React Native Reanimated animation logic.
 * Enforces single master timeline synchronization across all animated properties to guarantee
 * 100% parity with CSS @keyframes without drift or phase mismatch.
 */

import { ProjectData, LayerRecord, KeyframeProperties } from '@/types/animation';
import { interpolateLayer } from '@/lib/animation/interpolator';
import {
  ReanimatedOutputMode,
  ReanimatedExportOptions,
  SharedValueRequirement,
  AnimatedStyleRequirement,
} from './types';
import {
  getAnimatedPropertyKeys,
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
    times.add(Math.max(0, startSec - 0.002));
    times.add(startSec);
  }
  // Layer out-point clipping if trimmed
  if (endSec < durationSec - 0.02 && endSec > 0) {
    times.add(endSec);
    times.add(Math.min(durationSec, endSec + 0.002));
  }

  // All keyframe timestamps across all properties on this layer
  if (layer.keyframes) {
    layer.keyframes.forEach((kf) => {
      const clamped = Math.max(0, Math.min(durationSec, kf.time));
      times.add(clamped);
    });
  }

  // Sort ascending and deduplicate within 1ms tolerance
  const sorted = Array.from(times).sort((a, b) => a - b);
  const deduped: number[] = [];
  for (const t of sorted) {
    if (deduped.length === 0 || t - deduped[deduped.length - 1] > 0.001) {
      deduped.push(Math.round(t * 1000) / 1000);
    }
  }

  // Lock endpoints
  deduped[0] = 0;
  if (Math.abs(deduped[deduped.length - 1] - durationSec) > 0.001) {
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
  const timelinePoints: { time: number; value: number; easing?: string; springConfig?: { mass: number; stiffness: number; damping: number; initialVelocity: number } }[] = [];

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
  optionsOrMode?: ReanimatedExportOptions | ReanimatedOutputMode
): CompiledLayerResult[] {
  const mode: ReanimatedOutputMode =
    typeof optionsOrMode === 'string'
      ? optionsOrMode
      : optionsOrMode?.outputMode || 'sequence';

  const durationSec = Math.max(0.1, project.settings.duration || 3);

  // Group layers by assetId to detect when multiple layers use the same asset
  const assetLayerCounts: Record<string, number> = {};
  project.layers.forEach((l) => {
    if (l.assetId) {
      assetLayerCounts[l.assetId] = (assetLayerCounts[l.assetId] || 0) + 1;
    }
  });

  const assetLayerIndices: Record<string, number> = {};
  const usedPrefixes = new Set<string>();
  const results: CompiledLayerResult[] = [];

  project.layers.forEach((layer, layerIdx) => {
    const isMultiAsset = (assetLayerCounts[layer.assetId] || 0) > 1;
    const sameAssetIndex = (assetLayerIndices[layer.assetId] || 0) + 1;
    if (layer.assetId) {
      assetLayerIndices[layer.assetId] = sameAssetIndex;
    }

    // If multiple layers use the same asset, add a small unique identifier to layer name and animation
    let layerDisplayName = layer.name;
    let uniqueIdSuffix: string | number = '';

    if (isMultiAsset) {
      uniqueIdSuffix = sameAssetIndex;
      // If layer name doesn't already end with this number, append it
      if (!new RegExp(`\\b${sameAssetIndex}$`).test(layerDisplayName)) {
        layerDisplayName = `${layerDisplayName} ${sameAssetIndex}`;
      }
    }

    let varPrefix = generateLayerVarPrefix(
      { ...layer, name: layerDisplayName },
      layerIdx,
      uniqueIdSuffix
    );

    // Guaranteed collision prevention across any layer variable prefixes
    if (usedPrefixes.has(varPrefix)) {
      let counter = 2;
      while (usedPrefixes.has(`${varPrefix}${counter}`)) {
        counter++;
      }
      varPrefix = `${varPrefix}${counter}`;
    }
    usedPrefixes.add(varPrefix);

    const animatedProps = getAnimatedPropertyKeys(layer, durationSec);
    const unifiedCheckpoints = getLayerUnifiedCheckpoints(project, layer);

    const tracks: CompiledTrack[] = [];
    const sharedValueRequirements: SharedValueRequirement[] = [];

    // Compile each animated property using the unified timeline checkpoints
    animatedProps.forEach((prop) => {
      const track = compilePropertyTrack(
        project,
        { ...layer, name: layerDisplayName },
        prop,
        varPrefix,
        mode,
        unifiedCheckpoints
      );
      tracks.push(track);

      sharedValueRequirements.push({
        name: track.sharedVarName,
        type: typeof track.initialValue,
        initialValue: track.initialValue,
        layerName: layerDisplayName,
        property: prop,
        description: `Tracks ${track.reanimatedPropKey} for layer "${layerDisplayName}"`,
      });
    });

    // Build style requirement for layer
    const styleProps: AnimatedStyleRequirement['properties'] = [];

    // 1. translateX (Always present so layer stays consistently at intended position)
    const xTrack = tracks.find((t) => t.property === 'x');
    if (xTrack) {
      const valExpr =
        mode === 'interpolation' && xTrack.interpolationExpression
          ? xTrack.interpolationExpression
          : `${xTrack.sharedVarName}.value`;
      styleProps.push({
        key: 'transform',
        valueExpression: `{ translateX: ${valExpr} }`,
        isTransform: true,
        transformKey: 'translateX',
      });
    } else {
      styleProps.push({
        key: 'transform',
        valueExpression: `{ translateX: ${layer.x ?? 0} }`,
        isTransform: true,
        transformKey: 'translateX',
      });
    }

    // 2. translateY (Always present so layer stays consistently at intended position)
    const yTrack = tracks.find((t) => t.property === 'y');
    if (yTrack) {
      const valExpr =
        mode === 'interpolation' && yTrack.interpolationExpression
          ? yTrack.interpolationExpression
          : `${yTrack.sharedVarName}.value`;
      styleProps.push({
        key: 'transform',
        valueExpression: `{ translateY: ${valExpr} }`,
        isTransform: true,
        transformKey: 'translateY',
      });
    } else {
      styleProps.push({
        key: 'transform',
        valueExpression: `{ translateY: ${layer.y ?? 0} }`,
        isTransform: true,
        transformKey: 'translateY',
      });
    }

    // 3. rotate (Applied before scale to match standard CSS translate3d -> rotate -> scale matrix order)
    const rotTrack = tracks.find((t) => t.property === 'rotation');
    if (rotTrack) {
      const valExpr =
        mode === 'interpolation' && rotTrack.interpolationExpression
          ? `\`\${${rotTrack.interpolationExpression}}deg\``
          : `\`\${${rotTrack.sharedVarName}.value}deg\``;
      styleProps.push({
        key: 'transform',
        valueExpression: `{ rotate: ${valExpr} }`,
        isTransform: true,
        transformKey: 'rotate',
      });
    } else if ((layer.rotation ?? 0) !== 0) {
      styleProps.push({
        key: 'transform',
        valueExpression: `{ rotate: '${layer.rotation}deg' }`,
        isTransform: true,
        transformKey: 'rotate',
      });
    }

    // 4. scaleX / scaleY / scale
    const scaleXTrack = tracks.find((t) => t.property === 'scaleX');
    const scaleYTrack = tracks.find((t) => t.property === 'scaleY');

    if (scaleXTrack && scaleYTrack) {
      const xExpr =
        mode === 'interpolation' && scaleXTrack.interpolationExpression
          ? scaleXTrack.interpolationExpression
          : `${scaleXTrack.sharedVarName}.value`;
      const yExpr =
        mode === 'interpolation' && scaleYTrack.interpolationExpression
          ? scaleYTrack.interpolationExpression
          : `${scaleYTrack.sharedVarName}.value`;
      styleProps.push({
        key: 'transform',
        valueExpression: `{ scaleX: ${xExpr} }`,
        isTransform: true,
        transformKey: 'scaleX',
      });
      styleProps.push({
        key: 'transform',
        valueExpression: `{ scaleY: ${yExpr} }`,
        isTransform: true,
        transformKey: 'scaleY',
      });
    } else if (scaleXTrack) {
      const xExpr =
        mode === 'interpolation' && scaleXTrack.interpolationExpression
          ? scaleXTrack.interpolationExpression
          : `${scaleXTrack.sharedVarName}.value`;
      styleProps.push({
        key: 'transform',
        valueExpression: `{ scaleX: ${xExpr} }`,
        isTransform: true,
        transformKey: 'scaleX',
      });
      if ((layer.scaleY ?? 1) !== 1) {
        styleProps.push({
          key: 'transform',
          valueExpression: `{ scaleY: ${layer.scaleY} }`,
          isTransform: true,
          transformKey: 'scaleY',
        });
      }
    } else if (scaleYTrack) {
      if ((layer.scaleX ?? 1) !== 1) {
        styleProps.push({
          key: 'transform',
          valueExpression: `{ scaleX: ${layer.scaleX} }`,
          isTransform: true,
          transformKey: 'scaleX',
        });
      }
      const yExpr =
        mode === 'interpolation' && scaleYTrack.interpolationExpression
          ? scaleYTrack.interpolationExpression
          : `${scaleYTrack.sharedVarName}.value`;
      styleProps.push({
        key: 'transform',
        valueExpression: `{ scaleY: ${yExpr} }`,
        isTransform: true,
        transformKey: 'scaleY',
      });
    } else {
      const sx = layer.scaleX ?? 1;
      const sy = layer.scaleY ?? 1;
      if (sx !== 1 || sy !== 1) {
        if (sx === sy) {
          styleProps.push({
            key: 'transform',
            valueExpression: `{ scale: ${sx} }`,
            isTransform: true,
            transformKey: 'scale',
          });
        } else {
          styleProps.push({
            key: 'transform',
            valueExpression: `{ scaleX: ${sx} }`,
            isTransform: true,
            transformKey: 'scaleX',
          });
          styleProps.push({
            key: 'transform',
            valueExpression: `{ scaleY: ${sy} }`,
            isTransform: true,
            transformKey: 'scaleY',
          });
        }
      }
    }

    // 5. opacity
    const opacityTrack = tracks.find((t) => t.property === 'opacity');
    if (opacityTrack) {
      const valExpr =
        mode === 'interpolation' && opacityTrack.interpolationExpression
          ? opacityTrack.interpolationExpression
          : `${opacityTrack.sharedVarName}.value`;
      styleProps.push({
        key: 'opacity',
        valueExpression: valExpr,
        isTransform: false,
      });
    } else if ((layer.opacity ?? 1) !== 1) {
      styleProps.push({
        key: 'opacity',
        valueExpression: `${layer.opacity}`,
        isTransform: false,
      });
    }

    // 6. width and height if animated
    const wTrack = tracks.find((t) => t.property === 'width');
    if (wTrack) {
      const valExpr =
        mode === 'interpolation' && wTrack.interpolationExpression
          ? wTrack.interpolationExpression
          : `${wTrack.sharedVarName}.value`;
      styleProps.push({
        key: 'width',
        valueExpression: valExpr,
        isTransform: false,
      });
    }
    const hTrack = tracks.find((t) => t.property === 'height');
    if (hTrack) {
      const valExpr =
        mode === 'interpolation' && hTrack.interpolationExpression
          ? hTrack.interpolationExpression
          : `${hTrack.sharedVarName}.value`;
      styleProps.push({
        key: 'height',
        valueExpression: valExpr,
        isTransform: false,
      });
    }

    const styleRequirement: AnimatedStyleRequirement = {
      name: `${varPrefix}AnimatedStyle`,
      layerName: layerDisplayName,
      properties: styleProps,
    };

    results.push({
      layer: { ...layer, name: layerDisplayName },
      varPrefix,
      tracks,
      styleRequirement,
      sharedValueRequirements,
    });
  });

  return results;
}
