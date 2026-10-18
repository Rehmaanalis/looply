import { Metadata } from 'next';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import PresetsExplorer from '@/components/presets/PresetsExplorer';
import {
  getIconPresets,
  getPresetSeoConfig,
  generatePresetsSchema,
} from '@/lib/presets/presetService';

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getPresetSeoConfig();

  return {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    alternates: {
      canonical: '/presets/',
    },
    openGraph: {
      title: seoConfig.ogTitle,
      description: seoConfig.ogDescription,
      url: seoConfig.canonicalUrl,
      siteName: 'Looply Studio',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.ogTitle,
      description: seoConfig.ogDescription,
    },
  };
}

export default async function PresetsPage() {
  const [presets, seoConfig] = await Promise.all([
    getIconPresets(),
    getPresetSeoConfig(),
  ]);

  const jsonLdSchemas = generatePresetsSchema(presets, seoConfig);

  return (
    <div className="min-h-screen bg-studio-bg text-studio-text flex flex-col">
      {/* Schema.org Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />

      {/* Primary Navigation Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-studio-muted mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-400 font-medium">Presets</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 leading-tight text-balance">
            Single-Icon Animation Presets
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6 text-balance">
            Explore 85+ copy-ready single-icon motion presets for web and mobile.
            Export instant CSS keyframes, Reanimated v4 code, or open directly in Looply Studio to customize.
          </p>

          {/* Value Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-studio-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              60 FPS Hardware-Accelerated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              React Native Reanimated v4
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              100% Free &amp; Open Source
            </span>
          </div>
        </div>

        {/* Interactive Presets Explorer */}
        <section aria-label="Animation Presets Library" className="mb-20">
          <PresetsExplorer
            initialPresets={presets}
            categories={seoConfig.categories}
          />
        </section>

        {/* Educational / SEO FAQ Section */}
        <section aria-labelledby="faq-heading" className="max-w-3xl mx-auto mb-20 border-t border-studio-border pt-14">
          <div className="text-center mb-10">
            <h2 id="faq-heading" className="text-2xl font-bold text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-studio-muted">
              Everything you need to know about using single-icon animations in production.
            </p>
          </div>

          <div className="space-y-4">
            {seoConfig.faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-studio-surface border border-studio-border rounded-xl p-4.5 open:border-indigo-500/50 transition-colors"
              >
                <summary className="font-semibold text-sm text-white cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-studio-muted group-open:rotate-180 transition-transform duration-200">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-studio-border/50 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Studio CTA Banner */}
        <section className="rounded-2xl bg-gradient-to-br from-indigo-950/60 via-studio-surface to-studio-surface border border-indigo-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-xl mb-12">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
              Design Custom Keyframe Animations
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Need multi-layer timelines, spring physics, or custom SVG morphing?
              Launch the full Looply Studio in your browser without signing up.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                Launch Looply Studio
              </Link>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-studio-panel hover:bg-studio-border text-white text-sm font-medium border border-studio-border transition-colors"
              >
                <span>How It Works</span>
                <ArrowRight className="w-4 h-4 text-studio-muted" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
