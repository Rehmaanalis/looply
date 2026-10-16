/**
 * Looply - React Native Reanimated Export Types
 * Phase 4: Production-Ready React Native Reanimated Animation Export
 */

export type ReanimatedOutputMode = 'expressions' | 'sequence' | 'interpolation';

export type ReanimatedLanguage = 'typescript' | 'javascript';

export type ReanimatedExportTarget = 'component' | 'hook' | 'logic';

export type DiagnosticSeverity = 'supported' | 'approximate' | 'unsupported';

export interface ReanimatedDiagnostic {
  severity: DiagnosticSeverity;
  layerId?: string;
  layerName?: string;
  property?: string;
  title: string;
  message: string;
  suggestion?: string;
}

export interface ReanimatedCompatibilityReport {
  supported: ReanimatedDiagnostic[];
  approximate: ReanimatedDiagnostic[];
  unsupported: ReanimatedDiagnostic[];
  overallStatus: 'ready' | 'has_warnings' | 'has_errors';
}

export interface SharedValueRequirement {
  name: string;
  type: string;
  initialValue: number | string;
  layerName: string;
  property: string;
  description: string;
}

export interface AnimatedStyleRequirement {
  name: string;
  layerName: string;
  properties: {
    key: string;
    valueExpression: string;
    isTransform?: boolean;
    transformKey?: string;
  }[];
}

export interface ReanimatedExportOptions {
  outputMode: ReanimatedOutputMode;
  language: ReanimatedLanguage;
  exportTarget: ReanimatedExportTarget;
  includeComments: boolean;
  includeIntegrationGuide: boolean;
  targetReanimatedVersion: '3.x';
  masterTimelineSync?: boolean;
}

export interface ReanimatedExportResult {
  code: string;
  filename: string;
  target: ReanimatedExportTarget;
  report: ReanimatedCompatibilityReport;
  sharedValues: SharedValueRequirement[];
  animatedStyles: AnimatedStyleRequirement[];
  imports: string[];
}

