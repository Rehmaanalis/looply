/**
 * Reanimated Timing Mapper
 * Handles conversion of timing, delays, easing curves, and spring configurations to React Native Reanimated.
 */

import { SpringConfig } from '@/types/animation';
import { parseCubicBezier } from '@/lib/animation/bezier';

export interface ReanimatedEasingResult {
  expression: string;
  isApproximate?: boolean;
  notes?: string;
}

/**
 * Converts Looply easing string to Reanimated Easing expression.
 */
export function mapEasingToReanimated(easingStr?: string): ReanimatedEasingResult {
  if (!easingStr || easingStr === 'linear') {
    return { expression: 'Easing.linear' };
  }

  const normalized = easingStr.trim().toLowerCase();

  if (normalized === 'ease') {
    return { expression: 'Easing.ease' };
  }

  if (normalized === 'ease-in') {
    return { expression: 'Easing.in(Easing.ease)' };
  }

  if (normalized === 'ease-out') {
    return { expression: 'Easing.out(Easing.ease)' };
  }

  if (normalized === 'ease-in-out') {
    return { expression: 'Easing.inOut(Easing.ease)' };
  }

  if (normalized.startsWith('cubic-bezier')) {
    const bezier = parseCubicBezier(easingStr);
    if (bezier) {
      const r = (n: number) => Math.round(n * 1000) / 1000;
      return {
        expression: `Easing.bezier(${r(bezier.x1)}, ${r(bezier.y1)}, ${r(bezier.x2)}, ${r(bezier.y2)})`,
      };
    }
  }

  // Common preset fallbacks
  if (normalized === 'snappy-entrance') {
    return { expression: 'Easing.bezier(0.16, 1.0, 0.3, 1.0)' };
  }

  if (normalized === 'overshoot') {
    return { expression: 'Easing.bezier(0.34, 1.56, 0.64, 1.0)' };
  }

  if (normalized === 'material-standard') {
    return { expression: 'Easing.bezier(0.0, 0.0, 0.2, 1.0)' };
  }

  if (normalized === 'swift-exit') {
    return { expression: 'Easing.bezier(0.4, 0.0, 1.0, 1.0)' };
  }

  // Fallback with approximation note
  return {
    expression: 'Easing.ease',
    isApproximate: true,
    notes: `Easing curve "${easingStr}" approximated using Easing.ease.`,
  };
}

/**
 * Converts seconds to milliseconds for Reanimated withTiming / withDelay.
 */
export function secondsToMs(seconds: number): number {
  return Math.max(0, Math.round(seconds * 1000));
}

export interface ReanimatedSpringResult {
  configObject: Record<string, number | boolean>;
  configString: string;
}

/**
 * Converts Looply SpringConfig to Reanimated withSpring options.
 */
export function mapSpringConfigToReanimated(config?: SpringConfig): ReanimatedSpringResult {
  const mass = Math.max(0.1, config?.mass ?? 1);
  const damping = Math.max(0.1, config?.damping ?? 10);
  const stiffness = Math.max(1, config?.stiffness ?? 100);
  const velocity = config?.initialVelocity ?? 0;
  const overshootClamping = Boolean(config?.overshootClamping);

  const configObject: Record<string, number | boolean> = {
    mass,
    damping,
    stiffness,
    velocity,
  };

  if (overshootClamping) {
    configObject.overshootClamping = true;
  }

  const parts = [
    `mass: ${mass}`,
    `damping: ${damping}`,
    `stiffness: ${stiffness}`,
    velocity !== 0 ? `velocity: ${velocity}` : null,
    overshootClamping ? `overshootClamping: true` : null,
  ].filter(Boolean);

  return {
    configObject,
    configString: `{ ${parts.join(', ')} }`,
  };
}
