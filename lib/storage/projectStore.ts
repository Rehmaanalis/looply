import { ProjectData, AssetRecord } from '@/types/animation';
import { db, StoredProject, ProjectSnapshot, createDefaultSampleProject } from './db';

// In local storage, we ONLY store scalar, one-line values (like the active project ID).
// Heavy project definitions, layer metadata, and binary assets are kept purely in IndexedDB
// to eliminate quota exhaustion and performance bottlenecks.
const LOCAL_STORAGE_ACTIVE_KEY = 'looply_active_project_id';

/**
 * Clean up legacy bloated project backups and JSON metadata from localStorage
 * to ensure localStorage remains clean with zero risk of QuotaExceededError.
 */
export function cleanupLegacyLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('looply_active_project_backup');
    localStorage.removeItem('looply_active_project_meta');
  } catch (e) {
    // ignore
  }
}

// Immediately trigger cleanup on module evaluation in browser
if (typeof window !== 'undefined') {
  cleanupLegacyLocalStorage();
}

/**
 * Returns the active project ID (a simple, one-line string value from localStorage).
 */
export async function getActiveProjectId(): Promise<string> {
  if (typeof window === 'undefined') return 'demo-sample-project';
  try {
    return localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY) || 'demo-sample-project';
  } catch (e) {
    return 'demo-sample-project';
  }
}

/**
 * Sets the active project ID (storing only a single one-line string value in localStorage).
 */
export function setActiveProjectId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Strictly store a one-line string ID, never JSON
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, id);
  } catch (e) {
    console.warn('Could not set active project ID in localStorage:', e);
  }
}

/**
 * Primary save routine:
 * 1. Sets active project ID (one-line string) in localStorage.
 * 2. Persists full project and all metadata into high-capacity Dexie IndexedDB.
 * 3. Maintains rolling revision snapshots in IndexedDB.
 * 4. Ensures no JSON or project blobs touch localStorage.
 */
export async function saveProject(project: ProjectData): Promise<void> {
  if (typeof window === 'undefined') return;

  const updated: ProjectData = {
    ...project,
    updatedAt: new Date().toISOString(),
  };

  // 1. Store only the one-line project ID in localStorage
  setActiveProjectId(updated.id);

  // Proactively ensure legacy localStorage keys stay purged
  cleanupLegacyLocalStorage();

  // 2. Primary Persistence: Dexie IndexedDB
  if (db) {
    try {
      const serialized = JSON.stringify(updated);
      const sizeBytes = new Blob([serialized]).size;

      await db.projects.put({
        id: updated.id,
        name: updated.name,
        updatedAt: updated.updatedAt,
        createdAt: updated.createdAt,
        data: updated,
        sizeBytes,
      });

      // Maintain up to 5 rolling snapshots in IndexedDB
      await recordSnapshot(updated, sizeBytes);
    } catch (err: any) {
      console.error('Dexie IndexedDB save error:', err);
      if (err.name === 'QuotaExceededError' || err.message?.includes('quota')) {
        throw new Error('Browser storage quota exceeded. Please export a JSON backup and delete unused projects.');
      }
      throw err;
    }
  }
}

/**
 * Snapshot management in IndexedDB for undo/recovery across sessions
 */
async function recordSnapshot(project: ProjectData, sizeBytes: number): Promise<void> {
  if (!db) return;
  try {
    const snapId = `snap-${project.id}-${Date.now()}`;
    await db.snapshots.put({
      id: snapId,
      projectId: project.id,
      timestamp: new Date().toISOString(),
      name: project.name,
      size: sizeBytes,
      data: project,
    });

    // Prune older snapshots beyond 5 for this project in IndexedDB
    const snapshots = await db.snapshots.where('projectId').equals(project.id).sortBy('timestamp');
    if (snapshots.length > 5) {
      const toDelete = snapshots.slice(0, snapshots.length - 5);
      await Promise.all(toDelete.map((s) => db!.snapshots.delete(s.id)));
    }
  } catch (err) {
    // Non-fatal
  }
}

/**
 * Loads project directly from IndexedDB (Dexie).
 */
export async function loadProject(id: string): Promise<ProjectData | null> {
  if (typeof window === 'undefined') return null;

  if (db) {
    try {
      const record = await db.projects.get(id);
      if (record && record.data) {
        return record.data;
      }
    } catch (e) {
      console.warn('Dexie get failed:', e);
    }
  }

  return null;
}

export async function listAllProjects(): Promise<StoredProject[]> {
  if (typeof window === 'undefined' || !db) return [];

  try {
    const all = await db.projects.orderBy('updatedAt').reverse().toArray();
    if (all.length === 0) {
      // Seed default project
      const def = createDefaultSampleProject();
      const defSerialized = JSON.stringify(def);
      const stored: StoredProject = {
        id: def.id,
        name: def.name,
        updatedAt: def.updatedAt,
        createdAt: def.createdAt,
        data: def,
        sizeBytes: new Blob([defSerialized]).size,
      };
      await db.projects.put(stored);
      return [stored];
    }
    return all;
  } catch (err) {
    console.warn('Failed to list projects from Dexie:', err);
    return [];
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (typeof window === 'undefined' || !db) return;
  await db.projects.delete(id);
  // Also clean associated snapshots from IndexedDB
  try {
    const snaps = await db.snapshots.where('projectId').equals(id).toArray();
    await Promise.all(snaps.map((s) => db!.snapshots.delete(s.id)));
  } catch (e) {
    // ignore
  }
}

export async function duplicateProject(id: string): Promise<ProjectData | null> {
  const source = await loadProject(id);
  if (!source) return null;

  const newId = `project-${Date.now()}`;
  const now = new Date().toISOString();
  const duplicate: ProjectData = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  await saveProject(duplicate);
  return duplicate;
}

/**
 * Format project into exportable JSON string.
 */
export function exportProjectJson(project: ProjectData, minified: boolean = false): string {
  return minified ? JSON.stringify(project) : JSON.stringify(project, null, 2);
}

/**
 * Imports and validates a single project JSON string.
 */
export function importProjectJson(jsonStr: string): ProjectData {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.layers || !parsed.settings || !parsed.name) {
    throw new Error('Invalid Looply project JSON: missing required layers, settings, or name.');
  }
  const now = new Date().toISOString();
  return {
    ...parsed,
    schemaVersion: parsed.schemaVersion || 1,
    id: `project-${Date.now()}`,
    name: `${parsed.name} (Imported)`,
    assets: parsed.assets || {},
    layers: parsed.layers || [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Bundle format for archiving all local projects into one master backup file
 */
export interface LooplyBackupBundle {
  appName: 'Looply';
  version: number;
  exportedAt: string;
  projectsCount: number;
  projects: ProjectData[];
}

/**
 * Exports all projects stored in IndexedDB into a single JSON backup bundle string.
 */
export async function exportAllProjectsBundle(): Promise<string> {
  const stored = await listAllProjects();
  const projects = stored.map((s) => s.data);
  const bundle: LooplyBackupBundle = {
    appName: 'Looply',
    version: 1,
    exportedAt: new Date().toISOString(),
    projectsCount: projects.length,
    projects,
  };
  return JSON.stringify(bundle, null, 2);
}

/**
 * Imports a bundle of projects or a single project.
 */
export async function importProjectsBundle(jsonStr: string): Promise<{ importedCount: number; errors: string[] }> {
  const parsed = JSON.parse(jsonStr);
  const errors: string[] = [];
  let importedCount = 0;

  // Case 1: Multi-project bundle
  if (parsed.appName === 'Looply' && Array.isArray(parsed.projects)) {
    for (const proj of parsed.projects) {
      try {
        const imported = importProjectJson(JSON.stringify(proj));
        await saveProject(imported);
        importedCount++;
      } catch (err: any) {
        errors.push(`Failed to import ${proj.name || 'unnamed'}: ${err.message}`);
      }
    }
    return { importedCount, errors };
  }

  // Case 2: Single project JSON
  try {
    const single = importProjectJson(jsonStr);
    await saveProject(single);
    importedCount = 1;
  } catch (err: any) {
    errors.push(err.message || 'Invalid JSON format');
  }

  return { importedCount, errors };
}

/**
 * Storage diagnostics and quota estimation
 */
export interface StorageDiagnostics {
  usedBytes: number;
  quotaBytes: number;
  percentUsed: number;
  formattedUsed: string;
  formattedQuota: string;
  persisted: boolean;
  projectCount: number;
  assetCount: number;
  totalAssetBytes: number;
  warning: string | null;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export async function getStorageDiagnostics(): Promise<StorageDiagnostics> {
  let usedBytes = 0;
  let quotaBytes = 0;
  let percentUsed = 0;
  let persisted = false;

  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      usedBytes = estimate.usage || 0;
      quotaBytes = estimate.quota || 0;
      percentUsed = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;
      if (navigator.storage.persisted) {
        persisted = await navigator.storage.persisted();
      }
    } catch (e) {
      // estimate error fallback
    }
  }

  const projects = await listAllProjects();
  let assetCount = 0;
  let totalAssetBytes = 0;

  for (const p of projects) {
    const assets = p.data?.assets || {};
    for (const a of Object.values(assets)) {
      assetCount++;
      totalAssetBytes += a.size || (a.dataUrl ? a.dataUrl.length : 0);
    }
  }

  let warning: string | null = null;
  if (percentUsed > 85) {
    warning = 'Browser storage is nearly full (over 85%). Please export JSON backups and remove older projects.';
  }

  return {
    usedBytes,
    quotaBytes,
    percentUsed: Math.min(100, Math.round(percentUsed * 100) / 100),
    formattedUsed: formatBytes(usedBytes),
    formattedQuota: formatBytes(quotaBytes),
    persisted,
    projectCount: projects.length,
    assetCount,
    totalAssetBytes,
    warning,
  };
}

/**
 * Requests browser persistent storage so browser eviction under disk pressure won't delete data
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch (e) {
      return false;
    }
  }
  return false;
}
