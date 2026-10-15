import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Play, ArrowRight, Upload, Layers, Sliders, Download, Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works — Looply Visual CSS Animation Workflow',
  description:
    'Learn how Looply transforms imported images into production CSS animations through timeline keyframing, real-time stage inspection, and clean code generation.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Import Graphics',
      desc: 'Drag and drop PNG, JPEG, WebP, or SVG graphics directly into your workspace. Assets are loaded into memory and instantly ready for canvas staging and animation.',
      icon: Upload,
    },
    {
      num: '02',
      title: 'Compose Layers on the Stage Canvas',
      desc: 'Add assets to the canvas stage as independent layers. Configure stage resolution (e.g. 800×500px), background color, layer z-index stacking, initial position, width/height, and transform origin coordinates.',
      icon: Layers,
    },
    {
      num: '03',
      title: 'Animate with Timeline Keyframes',
      desc: 'Move the playhead across the time ruler and insert keyframes. Looply linearly interpolates properties between keyframes and applies your choice of easing (ease, ease-in, ease-out, ease-in-out, linear) for lifelike physical motion.',
      icon: Sliders,
    },
    {
      num: '04',
      title: 'Export Standalone CSS and ZIP Package',
      desc: 'Export mathematically precise CSS keyframe rules alongside an index.html demo file and assets directory. Copy into your React, Next.js, Vue, or static web project. The animation runs on pure browser CSS with zero script dependencies.',
      icon: Download,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              How Looply Works
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed">
              A streamlined, local-first workflow bridging visual animation tools with clean, production-grade frontend code.
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="bg-studio-surface border border-studio-border rounded-2xl p-8 flex flex-col md:flex-row items-start gap-6 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono font-bold text-indigo-400">{step.num}</span>
                      <h2 className="text-xl font-bold text-white">{step.title}</h2>
                    </div>
                    <p className="text-sm text-studio-muted leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Try It in Looply Studio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
