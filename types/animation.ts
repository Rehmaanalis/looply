export type EasingPreset = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier' | 'spring' | 'steps';

export type EditorMode = 'simple' | 'advanced';

export interface SpringConfig {
  mass: number; // standard: 1
  stiffness: number; // standard: 100
  damping: number; // standard: 10
  initialVelocity: number; // standard: 0
  overshootClamping?: boolean;
}

export interface ValueMapping {
  id: string;
  sourceProp: 'x' | 'y' | 'scaleX' | 'rotation';
  targetProp: 'opacity' | 'scaleY' | 'rotation' | 'scaleX';
  inputRange: [number, number];
  outputRange: [number, number];
  clamp: boolean;
}

export interface KeyframeProperties {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number; // degrees
  scaleX?: number;
  scaleY?: number;
  opacity?: number; // 0 to 1
}

export interface KeyframeRecord {
  id: string;
  time: number; // in seconds
  properties: KeyframeProperties;
  easing?: string; // e.g., 'cubic-bezier(0.25, 1, 0.5, 1)', 'spring', or 'ease'
  springConfig?: SpringConfig;
}

export interface LayerRecord {
  id: string;
  name: string;
  assetId: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  // Base properties
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  originX: number; // percentage (e.g. 50)
  originY: number; // percentage (e.g. 50)
  // Animation settings and timeline span
  startTime?: number; // Timeline in-point in seconds (default 0)
  endTime?: number; // Timeline out-point in seconds (default project duration)
  delay: number;
  duration: number; // layer animation duration
  easing: string; // default easing
  springConfig?: SpringConfig;
  fillMode: 'forwards' | 'backwards' | 'both' | 'none';
  iterationCount: 'infinite' | number;
  // Advanced features
  valueMappings?: ValueMapping[];
  // Keyframes
  keyframes: KeyframeRecord[];
}

export interface AssetRecord {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  dataUrl: string; // base64 or stored object URL
  blob?: Blob;
  size: number;
}

export interface ProjectSettings {
  width: number;
  height: number;
  background: string;
  duration: number; // in seconds
  fps: number;
  loop: boolean;
  direction: 'normal' | 'reverse' | 'alternate';
  playbackSpeed?: number; // 0.5, 1, 1.5, 2
  reducedMotion?: boolean;
}

export interface ProjectData {
  schemaVersion: number;
  id: string;
  name: string;
  settings: ProjectSettings;
  assets: Record<string, AssetRecord>;
  layers: LayerRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface InterpolatedLayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  originX: number;
  originY: number;
  visible: boolean;
}
