import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { GUIDES } from '@/lib/content/data';
import { ChevronLeft, Calendar, User, Clock, Play } from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return GUIDES.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) return { title: 'Not Found' };

  return {
    title: `${guide.title} — Looply Guide`,
    description: guide.description,
  };
}

export default function GuideDetailPage({ params }: Props) {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-12 sm:py-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs text-studio-muted hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to all guides
          </Link>

          <header className="mb-10">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {guide.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 mb-4 leading-tight">
              {guide.title}
            </h1>
            <p className="text-base text-studio-muted leading-relaxed">
              {guide.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono mt-6 pt-4 border-t border-studio-border">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {guide.date}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {guide.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {guide.readTime}
              </span>
            </div>
          </header>

          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-studio-border pt-8">
            {guide.sections.map((sec, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {sec.heading}
                </h2>
                <p className="text-studio-muted leading-relaxed">{sec.content}</p>

                {sec.codeSnippet && (
                  <pre className="p-4 rounded-xl bg-[#090b10] border border-studio-border font-mono text-xs text-emerald-300 overflow-x-auto my-4">
                    {sec.codeSnippet}
                  </pre>
                )}
              </section>
            ))}
          </div>

          <div className="mt-14 p-6 rounded-2xl bg-studio-surface border border-studio-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Ready to test these techniques?</h3>
              <p className="text-xs text-studio-muted">Launch Looply in your browser to follow along with this tutorial.</p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Open Studio
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
