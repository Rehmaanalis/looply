import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { GUIDES } from '@/lib/content/data';
import { Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Guides & Documentation — Looply Studio',
  description:
    'Comprehensive step-by-step tutorials and developer guides for Looply: creating keyframe animations, asset optimization, and framework integration.',
};

export default function GuidesIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Documentation &amp; Walkthroughs
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Looply Tutorials &amp; Guides
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed">
              Step-by-step documentation to help you master keyframes, canvas staging, and production export.
            </p>
          </div>

          <div className="space-y-6">
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="block bg-studio-surface border border-studio-border hover:border-indigo-500/50 rounded-2xl p-6 sm:p-7 transition-all group"
              >
                <div className="flex items-center gap-3 text-xs text-studio-muted mb-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-sans uppercase font-semibold text-[10px]">
                    {guide.category}
                  </span>
                  <span>•</span>
                  <span>{guide.readTime}</span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {guide.title}
                </h2>

                <p className="text-xs text-studio-muted leading-relaxed mb-4">
                  {guide.description}
                </p>

                <div className="flex items-center justify-between border-t border-studio-border pt-3 text-xs">
                  <div className="flex gap-2">
                    {guide.tags.map((t) => (
                      <span key={t} className="text-[10px] text-slate-400 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read Guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Building Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
