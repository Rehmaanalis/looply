/**
 * Reanimated Code Generator
 * Canonical engine that orchestrates property mapping, timing, compilation, and formatting.
 * Generates drop-in React Native components, custom hooks, or raw animation logic
 * synchronized to the master timeline with 100% parity to HTML/CSS animations.
 */

import { ProjectData } from '@/types/animation';
import {
  ReanimatedExportOptions,
  ReanimatedExportResult,
  SharedValueRequirement,
  AnimatedStyleRequirement,
} from './types';
import { analyzeReanimatedCompatibility } from './compatibility';
import { compileProjectToReanimated } from './keyframeCompiler';
import { sanitizeIdentifier } from './propertyMapper';
import {
  generateHeaderBanner,
  generateImportStatement,
  formatCodeBlock,
} from './formatter';
import { secondsToMs } from './timingMapper';

export const DEFAULT_REANIMATED_OPTIONS: ReanimatedExportOptions = {
  outputMode: 'sequence',
  language: 'typescript',
  exportTarget: 'component',
  includeComments: true,
  includeIntegrationGuide: false,
  targetReanimatedVersion: '4.x',
  masterTimelineSync: true,
};

export function generateReanimatedExport(
  project: ProjectData,
  userOptions?: Partial<ReanimatedExportOptions>
): ReanimatedExportResult {
  const options: ReanimatedExportOptions = {
    ...DEFAULT_REANIMATED_OPTIONS,
    ...userOptions,
  };

  const { name, settings } = project;
  const durationSec = Math.max(0.1, settings.duration || 3);
  const durationMs = secondsToMs(durationSec);
  const isLoop = settings.loop;
  const isReverse = settings.direction === 'alternate';
  const stageWidth = settings.width || 600;
  const stageHeight = settings.height || 400;
  const stageBg = settings.background || '#0f1117';

  const rawComponentName = sanitizeIdentifier(name) || 'LooplyAnimation';
  const componentName = rawComponentName.charAt(0).toUpperCase() + rawComponentName.slice(1);

  const report = analyzeReanimatedCompatibility(project);
  const compiledLayers = compileProjectToReanimated(project, options);

  // Gather Reanimated imports dynamically
  const reanimatedImports = new Set<string>();
  reanimatedImports.add('useSharedValue');
  reanimatedImports.add('useAnimatedStyle');

  if (options.outputMode === 'interpolation') {
    reanimatedImports.add('withTiming');
    reanimatedImports.add('Easing');
    reanimatedImports.add('interpolate');
    reanimatedImports.add('Extrapolation');
    if (isLoop) reanimatedImports.add('withRepeat');
  } else {
    let hasTiming = false;
    let hasSpring = false;
    let hasDelay = false;
    let hasSequence = false;
    let hasRepeat = isLoop;
    let hasEasing = false;

    compiledLayers.forEach((layer) => {
      layer.tracks.forEach((t) => {
        if (t.animationExpression.includes('withTiming')) hasTiming = true;
        if (t.animationExpression.includes('withSpring')) hasSpring = true;
        if (t.animationExpression.includes('withDelay')) hasDelay = true;
        if (t.animationExpression.includes('withSequence')) hasSequence = true;
        if (t.animationExpression.includes('withRepeat')) hasRepeat = true;
        if (t.animationExpression.includes('Easing.')) hasEasing = true;
      });
    });

    if (hasTiming) reanimatedImports.add('withTiming');
    if (hasSpring) reanimatedImports.add('withSpring');
    if (hasDelay) reanimatedImports.add('withDelay');
    if (hasSequence) reanimatedImports.add('withSequence');
    if (hasRepeat) reanimatedImports.add('withRepeat');
    if (hasEasing) reanimatedImports.add('Easing');
  }

  const allSharedValues: SharedValueRequirement[] = [];
  const allAnimatedStyles: AnimatedStyleRequirement[] = [];

  compiledLayers.forEach((l) => {
    allSharedValues.push(...l.sharedValueRequirements);
    allAnimatedStyles.push(l.styleRequirement);
  });

  const lines: string[] = [];

  // 1. Header Banner
  lines.push(
    generateHeaderBanner(
      name,
      durationSec,
      project.layers.length
    )
  );
  lines.push('');

  // 2. React & React Native Imports
  if (options.exportTarget === 'component') {
    lines.push("import React, { useEffect } from 'react';");
    lines.push("import { View, StyleSheet, Image } from 'react-native';");
    lines.push(
      `import Animated, {\n  ${Array.from(reanimatedImports).sort().join(',\n  ')},\n} from 'react-native-reanimated';`
    );
  } else if (options.exportTarget === 'hook') {
    lines.push("import { useEffect } from 'react';");
    lines.push(
      `import {\n  ${Array.from(reanimatedImports).sort().join(',\n  ')},\n} from 'react-native-reanimated';`
    );
  } else {
    // Logic only
    lines.push(generateImportStatement(Array.from(reanimatedImports)));
  }
  lines.push('');

  // 3. Asset Data Table (Embeds artwork & SVG data to eliminate missing image issues)
  const hasAssets = Object.keys(project.assets || {}).length > 0;
  if (hasAssets && options.exportTarget === 'component') {
    lines.push('// ----------------------------------------------------------------------------');
    lines.push('// Embedded Layer Artwork & Assets (SVGs & Images)');
    lines.push('// ----------------------------------------------------------------------------');
    lines.push(`const ASSETS${options.language === 'typescript' ? ': Record<string, string>' : ''} = {`);
    compiledLayers.forEach((layer) => {
      const asset = project.assets[layer.layer.assetId];
      const dataUrl = asset?.dataUrl || '';
      lines.push(`  ${layer.varPrefix}: '${dataUrl.replace(/'/g, "\\'")}',`);
    });
    lines.push('};');
    lines.push('');
  }

  // Helper indentation function
  const indent = (count: number) => '  '.repeat(count);

  // 4. Output Body Generation
  if (options.exportTarget === 'component') {
    // Full Drop-in Component
    lines.push('// ----------------------------------------------------------------------------');
    lines.push(`// Drop-in Animation Component: <${componentName} />`);
    lines.push('// ----------------------------------------------------------------------------');
    lines.push(`export default function ${componentName}() {`);

    // Shared Values inside component body (Prevents hook violations at module scope!)
    if (options.outputMode === 'interpolation') {
      lines.push(`${indent(1)}// Master Timeline Progress (Single Synchronized Clock)`);
      lines.push(`${indent(1)}const progress = useSharedValue(0);`);
    } else {
      lines.push(`${indent(1)}// Synchronized Property Shared Values`);
      if (allSharedValues.length === 0) {
        lines.push(`${indent(1)}// (All layers static)`);
      } else {
        allSharedValues.forEach((sv) => {
          lines.push(`${indent(1)}const ${sv.name} = useSharedValue(${sv.initialValue});`);
        });
      }
    }
    lines.push('');

    // Trigger Playback
    lines.push(`${indent(1)}// Playback Controls`);
    lines.push(`${indent(1)}const startAnimation = () => {`);
    if (options.outputMode === 'interpolation') {
      lines.push(`${indent(2)}progress.value = 0;`);
      if (isLoop) {
        lines.push(
          `${indent(2)}progress.value = withRepeat(\n${indent(3)}withTiming(1, { duration: ${durationMs}, easing: Easing.linear }),\n${indent(3)}-1,\n${indent(3)}${isReverse ? 'true' : 'false'}\n${indent(2)});`
        );
      } else {
        lines.push(
          `${indent(2)}progress.value = withTiming(1, { duration: ${durationMs}, easing: Easing.linear });`
        );
      }
    } else {
      compiledLayers.forEach((layer) => {
        if (layer.tracks.length > 0) {
          lines.push(`${indent(2)}// Layer: ${layer.layer.name}`);
          layer.tracks.forEach((track) => {
            lines.push(`${indent(2)}${track.sharedVarName}.value = ${track.animationExpression};`);
          });
        }
      });
    }
    lines.push(`${indent(1)}};`);
    lines.push('');

    lines.push(`${indent(1)}const resetAnimation = () => {`);
    if (options.outputMode === 'interpolation') {
      lines.push(`${indent(2)}progress.value = 0;`);
    } else {
      allSharedValues.forEach((sv) => {
        lines.push(`${indent(2)}${sv.name}.value = ${sv.initialValue};`);
      });
    }
    lines.push(`${indent(1)}};`);
    lines.push('');

    // Animated Style Hooks
    lines.push(`${indent(1)}// Layer Animated Styles`);
    compiledLayers.forEach((layer) => {
      lines.push(`${indent(1)}const ${layer.styleRequirement.name} = useAnimatedStyle(() => {`);
      const transformProps = layer.styleRequirement.properties.filter((p) => p.isTransform);
      const otherProps = layer.styleRequirement.properties.filter((p) => !p.isTransform);

      lines.push(`${indent(2)}return {`);
      if (transformProps.length > 0) {
        lines.push(`${indent(3)}transform: [`);
        transformProps.forEach((tp) => {
          lines.push(`${indent(4)}${tp.valueExpression},`);
        });
        lines.push(`${indent(3)}],`);
      }
      otherProps.forEach((op) => {
        lines.push(`${indent(3)}${op.key}: ${op.valueExpression},`);
      });
      lines.push(`${indent(2)}};`);
      lines.push(`${indent(1)}});`);
      lines.push('');
    });

    // Auto-trigger on mount
    lines.push(`${indent(1)}useEffect(() => {`);
    lines.push(`${indent(2)}startAnimation();`);
    lines.push(`${indent(2)}return () => resetAnimation();`);
    lines.push(`${indent(1)}}, []);`);
    lines.push('');

    // Render JSX Stage & Animated Layers (Sorted by zIndex to preserve exact visual stacking order)
    const sortedLayers = [...compiledLayers].sort(
      (a, b) => (a.layer.zIndex || 0) - (b.layer.zIndex || 0)
    );

    lines.push(`${indent(1)}return (`);
    lines.push(`${indent(2)}<View style={styles.stage}>`);
    sortedLayers.forEach((layer) => {
      const asset = project.assets[layer.layer.assetId];
      const isSvg = asset?.type?.includes('svg') || asset?.dataUrl?.includes('data:image/svg+xml');
      lines.push(`${indent(3)}{/* Layer: ${layer.layer.name} ${isSvg ? '(SVG Artwork)' : ''} */}`);
      lines.push(
        `${indent(3)}<Animated.View style={[styles.layer, { width: ${layer.layer.width}, height: ${layer.layer.height}, zIndex: ${layer.layer.zIndex} }, ${layer.styleRequirement.name}]}>`
      );
      if (hasAssets && asset) {
        lines.push(
          `${indent(4)}<Image\n${indent(5)}source={{ uri: ASSETS.${layer.varPrefix} }}\n${indent(5)}style={styles.image}\n${indent(5)}resizeMode="contain"\n${indent(4)}/>`
        );
      }
      lines.push(`${indent(3)}</Animated.View>`);
    });
    lines.push(`${indent(2)}</View>`);
    lines.push(`${indent(1)});`);
    lines.push('}');
    lines.push('');

    // StyleSheet
    lines.push('const styles = StyleSheet.create({');
    lines.push('  stage: {');
    lines.push(`    width: ${stageWidth},`);
    lines.push(`    height: ${stageHeight},`);
    lines.push(`    backgroundColor: '${stageBg}',`);
    lines.push("    position: 'relative',");
    lines.push("    overflow: 'hidden',");
    lines.push('  },');
    lines.push('  layer: {');
    lines.push("    position: 'absolute',");
    lines.push('    top: 0,');
    lines.push('    left: 0,');
    lines.push('  },');
    lines.push('  image: {');
    lines.push("    width: '100%',");
    lines.push("    height: '100%',");
    lines.push('  },');
    lines.push('});');
  } else if (options.exportTarget === 'hook') {
    // Custom Hook
    lines.push('// ----------------------------------------------------------------------------');
    lines.push(`// Custom Hook: use${componentName}()`);
    lines.push('// ----------------------------------------------------------------------------');
    lines.push(`export function use${componentName}() {`);

    if (options.outputMode === 'interpolation') {
      lines.push(`${indent(1)}const progress = useSharedValue(0);`);
    } else {
      allSharedValues.forEach((sv) => {
        lines.push(`${indent(1)}const ${sv.name} = useSharedValue(${sv.initialValue});`);
      });
    }
    lines.push('');

    lines.push(`${indent(1)}const startAnimation = () => {`);
    if (options.outputMode === 'interpolation') {
      lines.push(`${indent(2)}progress.value = 0;`);
      if (isLoop) {
        lines.push(
          `${indent(2)}progress.value = withRepeat(\n${indent(3)}withTiming(1, { duration: ${durationMs}, easing: Easing.linear }),\n${indent(3)}-1,\n${indent(3)}${isReverse ? 'true' : 'false'}\n${indent(2)});`
        );
      } else {
        lines.push(
          `${indent(2)}progress.value = withTiming(1, { duration: ${durationMs}, easing: Easing.linear });`
        );
      }
    } else {
      compiledLayers.forEach((layer) => {
        if (layer.tracks.length > 0) {
          lines.push(`${indent(2)}// Layer: ${layer.layer.name}`);
          layer.tracks.forEach((track) => {
            lines.push(`${indent(2)}${track.sharedVarName}.value = ${track.animationExpression};`);
          });
        }
      });
    }
    lines.push(`${indent(1)}};`);
    lines.push('');

    lines.push(`${indent(1)}const resetAnimation = () => {`);
    if (options.outputMode === 'interpolation') {
      lines.push(`${indent(2)}progress.value = 0;`);
    } else {
      allSharedValues.forEach((sv) => {
        lines.push(`${indent(2)}${sv.name}.value = ${sv.initialValue};`);
      });
    }
    lines.push(`${indent(1)}};`);
    lines.push('');

    compiledLayers.forEach((layer) => {
      lines.push(`${indent(1)}const ${layer.styleRequirement.name} = useAnimatedStyle(() => {`);
      const transformProps = layer.styleRequirement.properties.filter((p) => p.isTransform);
      const otherProps = layer.styleRequirement.properties.filter((p) => !p.isTransform);

      lines.push(`${indent(2)}return {`);
      if (transformProps.length > 0) {
        lines.push(`${indent(3)}transform: [`);
        transformProps.forEach((tp) => {
          lines.push(`${indent(4)}${tp.valueExpression},`);
        });
        lines.push(`${indent(3)}],`);
      }
      otherProps.forEach((op) => {
        lines.push(`${indent(3)}${op.key}: ${op.valueExpression},`);
      });
      lines.push(`${indent(2)}};`);
      lines.push(`${indent(1)}});`);
      lines.push('');
    });

    lines.push(`${indent(1)}return {`);
    lines.push(`${indent(2)}startAnimation,`);
    lines.push(`${indent(2)}resetAnimation,`);
    lines.push(`${indent(2)}styles: {`);
    compiledLayers.forEach((layer) => {
      lines.push(`${indent(3)}${layer.varPrefix}: ${layer.styleRequirement.name},`);
    });
    lines.push(`${indent(2)}},`);
    lines.push(`${indent(1)}};`);
    lines.push('}');
  } else {
    // Logic Only (Raw hooks for pasting inside existing component body)
    lines.push('// ----------------------------------------------------------------------------');
    lines.push('// React Native Reanimated Animation Logic');
    lines.push('// IMPORTANT: Place these declarations inside your React component or hook body.');
    lines.push('// ----------------------------------------------------------------------------');
    lines.push('');

    if (options.outputMode === 'interpolation') {
      lines.push('// 1. Master Progress Shared Value');
      lines.push('const progress = useSharedValue(0);');
      lines.push('');
      lines.push('const startAnimation = () => {');
      lines.push('  progress.value = 0;');
      if (isLoop) {
        lines.push(
          `  progress.value = withRepeat(\n    withTiming(1, { duration: ${durationMs}, easing: Easing.linear }),\n    -1,\n    ${isReverse ? 'true' : 'false'}\n  );`
        );
      } else {
        lines.push(`  progress.value = withTiming(1, { duration: ${durationMs}, easing: Easing.linear });`);
      }
      lines.push('};');
      lines.push('');
      lines.push('const resetAnimation = () => {');
      lines.push('  progress.value = 0;');
      lines.push('};');
    } else {
      lines.push('// 1. Shared Values');
      allSharedValues.forEach((sv) => {
        lines.push(
          `const ${sv.name} = useSharedValue(${sv.initialValue}); // ${sv.description}`
        );
      });
      lines.push('');
      lines.push('// 2. Playback Controller');
      lines.push('const startAnimation = () => {');
      compiledLayers.forEach((layer) => {
        if (layer.tracks.length > 0) {
          lines.push(`  // Layer: ${layer.layer.name}`);
          layer.tracks.forEach((track) => {
            lines.push(`  ${track.sharedVarName}.value = ${track.animationExpression};`);
          });
        }
      });
      lines.push('};');
      lines.push('');
      lines.push('const resetAnimation = () => {');
      allSharedValues.forEach((sv) => {
        lines.push(`  ${sv.name}.value = ${sv.initialValue};`);
      });
      lines.push('};');
    }
    lines.push('');

    lines.push('// 3. Animated Style Mappings');
    compiledLayers.forEach((layer) => {
      lines.push(`const ${layer.styleRequirement.name} = useAnimatedStyle(() => {`);
      const transformProps = layer.styleRequirement.properties.filter((p) => p.isTransform);
      const otherProps = layer.styleRequirement.properties.filter((p) => !p.isTransform);

      lines.push('  return {');
      if (transformProps.length > 0) {
        lines.push('    transform: [');
        transformProps.forEach((tp) => {
          lines.push(`      ${tp.valueExpression},`);
        });
        lines.push('    ],');
      }
      otherProps.forEach((op) => {
        lines.push(`    ${op.key}: ${op.valueExpression},`);
      });
      lines.push('  };');
      lines.push('});');
      lines.push('');
    });
  }

  // Integration Guide / Instructions
  if (options.includeIntegrationGuide && options.exportTarget !== 'component') {
    lines.push('// ----------------------------------------------------------------------------');
    lines.push('// Integration Guide');
    lines.push('// ----------------------------------------------------------------------------');
    lines.push('// In your screen or component:');
    lines.push('//');
    lines.push(`// export function ${componentName}Screen() {`);
    lines.push('//   useEffect(() => {');
    lines.push('//     startAnimation();');
    lines.push('//   }, []);');
    lines.push('//');
    lines.push('//   return (');
    lines.push(`//     <View style={{ width: ${stageWidth}, height: ${stageHeight}, position: 'relative' }}>`);
    compiledLayers.forEach((layer) => {
      lines.push(
        `//       <Animated.View style={[{ position: 'absolute', width: ${layer.layer.width}, height: ${layer.layer.height} }, ${layer.styleRequirement.name}]}>`
      );
      lines.push('//         {/* <Image source={{ uri: "..." }} style={{ width: "100%", height: "100%" }} /> */}');
      lines.push('//       </Animated.View>');
    });
    lines.push('//     </View>');
    lines.push('//   );');
    lines.push('// }');
  }

  const cleanFileBase = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'looply';
  let ext = 'ts';
  if (options.exportTarget === 'component') {
    ext = options.language === 'typescript' ? 'tsx' : 'jsx';
  } else {
    ext = options.language === 'typescript' ? 'ts' : 'js';
  }
  const filename = `${cleanFileBase}_animation.${ext}`;

  return {
    code: formatCodeBlock(lines),
    filename,
    target: options.exportTarget,
    report,
    sharedValues: allSharedValues,
    animatedStyles: allAnimatedStyles,
    imports: Array.from(reanimatedImports),
  };
}
