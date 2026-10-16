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
  
  // Official Looply App Icon SVG (Base64-encoded to prevent broken HTML attributes)
  const appIconSvg =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDAgMTQwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImFwcEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzhiNWNmNiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzEwYjk4MSIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJyYXlHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjYTViNGZjIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNmVlN2I3Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjEyNCIgaGVpZ2h0PSIxMjQiIHJ4PSIzNCIgZmlsbD0idXJsKCNhcHBHcmFkKSIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjExNiIgaGVpZ2h0PSIxMTYiIHJ4PSIzMCIgZmlsbD0iIzBjMGUxOCIgc3Ryb2tlPSIjODE4Y2Y4IiBzdHJva2Utb3BhY2l0eT0iMC4zNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMzQiIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjxwYXRoIGQ9Ik03MCAyMnYxNk03MCAxMDJ2MTZNMzYgMzZsMTEuMyAxMS4zTTkyLjcgOTIuN2wxMS4zIDExLjNNMjIgNzBoMTZNMTAyIDcwaDE2TTM2IDEwNGwxMS4zLTExLjNNOTIuNyA0Ny4zbDExLjMtMTEuMyIgc3Ryb2tlPSJ1cmwoI3JheUdyYWQpIiBzdHJva2Utd2lkdGg9IjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjcwIiBjeT0iNzAiIHI9IjE0IiBmaWxsPSIjNjM2NmYxIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iNiIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==';

  // Sparkle Star SVG
  const starSvg =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjUwLDUgNjQsMzYgOTgsMzYgNzAsNTcgODEsOTEgNTAsNzAgMTksOTEgMzAsNTcgMiwzNiAzNiwzNiIgZmlsbD0iI2Y1OWUwYiIvPjwvc3ZnPg==';

  // Looply Studio Badge SVG
  const badgeSvg =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgNDQiIGZpbGw9Im5vbmUiPjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIxNTYiIGhlaWdodD0iNDAiIHJ4PSIyMCIgZmlsbD0iIzEzMTYyNSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIyNCIgY3k9IjIyIiByPSI1IiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iMzgiIHk9IjI3IiBmaWxsPSIjZmZmZmZmIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjcwMCIgZm9udC1zaXplPSIxMiIgbGV0dGVyLXNwYWNpbmc9IjEuNSI+TE9PUExZIFNUVURJTzwvdGV4dD48L3N2Zz4=';

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
