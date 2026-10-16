/**
 * Reanimated Formatter
 * Formats generated animation code, comments, imports, and integration references.
 */

import { ReanimatedLanguage } from './types';

export function formatCodeBlock(lines: (string | null | undefined)[]): string {
  return lines.filter((l) => l !== null && l !== undefined).join('\n');
}

export function generateHeaderBanner(
  projectName: string,
  durationSec: number,
  layerCount: number,
  outputMode: string,
  language: ReanimatedLanguage
): string {
  return [
    `// ============================================================================`,
    `// Looply Studio — React Native Reanimated Animation Export`,
    `// Project: ${projectName}`,
    `// Master Timeline: ${durationSec}s | Layers: ${layerCount}`,
    `// Core Principle: Master-timeline synchronized with 100% HTML/CSS animation parity.`,
    `// ============================================================================`,
  ].join('\n');
}

export function generateImportStatement(neededImports: string[]): string {
  const uniqueImports = Array.from(new Set(neededImports)).sort();
  return `import {\n  ${uniqueImports.join(',\n  ')}\n} from 'react-native-reanimated';`;
}
