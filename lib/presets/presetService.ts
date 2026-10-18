import { ProjectData } from '@/types/animation';
import iconPresetsData from '@/data/content/presets/iconPresets.json';
import seoConfigData from '@/data/content/presets/seoConfig.json';

export interface IconPresetKeyframe {
  pct: number;
  transform?: string;
  opacity?: string;
  filter?: string;
  transformOrigin?: string;
}

export interface IconPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  duration: number;
  easing: string;
  keyframes: IconPresetKeyframe[];
  tags: string[];
  useCase: string;
}

export interface PresetCategoryMeta {
  id: string;
  label: string;
  description: string;
}

export interface PresetFaq {
  question: string;
  answer: string;
}

export interface PresetSeoConfig {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  categories: PresetCategoryMeta[];
  faqs: PresetFaq[];
}

/**
 * Retrieve all single-icon animation presets
 */
export async function getIconPresets(): Promise<IconPreset[]> {
  return iconPresetsData as IconPreset[];
}

/**
 * Retrieve SEO configuration for the presets page
 */
export async function getPresetSeoConfig(): Promise<PresetSeoConfig> {
  return seoConfigData as PresetSeoConfig;
}

/**
 * Generate standard clean CSS code snippet
 */
export function generatePresetCSS(preset: IconPreset, customClass?: string): string {
  const animName = `looply-${preset.id}`;
  const className = customClass || `animate-${preset.id}`;

  const kfLines = preset.keyframes
    .map((k) => {
      const rules: string[] = [];
      if (k.transform) rules.push(`transform: ${k.transform};`);
      if (k.opacity !== undefined) rules.push(`opacity: ${k.opacity};`);
      if (k.filter) rules.push(`filter: ${k.filter};`);
      if (k.transformOrigin) rules.push(`transform-origin: ${k.transformOrigin};`);
      return `  ${k.pct}% {\n    ${rules.join('\n    ')}\n  }`;
    })
    .join('\n');

  return `/* Looply Studio — ${preset.name} Icon Animation */
@keyframes ${animName} {
${kfLines}
}

.${className} {
  display: inline-block;
  animation: ${animName} ${preset.duration}s ${preset.easing} infinite;
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
  .${className} {
    animation: none;
    transform: none;
  }
}`;
}

/**
 * Generate React Native Reanimated v4 code snippet
 */
export function generatePresetReanimatedV4(preset: IconPreset): string {
  const compName = preset.name.replace(/[^a-zA-Z0-9]/g, '') + 'AnimatedIcon';

  return `/**
 * Looply Studio — Single-Icon Animation Preset: ${preset.name}
 * Target: React Native Reanimated v4 (Worklet Concurrency & New Architecture)
 * Docs: https://docs.swmansion.com/react-native-reanimated/
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

export interface ${compName}Props {
  children?: React.ReactNode;
  duration?: number;
  autoPlay?: boolean;
}

export function ${compName}({
  children,
  duration = ${preset.duration * 1000},
  autoPlay = true,
}: ${compName}Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (autoPlay) {
      progress.value = withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        }),
        -1,
        true
      );
    }
    return () => cancelAnimation(progress);
  }, [autoPlay, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    // Smooth interpolations running directly on the UI thread
    return {
      transform: [
        { scale: 1 + progress.value * 0.2 },
        { translateY: -progress.value * 12 },
      ],
      opacity: 0.85 + progress.value * 0.15,
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ${compName};`;
}

/**
 * Generate Schema.org structured data (JSON-LD) for SEO
 */
export function generatePresetsSchema(
  presets: IconPreset[],
  config: PresetSeoConfig
): Record<string, unknown>[] {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Looply Single-Icon Animation Presets',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    description: config.description,
    url: config.canonicalUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'Looply Studio',
      url: 'https://rehmaanalis.github.io/looply',
    },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Curated Icon Motion Effects & Keyframe Presets',
    description: 'Collection of 85+ copy-ready single icon animations for web & React Native.',
    numberOfItems: presets.length,
    itemListElement: presets.slice(0, 30).map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.name,
      description: p.description,
      url: `${config.canonicalUrl}#${p.id}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rehmaanalis.github.io/looply/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Presets',
        item: config.canonicalUrl,
      },
    ],
  };

  return [webAppSchema, itemListSchema, faqSchema, breadcrumbSchema];
}

/**
 * Create a full Looply Studio ProjectData ready to be saved into IndexedDB
 * and opened in the App Studio (/app)
 */
export function createProjectFromPreset(preset: IconPreset): ProjectData {
  const now = new Date().toISOString();
  const projectId = `preset-${preset.id}-${Date.now()}`;
  const assetId = `asset-${preset.id}`;
  const layerId = `layer-${preset.id}`;

  // Clean, high-contrast SVG representation of an icon container with badge
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
    <rect x="4" y="4" width="112" height="112" rx="28" fill="#1e2230" stroke="#6366f1" stroke-width="2.5"/>
    <circle cx="60" cy="60" r="34" fill="#6366f1" fill-opacity="0.16"/>
    <path d="M60 36v48M36 60h48" stroke="#818cf8" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="14" fill="#6366f1"/>
    <circle cx="60" cy="60" r="6" fill="#ffffff"/>
  </svg>`;

  const base64Svg =
    typeof window !== 'undefined'
      ? `data:image/svg+xml;base64,${btoa(svgContent)}`
      : 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent);

  // Map preset keyframes into Looply KeyframeRecords
  const keyframes = preset.keyframes.map((kf, i) => {
    const time = (kf.pct / 100) * preset.duration;
    let x = 260;
    let y = 140;
    let scaleX = 1;
    let scaleY = 1;
    let rotation = 0;
    let opacity = 1;

    // Parse transform attributes
    if (kf.transform) {
      const translateYMatch = kf.transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
      if (translateYMatch) y += parseFloat(translateYMatch[1]);

      const translateXMatch = kf.transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
      if (translateXMatch) x += parseFloat(translateXMatch[1]);

      const rotateMatch = kf.transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
      if (rotateMatch) rotation = parseFloat(rotateMatch[1]);

      const scaleMatch = kf.transform.match(/scale\((-?\d+(?:\.\d+)?)\)/);
      if (scaleMatch) {
        scaleX = parseFloat(scaleMatch[1]);
        scaleY = parseFloat(scaleMatch[1]);
      }

      const scaleXYMatch = kf.transform.match(/scale\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/);
      if (scaleXYMatch) {
        scaleX = parseFloat(scaleXYMatch[1]);
        scaleY = parseFloat(scaleXYMatch[2]);
      }
    }

    if (kf.opacity !== undefined) {
      opacity = parseFloat(kf.opacity);
    }

    return {
      id: `kf-${preset.id}-${i}`,
      time: Math.round(time * 100) / 100,
      properties: {
        x,
        y,
        scaleX,
        scaleY,
        rotation,
        opacity,
      },
      easing: preset.easing || 'ease-in-out',
    };
  });

  return {
    schemaVersion: 1,
    id: projectId,
    name: `${preset.name} — Preset`,
    settings: {
      width: 640,
      height: 400,
      background: '#0d1117',
      duration: preset.duration,
      fps: 60,
      loop: true,
      direction: 'normal',
    },
    assets: {
      [assetId]: {
        id: assetId,
        name: `${preset.name} Icon`,
        type: 'image/svg+xml',
        width: 120,
        height: 120,
        dataUrl: base64Svg,
        size: svgContent.length,
      },
    },
    layers: [
      {
        id: layerId,
        name: `${preset.name} Icon`,
        assetId: assetId,
        visible: true,
        locked: false,
        zIndex: 1,
        x: 260,
        y: 140,
        width: 120,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        originX: 50,
        originY: 50,
        delay: 0,
        duration: preset.duration,
        easing: preset.easing,
        fillMode: 'forwards',
        iterationCount: 'infinite',
        keyframes,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
