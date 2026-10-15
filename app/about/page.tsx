import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Heart, ShieldCheck, Sparkles, Code2, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Looply — Local-First Animation Studio',
  description:
    'Learn about Looply’s mission to bring high-performance, private, browser-based motion design tools to frontend developers and designers.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Our Philosophy
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              About Looply
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed max-w-2xl mx-auto">
              We believe web creative tools should run fast, respect your privacy, work offline, and export clean, readable code.
            </p>
          </div>

          <div className="bg-studio-surface border border-studio-border rounded-2xl p-8 space-y-6 text-sm text-slate-300 leading-relaxed mb-12">
            <h2 className="text-xl font-bold text-white">The Local-First Vision</h2>
            <p>
              Modern web design tools have increasingly shifted towards heavy server dependencies, mandatory subscription accounts, and locked proprietary formats. When working on unreleased products or client designs, uploading graphic files to third-party cloud servers is an unnecessary privacy risk.
            </p>
            <p>
              <strong>Looply</strong> was built with a different philosophy:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-studio-muted">
              <li>
                <strong className="text-white">Frictionless Workflow:</strong> All image uploads, project schemas, and animation states are processed directly on your device with instant feedback.
              </li>
              <li>
                <strong className="text-white">Zero Script Lock-In:</strong> Exported animations produce pure standard W3C CSS keyframes that execute without any runtime JavaScript libraries.
              </li>
              <li>
                <strong className="text-white">Immediate Feedback:</strong> Timeline scrubbing, property editing, and canvas staging happen at native 60 FPS without waiting for server roundtrips.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white pt-4">Open Web Standards</h2>
            <p>
              By focusing on GPU-composited CSS properties (<code className="text-indigo-400">transform: translate3d()</code>, <code className="text-indigo-400">scale()</code>, <code className="text-indigo-400">rotate()</code>, and <code className="text-indigo-400">opacity</code>), Looply generates animations that maintain fluid 60 FPS frame rates across desktops, tablets, and smartphones.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Studio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
