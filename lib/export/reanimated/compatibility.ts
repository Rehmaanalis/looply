/**
 * Reanimated Compatibility & Validation System
 * Analyzes animation model and determines supported, approximate, and unsupported aspects.
 */

import { ProjectData, LayerRecord } from '@/types/animation';
import { ReanimatedCompatibilityReport, ReanimatedDiagnostic } from './types';
import { getAnimatedPropertyKeys } from './propertyMapper';
import { mapEasingToReanimated } from './timingMapper';

export function analyzeReanimatedCompatibility(project: ProjectData): ReanimatedCompatibilityReport {
  const supported: ReanimatedDiagnostic[] = [];
  const approximate: ReanimatedDiagnostic[] = [];
  const unsupported: ReanimatedDiagnostic[] = [];

  const { duration } = project.settings;

  // Global Project Checks
  supported.push({
    severity: 'supported',
    title: 'Master Timeline Synchronization',
    message: `All tracks synchronize relative to the master duration of ${duration}s.`,
  });

  if (project.settings.loop) {
    supported.push({
      severity: 'supported',
      title: 'Continuous Playback (withRepeat)',
      message: 'Infinite loops map cleanly to Reanimated withRepeat(-1, reverse).',
    });
  }

  // Layer & Property Checks
  project.layers.forEach((layer: LayerRecord) => {
    const animatedProps = getAnimatedPropertyKeys(layer);

    // Check if layer has any animation
    if (animatedProps.length === 0 && (!layer.startTime || layer.startTime === 0)) {
      supported.push({
        severity: 'supported',
        layerId: layer.id,
        layerName: layer.name,
        title: 'Static Layer State',
        message: `Layer "${layer.name}" has no keyframes and exports as static style transforms.`,
      });
      return;
    }

    // Check transform-origin
    const originX = layer.originX ?? 50;
    const originY = layer.originY ?? 50;
    if (originX !== 50 || originY !== 50) {
      approximate.push({
        severity: 'approximate',
        layerId: layer.id,
        layerName: layer.name,
        property: 'transformOrigin',
        title: 'Non-Center Transform Origin',
        message: `Layer "${layer.name}" uses transform-origin (${originX}%, ${originY}%). React Native transform arrays default to center pivot (50% 50%).`,
        suggestion:
          'In Reanimated 4.x / 3.5+ (React Native 0.73+), you can pass `transformOrigin: ["' +
          originX +
          '%", "' +
          originY +
          '%"]` inside the style object, or wrap the layer in a container with translate offsets.',
      });
    }

    // Check layer in-point / out-point trimming
    const hasStartTime = layer.startTime && layer.startTime > 0.02;
    const hasEndTime = layer.endTime && layer.endTime < duration - 0.02;
    if (hasStartTime || hasEndTime) {
      supported.push({
        severity: 'supported',
        layerId: layer.id,
        layerName: layer.name,
        property: 'timing',
        title: 'Timeline In/Out Clipping',
        message: `Layer "${layer.name}" is trimmed on the timeline (${layer.startTime || 0}s to ${layer.endTime || duration}s) and is coordinated with initial delays and opacity boundaries.`,
      });
    }

    // Check layer spring configuration
    if (layer.easing === 'spring' || layer.springConfig) {
      supported.push({
        severity: 'supported',
        layerId: layer.id,
        layerName: layer.name,
        property: 'springConfig',
        title: 'Physical Spring Configuration',
        message: `Layer "${layer.name}" translates physics parameters (mass, damping, stiffness) directly to Reanimated withSpring options.`,
      });
    }

    // Check keyframe easings
    if (layer.keyframes) {
      layer.keyframes.forEach((kf, idx) => {
        if (kf.easing) {
          const mapped = mapEasingToReanimated(kf.easing);
          if (mapped.isApproximate) {
            approximate.push({
              severity: 'approximate',
              layerId: layer.id,
              layerName: layer.name,
              property: 'easing',
              title: `Approximate Easing at Keyframe #${idx + 1}`,
              message: mapped.notes || `Easing curve "${kf.easing}" mapped to nearest equivalent.`,
            });
          }
        }
      });
    }

    // Check individual animated properties
    animatedProps.forEach((prop) => {
      supported.push({
        severity: 'supported',
        layerId: layer.id,
        layerName: layer.name,
        property: prop,
        title: `Property Track: ${prop}`,
        message: `Keyframed ${prop} converts directly into dedicated shared value and Reanimated style transform.`,
      });
    });
  });

  const overallStatus = unsupported.length > 0 ? 'has_errors' : approximate.length > 0 ? 'has_warnings' : 'ready';

  return {
    supported,
    approximate,
    unsupported,
    overallStatus,
  };
}
