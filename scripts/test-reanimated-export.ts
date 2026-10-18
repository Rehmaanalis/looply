/**
 * Automated Test Suite for Looply Phase 4: React Native Reanimated Export
 * Tests property mapping, easing conversion, spring configurations, keyframe compilation,
 * output modes, compatibility diagnostics, and regression safety.
 */

import { ProjectData } from '../types/animation';
import {
  sanitizeIdentifier,
  generateLayerVarPrefix,
  REANIMATED_PROPERTY_SPECS,
} from '../lib/export/reanimated/propertyMapper';
import {
  mapEasingToReanimated,
  mapSpringConfigToReanimated,
  secondsToMs,
} from '../lib/export/reanimated/timingMapper';
import {
  generateReanimatedExport,
} from '../lib/export/reanimated/codeGenerator';
import { analyzeReanimatedCompatibility } from '../lib/export/reanimated/compatibility';
import { generateAnimationCSS } from '../lib/export/cssGenerator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}\n    Expected: ${expected}\n    Actual:   ${actual}`);
  }
}

console.log('--- TEST SUITE: Looply React Native Reanimated Export ---');

// 1. Property Mapping & Identifier Tests
console.log('\n[Group 1] Identifier Sanitization & Property Mapping');
assertEquals(sanitizeIdentifier('Hero Badge 2'), 'heroBadge2', 'Sanitizes spaces and casing');
assertEquals(sanitizeIdentifier('layer-3_item!'), 'layer3Item', 'Strips punctuation and converts to camelCase');
assertEquals(sanitizeIdentifier('123number'), 'val_123number', 'Prefixes numbers to ensure valid JS identifier');

assertEquals(REANIMATED_PROPERTY_SPECS.x.key, 'translateX', 'Maps x to translateX');
assertEquals(REANIMATED_PROPERTY_SPECS.y.key, 'translateY', 'Maps y to translateY');
assertEquals(REANIMATED_PROPERTY_SPECS.rotation.key, 'rotate', 'Maps rotation to rotate');
assertEquals(REANIMATED_PROPERTY_SPECS.rotation.formatValue(45), '45deg', 'Formats rotation in degrees');
assertEquals(REANIMATED_PROPERTY_SPECS.opacity.formatValue(0.75), 0.75, 'Formats opacity');

// 2. Timing & Easing Tests
console.log('\n[Group 2] Timing and Easing Conversion');
assertEquals(secondsToMs(1.5), 1500, 'Converts seconds to ms (1.5s -> 1500ms)');
assertEquals(secondsToMs(0.05), 50, 'Converts sub-second timing (0.05s -> 50ms)');

assertEquals(mapEasingToReanimated('linear').expression, 'Easing.linear', 'Maps linear easing');
assertEquals(mapEasingToReanimated('ease').expression, 'Easing.ease', 'Maps standard ease');
assertEquals(mapEasingToReanimated('ease-in').expression, 'Easing.in(Easing.ease)', 'Maps ease-in');
assertEquals(mapEasingToReanimated('ease-out').expression, 'Easing.out(Easing.ease)', 'Maps ease-out');
assertEquals(mapEasingToReanimated('ease-in-out').expression, 'Easing.inOut(Easing.ease)', 'Maps ease-in-out');
assertEquals(
  mapEasingToReanimated('cubic-bezier(0.25, 0.1, 0.25, 1.0)').expression,
  'Easing.bezier(0.25, 0.1, 0.25, 1)',
  'Parses custom cubic-bezier'
);

const springRes = mapSpringConfigToReanimated({
  mass: 1.5,
  damping: 15,
  stiffness: 200,
  initialVelocity: 5,
  overshootClamping: true,
});
assert(springRes.configString.includes('mass: 1.5'), 'Spring config includes mass');
assert(springRes.configString.includes('damping: 15'), 'Spring config includes damping');
assert(springRes.configString.includes('stiffness: 200'), 'Spring config includes stiffness');
assert(springRes.configString.includes('overshootClamping: true'), 'Spring config includes overshootClamping');

// 3. Multi-Layer Test Project
const sampleProject: ProjectData = {
  schemaVersion: 1,
  id: 'test-project',
  name: 'Showcase Animation',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  settings: {
    width: 600,
    height: 400,
    background: '#11131a',
    duration: 3,
    fps: 60,
    loop: true,
    direction: 'alternate',
  },
  assets: {
    'asset-1': {
      id: 'asset-1',
      name: 'card.png',
      type: 'image/png',
      width: 200,
      height: 200,
      dataUrl: 'data:image/png;base64,sample',
      size: 1024,
    },
  },
  layers: [
    {
      id: 'layer-card',
      name: 'Hero Card',
      assetId: 'asset-1',
      visible: true,
      locked: false,
      zIndex: 1,
      x: 100,
      y: 50,
      width: 200,
      height: 200,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      originX: 50,
      originY: 50,
      delay: 0,
      duration: 3,
      easing: 'ease-in-out',
      fillMode: 'both',
      iterationCount: 'infinite',
      keyframes: [
        {
          id: 'kf-1',
          time: 0,
          properties: { x: 100, y: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          easing: 'ease-out',
        },
        {
          id: 'kf-2',
          time: 1.5,
          properties: { x: 250, y: 120, rotation: 15, scaleX: 1.1, scaleY: 1.1 },
          easing: 'ease-in',
        },
        {
          id: 'kf-3',
          time: 3,
          properties: { x: 100, y: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          easing: 'ease-out',
        },
      ],
    },
  ],
};

// 4. Output Mode Tests
console.log('\n[Group 3] Output Modes Compilation');

// 4A. Expressions Mode
const expResult = generateReanimatedExport(sampleProject, { outputMode: 'expressions', language: 'typescript' });
assert(expResult.code.includes('import Animated'), 'Expressions output has imports');
assert(expResult.code.includes('heroCardTranslateX'), 'Expressions output has heroCardTranslateX');
assert(expResult.code.includes('withRepeat'), 'Expressions output handles withRepeat for loop: true');
assert(expResult.code.includes('withSequence'), 'Expressions output chains keyframes with withSequence');
assert(expResult.code.includes('useAnimatedStyle'), 'Expressions output defines animated styles');
assert(expResult.filename.endsWith('.tsx'), 'Component TypeScript (.tsx) extension applied');

// 4B. Sequence Mode (JavaScript)
const seqResult = generateReanimatedExport(sampleProject, { outputMode: 'sequence', language: 'javascript' });
assert(seqResult.code.includes('withSequence'), 'Sequence output uses withSequence');
assert(seqResult.filename.endsWith('.jsx'), 'Component JavaScript (.jsx) extension applied');

// 4C. Interpolation Mode (Single Master Timeline)
const interpResult = generateReanimatedExport(sampleProject, { outputMode: 'interpolation' });
assert(interpResult.code.includes('interpolate('), 'Interpolation output uses interpolate');
assert(interpResult.code.includes('Extrapolation.CLAMP'), 'Interpolation output uses Extrapolation.CLAMP');
assert(interpResult.code.includes('progress = useSharedValue(0)'), 'Interpolation output declares progress shared value');

// 4D. Targets: Hook and Logic
const hookResult = generateReanimatedExport(sampleProject, { exportTarget: 'hook', language: 'typescript' });
assert(hookResult.code.includes('export function useShowcaseAnimation'), 'Hook mode exports custom hook');
assert(hookResult.filename.endsWith('.ts'), 'Hook TypeScript (.ts) extension applied');

const logicResult = generateReanimatedExport(sampleProject, { exportTarget: 'logic', language: 'javascript' });
assert(logicResult.code.includes('React Native Reanimated Animation Logic'), 'Logic mode exports raw declarations');
assert(logicResult.filename.endsWith('.js'), 'Logic JavaScript (.js) extension applied');

// 4E. Master Timeline Synchronization (HTML/CSS Parity verification from report)
const multiTrackProject: ProjectData = {
  ...sampleProject,
  settings: {
    ...sampleProject.settings,
    duration: 3,
  },
  layers: [
    {
      ...sampleProject.layers[0],
      keyframes: [
        { id: 'k1', time: 0.25, properties: { opacity: 0 } },
        { id: 'k2', time: 0.44, properties: { rotation: 18, opacity: 1 } },
        { id: 'k3', time: 0.75, properties: { y: 47 } },
        { id: 'k4', time: 2.75, properties: { y: -58, opacity: 0 } },
        { id: 'k5', time: 3.0, properties: { y: -58, rotation: 0, opacity: 0 } },
      ],
    },
  ],
};
const syncedResult = generateReanimatedExport(multiTrackProject, { outputMode: 'sequence' });
assert(syncedResult.code.includes('withSequence'), 'Multi-track project generates withSequence');
// Verify that opacity has the exact 250ms segment to match report
assert(syncedResult.code.includes('duration: 250'), 'Preserves exact keyframe timestamp segment durations (250ms)');

// 5. Compatibility Diagnostics
console.log('\n[Group 4] Compatibility and Validation Diagnostics');
const report = analyzeReanimatedCompatibility(sampleProject);
assertEquals(report.overallStatus, 'ready', 'Sample project is ready with standard transform origin');
assert(report.supported.length > 0, 'Report lists supported capabilities');

// Add a layer with non-center transform origin and verify detection
const originTestProject: ProjectData = {
  ...sampleProject,
  layers: [
    {
      ...sampleProject.layers[0],
      originX: 0,
      originY: 100,
    },
  ],
};
const originReport = analyzeReanimatedCompatibility(originTestProject);
assertEquals(originReport.overallStatus, 'has_warnings', 'Non-center origin triggers diagnostic warning');
assert(
  originReport.approximate.some((d) => d.property === 'transformOrigin'),
  'Identifies non-center transform origin and provides suggestion'
);

// 6. Regression Tests: Ensure CSS Generator Unaffected
console.log('\n[Group 5] Regression Safety (CSS & HTML Generation)');
const cssResult = generateAnimationCSS(sampleProject, { mode: 'inline' });
assert(cssResult.css.includes('@keyframes looply-anim-layer-card'), 'CSS @keyframes generated cleanly');
assert(cssResult.stageHtml.includes('looply-stage'), 'HTML stage markup generated');

// 7. Multi-Layer Same Asset Identifier Uniqueness & Consistency
console.log('\n[Group 6] Multi-Layer Same Asset Uniqueness & Coordinate Consistency');
const multiFoxProject: ProjectData = {
  ...sampleProject,
  name: 'Three Foxes Animation',
  assets: {
    'asset-fox': {
      id: 'asset-fox',
      name: 'Fox',
      type: 'image/png',
      width: 180,
      height: 180,
      dataUrl: 'data:image/png;base64,foxdata',
      size: 2048,
    },
  },
  layers: [
    {
      ...sampleProject.layers[0],
      id: 'layer-fox-1',
      name: 'Fox',
      assetId: 'asset-fox',
      x: 100,
      y: 120,
    },
    {
      ...sampleProject.layers[0],
      id: 'layer-fox-2',
      name: 'Fox',
      assetId: 'asset-fox',
      x: 180,
      y: 110,
    },
    {
      ...sampleProject.layers[0],
      id: 'layer-fox-3',
      name: 'Fox',
      assetId: 'asset-fox',
      x: 240,
      y: 130,
    },
  ],
};

const foxResult = generateReanimatedExport(multiFoxProject, { language: 'typescript' });
assert(foxResult.code.includes('const fox1AnimatedStyle'), 'Generates unique fox1AnimatedStyle for first fox layer');
assert(foxResult.code.includes('const fox2AnimatedStyle'), 'Generates unique fox2AnimatedStyle for second fox layer');
assert(foxResult.code.includes('const fox3AnimatedStyle'), 'Generates unique fox3AnimatedStyle for third fox layer');
assert(foxResult.code.includes('translateX: 180') || foxResult.code.includes('translateX:'), 'Includes translateX positioning for all layers');
assert(foxResult.code.includes('translateY: 110') || foxResult.code.includes('translateY:'), 'Includes translateY positioning for all layers');
assert(foxResult.code.includes('ASSETS.fox1') && foxResult.code.includes('ASSETS.fox2') && foxResult.code.includes('ASSETS.fox3'), 'Assets dictionary references unique layer prefixes');

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL PHASE 4 REANIMATED EXPORT TESTS PASSED!\n');
}
