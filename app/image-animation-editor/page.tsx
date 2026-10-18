import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Image Animation Editor Online — Looply',
  description:
    'Online image animation editor. Animate PNGs, SVGs, and WebP graphics with keyframes, timeline scrubbing, and instant CSS export. 100% private in-browser.',
};

export default function ImageAnimationEditorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Online Image Editor
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Animate PNGs, SVGs, and WebP Graphics Visually
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed max-w-2xl mx-auto">
              Bring static graphic assets to life. Arrange multiple graphic layers, sculpt motion paths and scale oscillations, and export to pure CSS without watermarks.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                Launch Image Animator
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-studio-surface border border-studio-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Transparent PNGs</h3>
              <p className="text-xs text-studio-muted leading-relaxed">
                Float transparent product renders and UI badges without ugly background boxes or halos.
              </p>
            </div>
            <div className="bg-studio-surface border border-studio-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Vector SVGs</h3>
              <p className="text-xs text-studio-muted leading-relaxed">
                Scale, spin, and translate crisp vector shapes with infinite resolution sharpness.
              </p>
            </div>
            <div className="bg-studio-surface border border-studio-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Modern WebP</h3>
              <p className="text-xs text-studio-muted leading-relaxed">
                Optimized file sizes with alpha channel support for ultra-fast mobile loading.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
