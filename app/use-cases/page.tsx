import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Sparkles, Layers, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Use Cases — Looply Animation Studio',
  description:
    'Discover practical use cases for Looply: landing page hero animations, floating SaaS badges, conversion CTA ripples, and social marketing banners.',
};

export default function UseCasesPage() {
  const useCases = [
    {
      title: 'Hero Section Feature Showcases',
      desc: 'Animate multi-layered UI mockups, browser windows, floating charts, and dashboard widgets to captivate visitors on landing page heroes.',
      benefits: ['Eliminates heavy video files or bloated Lottie runtimes', 'Fast first contentful paint (FCP)', 'Completely responsive'],
    },
    {
      title: 'SaaS Floating Micro-Interactions',
      desc: 'Create gently hovering feature badges, pulsing verification marks, and ambient glowing icons that reinforce product quality.',
      benefits: ['Subtle, non-distracting motion loops', 'Zero main-thread jank', 'Independent GPU rendering'],
    },
    {
      title: 'High-Converting CTA Button Motion',
      desc: 'Draw peripheral vision to primary signup and purchase buttons using rhythmic pulse or ripple keyframe animations.',
      benefits: ['Higher click-through rate (CTR)', 'Lightweight CSS classes', 'Easy integration into existing buttons'],
    },
    {
      title: 'Product Launch & Social Motion',
      desc: 'Craft animated teasers and banner graphics for Twitter/X, LinkedIn, and newsletters using pure HTML and exported GIF/CSS assets.',
      benefits: ['Crisp Retina sharpness', 'Private client asset protection', 'Instant export as standalone ZIP'],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Where to use Looply animations
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed">
              Explore how web agencies, startup founders, and frontend engineers elevate their digital experiences with lightweight keyframe motion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className="bg-studio-surface border border-studio-border rounded-2xl p-7 flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
              >
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">{uc.title}</h2>
                  <p className="text-xs text-studio-muted leading-relaxed mb-6">{uc.desc}</p>
                </div>
                <div className="border-t border-studio-border pt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 block mb-2">
                    Key Advantages
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {uc.benefits.map((b, bi) => (
                      <li key={bi} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Build Your Animation Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
