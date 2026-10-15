import React from 'react';
import Link from 'next/link';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import LivePreviewHero from '@/components/marketing/LivePreviewHero';
import {
  Sparkles,
  Play,
  Download,
  Layers,
  ShieldCheck,
  Zap,
  Sliders,
  Code2,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Laptop,
} from 'lucide-react';
import { EXAMPLES, BLOG_POSTS } from '@/lib/content/data';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-studio-surface border border-studio-border text-xs text-indigo-300 mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Looply 2.0</span>
                <span className="text-studio-muted">•</span>
                <span>Visual CSS Keyframe Studio</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Animate images visually.{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                  Export production CSS.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base sm:text-lg text-studio-muted leading-relaxed max-w-2xl mx-auto">
                Upload your graphics, arrange layers on a visual canvas, sculpt timeline keyframes with custom easing, and export lightweight, zero-runtime CSS animations.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/app"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Launch Free Studio
                </Link>

                <Link
                  href="/how-it-works"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-studio-surface hover:bg-studio-panel text-white font-medium text-sm border border-studio-border transition-colors"
                >
                  See How It Works
                  <ArrowRight className="w-4 h-4 text-studio-muted" />
                </Link>
              </div>

              {/* Trust markers */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-studio-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  No sign-up required
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  Automatic Autosave
                </span>
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Clean standard @keyframes
                </span>
              </div>
            </div>

            {/* Interactive Live Preview Component */}
            <div className="max-w-4xl mx-auto">
              <LivePreviewHero />
            </div>
          </div>
        </section>

        {/* Core Pillars / Features Section */}
        <section className="py-20 border-t border-studio-border bg-[#0d0f15]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                Engineered for Web Builders
              </h2>
              <p className="text-3xl font-bold text-white tracking-tight">
                Everything you need to orchestrate flawless web motion
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-studio-surface border border-studio-border rounded-2xl p-6 hover:border-indigo-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Visual Canvas &amp; Timeline
                </h3>
                <p className="text-xs leading-relaxed text-studio-muted mb-4">
                  Drag and place multiple layers directly on stage. Scrub time effortlessly, drop keyframes at any second, and tweak position, scale, rotation, and opacity in real time.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Sub-pixel coordinates &amp; transforms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Per-layer timing, delays, &amp; fill-mode
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Custom cubic-bézier and easing curves
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-studio-surface border border-studio-border rounded-2xl p-6 hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <Download className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Zero-Runtime CSS &amp; ZIP Export
                </h3>
                <p className="text-xs leading-relaxed text-studio-muted mb-4">
                  Looply never locks you in. Export complete standalone ZIP archives containing clean <code className="text-emerald-400">animation.css</code>, <code className="text-emerald-400">index.html</code>, and assets ready to drop into any stack.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    GPU-composited translate3d transforms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Optional single-file base64 data URLs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Works in React, Vue, Svelte, or static HTML
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-studio-surface border border-studio-border rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Instant Project Autosave
                </h3>
                <p className="text-xs leading-relaxed text-studio-muted mb-4">
                  Work freely with automatic continuous saves. Create animations, adjust keyframes, switch between projects, and back up your designs with ease.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Instant seamless autosave
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Portable JSON project backup &amp; restore
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Works offline whenever you need
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Workflow Section */}
        <section className="py-20 border-t border-studio-border bg-studio-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                Simple 4-Step Workflow
              </h2>
              <p className="text-3xl font-bold text-white tracking-tight">
                From static images to running CSS in seconds
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl bg-studio-surface border border-studio-border relative">
                <span className="text-2xl font-bold text-indigo-500 font-mono">01</span>
                <h3 className="text-sm font-semibold text-white mt-2 mb-1">Import Graphics</h3>
                <p className="text-xs text-studio-muted leading-relaxed">
                  Drop your PNG, JPG, WebP, or vector SVG files directly into the Asset library.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-studio-surface border border-studio-border relative">
                <span className="text-2xl font-bold text-indigo-500 font-mono">02</span>
                <h3 className="text-sm font-semibold text-white mt-2 mb-1">Position on Stage</h3>
                <p className="text-xs text-studio-muted leading-relaxed">
                  Place layers on the canvas, set z-index ordering, dimensions, and transform origin.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-studio-surface border border-studio-border relative">
                <span className="text-2xl font-bold text-indigo-500 font-mono">03</span>
                <h3 className="text-sm font-semibold text-white mt-2 mb-1">Keyframe Motion</h3>
                <p className="text-xs text-studio-muted leading-relaxed">
                  Add keyframe points along the time ruler. Apply presets like Bounce, Pulse, or Spin.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-studio-surface border border-studio-border relative">
                <span className="text-2xl font-bold text-indigo-500 font-mono">04</span>
                <h3 className="text-sm font-semibold text-white mt-2 mb-1">Export CSS / ZIP</h3>
                <p className="text-xs text-studio-muted leading-relaxed">
                  Grab standard keyframe stylesheet or download a pre-packaged ZIP bundle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Guides & Examples */}
        <section className="py-20 border-t border-studio-border bg-[#0d0f15]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                  Educational Resources
                </h2>
                <p className="text-2xl font-bold text-white tracking-tight">
                  Animation tutorials and live examples
                </p>
              </div>
              <Link
                href="/guides"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-4 sm:mt-0"
              >
                Browse all guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXAMPLES.map((ex) => (
                <Link
                  key={ex.slug}
                  href={`/examples/${ex.slug}`}
                  className="group bg-studio-surface border border-studio-border hover:border-indigo-500/50 rounded-2xl p-6 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {ex.category}
                    </span>
                    <h3 className="text-base font-semibold text-white mt-3 mb-2 group-hover:text-indigo-300 transition-colors">
                      {ex.title}
                    </h3>
                    <p className="text-xs text-studio-muted leading-relaxed line-clamp-3">
                      {ex.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-studio-border flex items-center justify-between text-xs text-studio-muted">
                    <span>{ex.readTime}</span>
                    <span className="text-indigo-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Inspect Animation →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action banner */}
        <section className="py-20 border-t border-studio-border bg-gradient-to-b from-studio-surface to-studio-bg text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to craft your first CSS animation?
            </h2>
            <p className="mt-4 text-sm text-studio-muted leading-relaxed">
              No login required. Works entirely in your browser with zero latency and automatic local backup.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/app"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold text-base shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                Launch Looply Studio Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
