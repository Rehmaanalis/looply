import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import AdSlot from '@/components/ads/AdSlot';
import { getHowItWorks } from '@/lib/content/contentService';
import { getAdsConfig } from '@/lib/ads/config';
import { Upload, Layers, Sliders, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works — Looply Visual CSS & Reanimated Animation Workflow',
  description:
    'Learn how Looply transforms imported images into production animations through timeline keyframing, real-time stage inspection, and clean zero-runtime code generation.',
  openGraph: {
    title: 'How It Works — Looply Visual CSS & Reanimated Animation Workflow',
    description:
      'Learn how Looply transforms imported images into production animations through timeline keyframing, real-time stage inspection, and clean zero-runtime code generation.',
    type: 'website',
    url: 'https://rehmaanalis.github.io/looply/how-it-works',
  },
};

const STEP_ICONS: Record<string, React.ElementType> = {
  '01': Upload,
  '02': Layers,
  '03': Sliders,
  '04': Download,
};

export default async function HowItWorksPage() {
  const data = await getHowItWorks();
  const adsConfig = await getAdsConfig();

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.title,
    description: data.description,
    step: data.steps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.title,
      text: s.desc,
      url: `https://rehmaanalis.github.io/looply/how-it-works#${s.slug}`,
    })),
  };

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Visual Workflow Engine
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {data.title}
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed">
              {data.description}
            </p>
          </div>

          {/* Overview delivered from data/content/how-it-works/overview.html */}
          <div
            className="mb-12 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: data.overviewHtml }}
          />

          {/* Configurable Seamless AdSlot */}
          <AdSlot placement="howItWorksSidebar" config={adsConfig} className="mb-12" />

          {/* Step-by-Step Interactive Workflow */}
          <div className="space-y-12">
            {data.steps.map((step) => {
              const Icon = STEP_ICONS[step.num] || Sliders;
              return (
                <div
                  key={step.num}
                  id={step.slug}
                  className="bg-studio-surface border border-studio-border hover:border-indigo-500/30 rounded-2xl p-6 sm:p-8 transition-all scroll-mt-24"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 font-bold text-lg font-mono">
                      {step.num}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {step.title}
                        </h2>
                      </div>

                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {step.desc}
                      </p>

                      {/* Step HTML content delivered from data/content/how-it-works/{step.htmlFile} */}
                      {step.stepHtml && (
                        <div
                          className="pt-2"
                          dangerouslySetInnerHTML={{ __html: step.stepHtml }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom AdSlot and CTA */}
          <AdSlot placement="blogBottom" config={adsConfig} className="mt-12" />

          <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-b from-indigo-950/20 to-studio-surface border border-indigo-500/30">
            <h3 className="text-xl font-bold text-white mb-2">Ready to animate your first asset?</h3>
            <p className="text-sm text-studio-muted mb-6">Launch the studio now. Runs 100% locally in your browser.</p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/30"
            >
              Launch Studio Now →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
