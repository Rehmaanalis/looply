import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free CSS Animation Generator — Looply',
  description:
    'Visual CSS keyframe generator. Create custom web animations with real-time preview and export clean, production-ready @keyframes stylesheets with zero dependencies.',
};

export default function CssAnimationGeneratorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Developer Tool
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Visual CSS Keyframe Animation Generator
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed max-w-2xl mx-auto">
              Stop manually writing tedious percentage matrices in CSS. Graphically adjust transforms, timings, and easing curves, then copy production-ready CSS.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                Open Animation Generator
              </Link>
            </div>
          </div>

          {/* Code comparison section */}
          <div className="bg-studio-surface border border-studio-border rounded-2xl p-6 sm:p-8 mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Why Generate Pure CSS?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-studio-muted">
              <div className="p-4 rounded-xl bg-studio-panel border border-studio-border">
                <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
                  <span>❌ Heavy JS Animation Runtimes</span>
                </div>
                <p className="leading-relaxed">
                  Libraries like GSAP or Lottie add 50KB to 250KB of bundle weight, require hydration, run on the single JavaScript main thread, and drain mobile battery during continuous loops.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-studio-panel border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                  <span>✅ Looply Pure CSS Keyframes</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  Zero bundle overhead. Executes directly on the browser compositor thread with GPU acceleration. 60 FPS guaranteed without blocking DOM updates.
                </p>
              </div>
            </div>
          </div>

          {/* Sample Generated CSS */}
          <div className="bg-[#090b10] border border-studio-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3 text-xs text-studio-muted">
              <span className="font-mono text-white">Generated CSS Example</span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Validated W3C CSS3
              </span>
            </div>
            <pre className="font-mono text-xs text-emerald-300 overflow-x-auto p-2 leading-relaxed">
{`/* Exported from Looply Studio */
.looply-stage {
  position: relative;
  width: 640px;
  height: 400px;
  overflow: hidden;
}

.looply-layer-badge {
  animation: looply-anim-badge 3s ease-in-out 0s infinite normal forwards;
}

@keyframes looply-anim-badge {
  0% {
    transform: translate3d(260px, 140px, 0) scale(1, 1);
    opacity: 1;
  }
  50% {
    transform: translate3d(260px, 125px, 0) scale(1.08, 1.08);
    opacity: 1;
  }
  100% {
    transform: translate3d(260px, 140px, 0) scale(1, 1);
    opacity: 1;
  }
}`}
            </pre>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
