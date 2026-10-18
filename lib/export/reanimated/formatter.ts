/**
 * Reanimated Formatter
 * Formats generated animation code, comments, imports, and integration references.
 */

export function formatCodeBlock(lines: (string | null | undefined)[]): string {
  return lines.filter((l) => l !== null && l !== undefined).join('\n');
}

export function generateHeaderBanner(
  projectName: string,
  durationSec: number,
  layerCount: number
): string {
  return [
    `// ============================================================================`,
    `// Looply Studio — React Native Reanimated Animation Export (Latest v4.x)`,
    `// Project: ${projectName}`,
    `// Target: React Native Reanimated 4.x (Latest, New Architecture / Fabric)`,
    `// Install: npm install react-native-reanimated react-native-worklets (or npx expo install react-native-reanimated)`,
    `// Docs: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/`,
    `// Master Timeline: ${durationSec}s | Layers: ${layerCount}`,
    `// Core Principle: Master-timeline synchronized with 100% HTML/CSS animation parity.`,
    `// ============================================================================`,
  ].join('\n');
}

export function generateImportStatement(neededImports: string[]): string {
  const uniqueImports = Array.from(new Set(neededImports)).sort();
  return `import {\n  ${uniqueImports.join(',\n  ')}\n} from 'react-native-reanimated';`;
}
