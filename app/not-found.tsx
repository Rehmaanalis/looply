import React from 'react';
import Link from 'next/link';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Home, Play, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold font-mono text-indigo-400">
            404
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-xs text-studio-muted mb-8 leading-relaxed">
            The page or keyframe you were looking for doesn&apos;t exist or has moved.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-studio-surface hover:bg-studio-panel border border-studio-border text-xs font-medium text-white transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-studio-muted" />
              Homepage
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-md shadow-indigo-600/30"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Launch Studio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
