import { SpringConfig } from '@/types/animation';

export interface SpringPreset {
  id: string;
  name: string;
  description: string;
  config: SpringConfig;
}

export const SPRING_PRESETS: SpringPreset[] = [
  {
    id: 'gentle',
    name: 'Gentle',
    description: 'Smooth and soft arrival with zero overshoot',
    config: { mass: 1, stiffness: 120, damping: 14, initialVelocity: 0 },
  },
  {
    id: 'smooth',
    name: 'Smooth',
    description: 'Natural balanced damping for clean UI transitions',
    config: { mass: 1, stiffness: 180, damping: 20, initialVelocity: 0 },
  },
  {
    id: 'bouncy',
    name: 'Bouncy',
    description: 'Playful spring with pronounced overshoot and bounce',
    config: { mass: 1, stiffness: 240, damping: 11, initialVelocity: 0 },
  },
  {
    id: 'stiff',
    name: 'Stiff',
    description: 'Snappy and crisp response with immediate settling',
    config: { mass: 1, stiffness: 350, damping: 28, initialVelocity: 0 },
  },
  {
    id: 'heavy',
    name: 'Heavy',
    description: 'Higher inertia and weight feel for large dialogs or cards',
    config: { mass: 2.2, stiffness: 150, damping: 20, initialVelocity: 0 },
  },
  {
    id: 'wobbly',
    name: 'Wobbly',
    description: 'Exaggerated playful wobble with multiple harmonic oscillations',
    config: { mass: 0.9, stiffness: 190, damping: 6.5, initialVelocity: 0 },
  },
];

/**
 * Evaluates the spring progress (0 -> 1) at elapsed time `t` (seconds).
 * Returns a value where 0 is start, 1 is target, and can overshoot > 1 if underdamped.
 */
export function evaluateSpring(config: SpringConfig, t: number): number {
  if (t <= 0) return 0;

  const m = Math.max(0.1, config.mass || 1);
  const k = Math.max(1, config.stiffness || 100);
  const c = Math.max(0.1, config.damping || 10);
  const v0 = config.initialVelocity || 0;

  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(m * k));

  const x0 = -1; // displacement from target (0 - 1)
  let displacement = 0;

  if (zeta < 1) {
    // Underdamped (oscillates)
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const A = x0;
    const B = (v0 + zeta * omega0 * x0) / omegaD;
    const decay = Math.exp(-zeta * omega0 * t);
    displacement = decay * (A * Math.cos(omegaD * t) + B * Math.sin(omegaD * t));
  } else if (Math.abs(zeta - 1) < 0.001) {
    // Critically damped
    const A = x0;
    const B = v0 + omega0 * x0;
    const decay = Math.exp(-omega0 * t);
    displacement = decay * (A + B * t);
  } else {
    // Overdamped
    const omegaD = omega0 * Math.sqrt(zeta * zeta - 1);
    const decay = Math.exp(-zeta * omega0 * t);
    const A = x0;
    const B = (v0 + zeta * omega0 * x0) / omegaD;
    displacement = decay * (A * Math.cosh(omegaD * t) + B * Math.sinh(omegaD * t));
  }

  const result = 1 + displacement;

  if (config.overshootClamping && result > 1) {
    return 1;
  }

  return result;
}

/**
 * Calculates estimated settling time in seconds when displacement falls below threshold.
 */
export function estimateSpringDuration(config: SpringConfig): number {
  const m = Math.max(0.1, config.mass || 1);
  const k = Math.max(1, config.stiffness || 100);
  const c = Math.max(0.1, config.damping || 10);

  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(m * k));

  // Time constant tau = 1 / (zeta * omega0)
  // Usually settles after 4 to 6 time constants
  const tau = 1 / Math.max(0.1, zeta * omega0);
  const duration = Math.min(3.5, Math.max(0.4, tau * 5));
  return Math.round(duration * 10) / 10;
}

/**
 * Samples a spring trajectory into discrete keyframe points for CSS @keyframes export.
 */
export function sampleSpringToKeyframes(
  config: SpringConfig,
  duration: number,
  steps: number = 20
): { pct: number; progress: number }[] {
  const result: { pct: number; progress: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const t = ratio * duration;
    const val = evaluateSpring(config, t);
    result.push({
      pct: Math.round(ratio * 1000) / 10,
      progress: Math.round(val * 10000) / 10000,
    });
  }

  // Ensure 100% ends exactly at 1.0
  if (result.length > 0) {
    result[result.length - 1].progress = 1.0;
  }

  return result;
}
