import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import {
  Layers,
  Sliders,
  Download,
  Zap,
  Sparkles,
  HardDrive,
  CheckCircle2,
  Play,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features — Looply Visual Keyframe Animation Studio',
  description:
    'Comprehensive feature overview of Looply: multi-layer timeline, visual stage positioning, cubic-bezier easing, zero-runtime CSS export, and local-first persistence.',
};

export default function FeaturesPage() {
  const features = [
    {
      icon: Sliders,
      title: 'Precision Keyframe Timeline',
      desc: 'Visual timeline with sub-second scrub ruler, per-layer tracks, keyframe markers, and instant visual feedback.',
      details: ['Scrub anywhere on ruler', 'Add keyframes at exact timestamps', 'Drag markers to shift timing'],
    },
    {
      icon: Layers,
      title: 'Multi-Layer Canvas Workspace',
      desc: 'Arrange multiple graphics with independent coordinates, scale, z-index ordering, and transform origins.',
      details: ['Real-time interactive dragging', 'Fit-to-view and zoom controls', 'Customizable stage dimensions'],
    },
    {
      icon: Sparkles,
      title: 'Motion Presets Library',
      desc: 'One-click presets that generate actual keyframes on your layer rather than hardcoded mock preview tricks.',
      details: ['Elastic bounce & landing', 'Pulse & heartbeat scale loops', '360° spin and floating motion'],
    },
    {
      icon: Download,
      title: 'Production CSS & ZIP Export',
      desc: 'Generates clean, indented CSS with @keyframes, stage container styles, and standalone index.html.',
      details: ['Self-contained ZIP package', 'Single-file CSS with base64 images', 'Zero JavaScript runtime required'],
    },
    {
      icon: HardDrive,
      title: 'Seamless Project Autosave',
      desc: 'All projects and animations save automatically as you design, with effortless restore and backup.',
      details: ['Automatic background save', 'Portable JSON project export & import', 'Work offline whenever you want'],
    },
    {
      icon: Zap,
      title: '60 FPS GPU-Composited Motion',
      desc: 'Transforms use translate3d and opacity to leverage browser GPU acceleration without triggering expensive reflows.',
      details: ['Zero layout shifts', 'Smooth 60 FPS performance', 'Respects prefers-reduced-motion'],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Built for speed, privacy, and clean code
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed">
              Explore the core architectural features that make Looply the definitive visual animation tool for developers and UI designers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-studio-surface border border-studio-border rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">{f.title}</h2>
                    <p className="text-xs text-studio-muted leading-relaxed mb-4">{f.desc}</p>
                  </div>
                  <ul className="space-y-2 border-t border-studio-border pt-4 text-xs text-slate-300">
                    {f.details.map((d, di) => (
                      <li key={di} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-studio-surface border border-indigo-500/30 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Test all features in the live editor</h3>
            <p className="text-xs text-studio-muted max-w-xl mx-auto mb-6">
              Launch the studio right in your browser with our preloaded welcome project.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Studio Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
