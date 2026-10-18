import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import AdSlot from '@/components/ads/AdSlot';
import { getExamples, getExample } from '@/lib/content/contentService';
import { getAdsConfig } from '@/lib/ads/config';
import { ChevronLeft, Calendar, User, Clock } from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const examples = await getExamples();
  return examples.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getExample(params.slug);
  if (!item) return { title: 'Example Not Found — Looply' };

  return {
    title: `${item.title} — Looply Animation Example`,
    description: item.description,
    openGraph: {
      title: `${item.title} — Looply Animation Example`,
      description: item.description,
      type: 'article',
      url: `https://rehmaanalis.github.io/looply/examples/${item.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.title} — Looply Animation Example`,
      description: item.description,
    },
  };
}

export default async function ExampleDetailPage({ params }: Props) {
  const item = await getExample(params.slug);
  if (!item) notFound();

  const adsConfig = await getAdsConfig();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: item.title,
    description: item.description,
    datePublished: item.datePublished,
    dateModified: item.dateModified || item.datePublished,
    author: {
      '@type': 'Organization',
      name: item.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Looply Studio',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://rehmaanalis.github.io/looply/examples/${item.slug}`,
    },
    keywords: item.tags.join(', '),
  };

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Header />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/examples"
            className="inline-flex items-center gap-1.5 text-xs text-studio-muted hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to all examples
          </Link>

          {/* Header */}
          <div className="mb-10">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {item.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 mb-4">
              {item.title}
            </h1>
            <p className="text-base text-studio-muted leading-relaxed">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono mt-6 pt-4 border-t border-studio-border">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {item.date}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {item.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {item.readTime}
              </span>
            </div>
          </div>

          {/* HTML Content delivered directly from data/content/examples/{slug}.html */}
          <div
            className="prose prose-invert max-w-none text-sm sm:text-base text-slate-300 leading-relaxed border-t border-studio-border pt-8"
            dangerouslySetInnerHTML={{ __html: item.htmlContent }}
          />

          {/* Tags */}
          <div className="mt-8 pt-4 border-t border-studio-border flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-studio-panel text-slate-400 border border-studio-border"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Seamless AdSense / Partner Slot */}
          <AdSlot placement="blogBottom" config={adsConfig} className="mt-8" />

          {/* CTA Box */}
          <div className="mt-10 p-6 rounded-2xl bg-studio-surface border border-studio-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Create this animation in Looply</h3>
              <p className="text-xs text-studio-muted">Launch the free visual keyframe editor and customize this pattern.</p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shrink-0"
            >
              Open Studio →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
