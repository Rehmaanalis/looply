import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import AdSlot from '@/components/ads/AdSlot';
import { getExamples } from '@/lib/content/contentService';
import { getAdsConfig } from '@/lib/ads/config';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Animation Examples — Looply Studio',
  description:
    'Explore production-ready CSS keyframe animation examples built with Looply. Inspect live codes, layered structures, and implementation notes.',
  openGraph: {
    title: 'Animation Examples — Looply Studio',
    description:
      'Explore production-ready CSS keyframe animation examples built with Looply. Inspect live codes, layered structures, and implementation notes.',
    type: 'website',
    url: 'https://rehmaanalis.github.io/looply/examples',
  },
};

export default async function ExamplesIndexPage() {
  const examples = await getExamples();
  const adsConfig = await getAdsConfig();

  const examplesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Looply CSS Animation Examples',
    description:
      'Explore production-ready CSS keyframe animation examples built with Looply.',
    url: 'https://rehmaanalis.github.io/looply/examples',
    hasPart: examples.map((item) => ({
      '@type': 'TechArticle',
      headline: item.title,
      description: item.description,
      url: `https://rehmaanalis.github.io/looply/examples/${item.slug}`,
      datePublished: item.datePublished,
    })),
  };

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(examplesJsonLd) }}
      />

      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Showcase &amp; Patterns
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              CSS Animation Examples
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed">
              Real-world animation patterns for landing pages, SaaS interfaces, and micro-interactions delivered via data files.
            </p>
          </div>

          {/* Configurable Seamless AdSense / Partner Slot */}
          <AdSlot placement="examplesFeed" config={adsConfig} className="mb-10 max-w-5xl mx-auto" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {examples.map((item) => (
              <Link
                key={item.slug}
                href={`/examples/${item.slug}`}
                className="group bg-studio-surface border border-studio-border hover:border-indigo-500/50 rounded-2xl p-6 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {item.category}
                    </span>
                    <span className="text-xs text-studio-muted">{item.readTime}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-xs text-studio-muted leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-studio-border pt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">{item.date}</span>
                  <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Guide &amp; Code →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
