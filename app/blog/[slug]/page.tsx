import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import AdSlot from '@/components/ads/AdSlot';
import { getBlogPosts, getBlogPost, generateBlogPostSchema } from '@/lib/content/contentService';
import { getAdsConfig } from '@/lib/ads/config';
import { ChevronLeft, Calendar, User, Clock } from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: 'Article Not Found — Looply Blog' };

  return {
    title: `${post.title} — Looply Blog`,
    description: post.description,
    openGraph: {
      title: `${post.title} — Looply Blog`,
      description: post.description,
      type: 'article',
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified || post.datePublished,
      authors: [post.author],
      tags: post.tags,
      url: `https://rehmaanalis.github.io/looply/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — Looply Blog`,
      description: post.description,
    },
  };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const adsConfig = await getAdsConfig();
  const blogPostingJsonLd = generateBlogPostSchema(post);

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      {/* Schema.org BlogPosting Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />

      <Header />

      <main className="flex-1 py-12 sm:py-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-studio-muted hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to all articles
          </Link>

          <header className="mb-10">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-base text-studio-muted leading-relaxed">
              {post.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono mt-6 pt-4 border-t border-studio-border">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {post.readTime}
              </span>
            </div>
          </header>

          {/* HTML Content delivered directly from data/content/blogs/{slug}.html */}
          <div
            className="prose prose-invert max-w-none text-sm sm:text-base text-slate-300 leading-relaxed border-t border-studio-border pt-8"
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />

          {/* Tags */}
          <div className="mt-8 pt-4 border-t border-studio-border flex flex-wrap gap-2">
            {post.tags.map((tag) => (
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

          {/* CTA Banner */}
          <div className="mt-10 p-6 rounded-2xl bg-studio-surface border border-studio-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Experience high-performance keyframing</h3>
              <p className="text-xs text-studio-muted">Animate graphics locally with zero runtime overhead.</p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shrink-0"
            >
              Launch Studio →
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
