export interface BezierPoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BezierPreset {
  id: string;
  name: string;
  description: string;
  points: BezierPoints;
}

export const BEZIER_PRESETS: BezierPreset[] = [
  {
    id: 'ease',
    name: 'Standard Ease',
    description: 'W3C CSS standard ease curve',
    points: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 },
  },
  {
    id: 'snappy-entrance',
    name: 'Snappy Arrival',
    description: 'High initial velocity with gentle landing (Apple style)',
    points: { x1: 0.16, y1: 1.0, x2: 0.3, y2: 1.0 },
  },
  {
    id: 'overshoot',
    name: 'Anticipate & Overshoot',
    description: 'Subtle back-overshoot pop effect',
    points: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1.0 },
  },
  {
    id: 'material-standard',
    name: 'Material Decelerate',
    description: 'Material Design decelerated entrance curve',
    points: { x1: 0.0, y1: 0.0, x2: 0.2, y2: 1.0 },
  },
  {
    id: 'swift-exit',
    name: 'Swift Exit',
    description: 'Leaves viewport quickly without lingering',
    points: { x1: 0.4, y1: 0.0, x2: 1.0, y2: 1.0 },
  },
];

export function formatCubicBezier(p: BezierPoints): string {
  const r = (n: number) => Math.round(n * 100) / 100;
  return `cubic-bezier(${r(p.x1)}, ${r(p.y1)}, ${r(p.x2)}, ${r(p.y2)})`;
}

export function parseCubicBezier(str: string): BezierPoints | null {
  const match = str.match(/cubic-bezier\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/);
  if (!match) return null;
  return {
    x1: parseFloat(match[1]),
    y1: parseFloat(match[2]),
    x2: parseFloat(match[3]),
    y2: parseFloat(match[4]),
  };
}

/**
 * Evaluates a cubic bezier curve Y coordinate for a given X progress using Newton-Raphson iteration.
 */
export function evaluateCubicBezier(p: BezierPoints, xTarget: number): number {
  if (xTarget <= 0) return 0;
  if (xTarget >= 1) return 1;

  const { x1, y1, x2, y2 } = p;

  // Bézier curve polynomial coefficients:
  // B(t) = 3*(1-t)^2 * t * P1 + 3*(1-t) * t^2 * P2 + t^3
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  // Newton-Raphson iteration to find t for given xTarget
  let t = xTarget;
  for (let i = 0; i < 8; i++) {
    const currentX = sampleCurveX(t) - xTarget;
    if (Math.abs(currentX) < 1e-5) break;
    const dX = sampleCurveDerivativeX(t);
    if (Math.abs(dX) < 1e-5) break;
    t -= currentX / dX;
  }

  return sampleCurveY(Math.max(0, Math.min(1, t)));
}
