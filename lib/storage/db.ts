import Dexie, { Table } from 'dexie';
import { ProjectData } from '@/types/animation';

export interface StoredProject {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  data: ProjectData;
  sizeBytes?: number;
}

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  timestamp: string;
  name: string;
  size: number;
  data: ProjectData;
}

export class LooplyDatabase extends Dexie {
  projects!: Table<StoredProject, string>;
  snapshots!: Table<ProjectSnapshot, string>;

  constructor() {
    super('LooplyStudioDB');
    this.version(1).stores({
      projects: 'id, name, updatedAt, createdAt',
    });
    this.version(2).stores({
      projects: 'id, name, updatedAt, createdAt',
      snapshots: 'id, projectId, timestamp',
    });
  }
}

export const db = typeof window !== 'undefined' ? new LooplyDatabase() : null;

// Built-in initial sample project featuring the official Looply App Icon animation (no loader ring)
export function createDefaultSampleProject(): ProjectData {
  const now = new Date().toISOString();
  
  // Official Looply App Icon SVG
  const appIconSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none"><defs><linearGradient id="appGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366f1"/><stop offset="50%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%2310b981"/></linearGradient><linearGradient id="rayGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23a5b4fc"/><stop offset="100%" stop-color="%236ee7b7"/></linearGradient></defs><rect x="8" y="8" width="124" height="124" rx="34" fill="url(%23appGrad)"/><rect x="12" y="12" width="116" height="116" rx="30" fill="%230c0e18" stroke="%23818cf8" stroke-opacity="0.35" stroke-width="2"/><circle cx="70" cy="70" r="34" fill="%236366f1" fill-opacity="0.15"/><path d="M70 22v16M70 102v16M36 36l11.3 11.3M92.7 92.7l11.3 11.3M22 70h16M102 70h16M36 104l11.3-11.3M92.7 47.3l11.3-11.3" stroke="url(%23rayGrad)" stroke-width="7" stroke-linecap="round"/><circle cx="70" cy="70" r="14" fill="%236366f1"/><circle cx="70" cy="70" r="6" fill="%23ffffff"/></svg>`;
  
  // Sparkle Star SVG
  const starSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="%23f59e0b"/></svg>`;
  
  // Looply Studio Badge SVG
  const badgeSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44" fill="none"><rect x="2" y="2" width="156" height="40" rx="20" fill="%23131625" stroke="%236366f1" stroke-width="2"/><circle cx="24" cy="22" r="5" fill="%2310b981"/><text x="38" y="27" fill="%23ffffff" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="12" letter-spacing="1.5">LOOPLY STUDIO</text></svg>`;

  return {
    schemaVersion: 1,
    id: 'demo-sample-project',
    name: 'Looply App Icon Motion',
    settings: {
      width: 640,
      height: 400,
      background: '#0d1117',
      duration: 3.0,
      fps: 60,
      loop: true,
      direction: 'normal',
    },
    assets: {
      'asset-app-icon': {
        id: 'asset-app-icon',
        name: 'Looply App Icon',
        type: 'image/svg+xml',
        width: 140,
        height: 140,
        dataUrl: appIconSvg,
        size: 780,
      },
      'asset-star': {
        id: 'asset-star',
        name: 'Sparkle Star',
        type: 'image/svg+xml',
        width: 56,
        height: 56,
        dataUrl: starSvg,
        size: 380,
      },
      'asset-badge': {
        id: 'asset-badge',
        name: 'Studio Badge',
        type: 'image/svg+xml',
        width: 160,
        height: 44,
        dataUrl: badgeSvg,
        size: 460,
      },
    },
    layers: [
      {
        id: 'layer-app-icon',
        name: 'Looply App Icon',
        assetId: 'asset-app-icon',
        visible: true,
        locked: false,
        zIndex: 2,
        x: 250,
        y: 110,
        width: 140,
        height: 140,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        originX: 50,
        originY: 50,
        delay: 0,
        duration: 3.0,
        easing: 'ease-in-out',
        fillMode: 'forwards',
        iterationCount: 'infinite',
        keyframes: [
          { id: 'kf-icon-1', time: 0, properties: { y: 110, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1 } },
          { id: 'kf-icon-2', time: 0.75, properties: { y: 96, scaleX: 1.06, scaleY: 1.06, rotation: 3, opacity: 1 } },
          { id: 'kf-icon-3', time: 1.5, properties: { y: 104, scaleX: 1.01, scaleY: 1.01, rotation: 0, opacity: 1 } },
          { id: 'kf-icon-4', time: 2.25, properties: { y: 120, scaleX: 0.96, scaleY: 0.96, rotation: -3, opacity: 1 } },
          { id: 'kf-icon-5', time: 3.0, properties: { y: 110, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1 } },
        ],
      },
      {
        id: 'layer-star',
        name: 'Sparkle Star',
        assetId: 'asset-star',
        visible: true,
        locked: false,
        zIndex: 3,
        x: 375,
        y: 80,
        width: 52,
        height: 52,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 0.95,
        originX: 50,
        originY: 50,
        delay: 0,
        duration: 3.0,
        easing: 'ease-in-out',
        fillMode: 'forwards',
        iterationCount: 'infinite',
        keyframes: [
          { id: 'kf-star-1', time: 0, properties: { rotation: 0, scaleX: 0.8, scaleY: 0.8, opacity: 0.7 } },
          { id: 'kf-star-2', time: 1.5, properties: { rotation: 180, scaleX: 1.25, scaleY: 1.25, opacity: 1 } },
          { id: 'kf-star-3', time: 3.0, properties: { rotation: 360, scaleX: 0.8, scaleY: 0.8, opacity: 0.7 } },
        ],
      },
      {
        id: 'layer-badge',
        name: 'Studio Badge',
        assetId: 'asset-badge',
        visible: true,
        locked: false,
        zIndex: 1,
        x: 240,
        y: 275,
        width: 160,
        height: 44,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 0.9,
        originX: 50,
        originY: 50,
        delay: 0,
        duration: 3.0,
        easing: 'ease-in-out',
        fillMode: 'forwards',
        iterationCount: 'infinite',
        keyframes: [
          { id: 'kf-badge-1', time: 0, properties: { y: 275, scaleX: 1.0, scaleY: 1.0, opacity: 0.9 } },
          { id: 'kf-badge-2', time: 1.5, properties: { y: 268, scaleX: 1.03, scaleY: 1.03, opacity: 1 } },
          { id: 'kf-badge-3', time: 3.0, properties: { y: 275, scaleX: 1.0, scaleY: 1.0, opacity: 0.9 } },
        ],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
