import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { EXAMPLES } from '@/lib/content/data';
import { ChevronLeft, Calendar, User, Clock, Tag, Play } from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return EXAMPLES.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = EXAMPLES.find((e) => e.slug === params.slug);
  if (!item) return { title: 'Not Found' };

  return {
    title: `${item.title} — Looply Animation Example`,
    description: item.description,
  };
}

export default function ExampleDetailPage({ params }: Props) {
  const item = EXAMPLES.find((e) => e.slug === params.slug);
  if (!item) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
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

          {/* Content Sections */}
          <div className="space-y-8 text-sm text-slate-300 leading-relaxed border-t border-studio-border pt-8">
            {item.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {sec.heading}
                </h2>
                <p>{sec.content}</p>

                {sec.codeSnippet && (
                  <pre className="p-4 rounded-xl bg-[#090b10] border border-studio-border font-mono text-xs text-emerald-300 overflow-x-auto my-4">
                    {sec.codeSnippet}
                  </pre>
                )}
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="mt-14 p-6 rounded-2xl bg-studio-surface border border-studio-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Want to customize this effect?</h3>
              <p className="text-xs text-studio-muted">Open the visual studio to modify timing, coordinates, and layer assets.</p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Open in Studio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
