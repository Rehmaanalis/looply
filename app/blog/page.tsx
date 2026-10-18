import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import AdSlot from '@/components/ads/AdSlot';
import { getBlogPosts, generateBlogSchema } from '@/lib/content/contentService';
import { getAdsConfig } from '@/lib/ads/config';

export const metadata: Metadata = {
  title: 'Engineering Blog — Looply Studio',
  description:
    'Deep dives into local-first architecture, CSS keyframe optimization, browser compositor threads, and modern web motion performance.',
  openGraph: {
    title: 'Engineering Blog — Looply Studio',
    description:
      'Deep dives into local-first architecture, CSS keyframe optimization, browser compositor threads, and modern web motion performance.',
    type: 'website',
    url: 'https://rehmaanalis.github.io/looply/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Blog — Looply Studio',
    description:
      'Deep dives into local-first architecture, CSS keyframe optimization, browser compositor threads, and modern web motion performance.',
  },
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();
  const adsConfig = await getAdsConfig();
  const blogJsonLd = generateBlogSchema(posts);

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      {/* Schema.org Blog Structured Data (https://schema.org/Blog) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Engineering &amp; Insights
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Looply Engineering Blog
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed">
              Technical articles on motion performance, local-first web architecture, and GPU acceleration.
            </p>
          </div>

          {/* Configurable Seamless AdSense / Partner Slot */}
          <AdSlot placement="blogTop" config={adsConfig} className="mb-10" />

          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-studio-surface border border-studio-border hover:border-indigo-500/50 rounded-2xl p-6 sm:p-8 transition-all group"
              >
                <div className="flex items-center gap-3 text-xs text-studio-muted mb-3 font-mono">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-sans uppercase font-semibold text-[10px]">
                    {post.category}
                  </span>
                  <span>•</span>
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-sm text-studio-muted leading-relaxed mb-6">
                  {post.description}
                </p>

                <div className="flex items-center justify-between border-t border-studio-border pt-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-studio-panel text-slate-400 border border-studio-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom AdSense / Partner Placement */}
          <AdSlot placement="blogBottom" config={adsConfig} className="mt-12" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
