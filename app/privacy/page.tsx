import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { ShieldCheck, HardDrive, AlertTriangle, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Local Storage Notice — Looply',
  description:
    'Looply is 100% local-first. We collect zero analytics, maintain no backend databases, and your graphics never leave your device.',
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-studio-bg selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 block">
              Transparency First
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Privacy &amp; Local Storage Policy
            </h1>
            <p className="mt-4 text-base text-studio-muted leading-relaxed max-w-2xl mx-auto">
              How Looply handles your data, projects, and graphic assets with complete local-first protection.
            </p>
          </div>

          <div className="bg-studio-surface border border-studio-border rounded-2xl p-8 space-y-8 text-sm text-slate-300 leading-relaxed mb-12">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-lg font-bold text-white">1. Zero Cloud Transmission</h2>
              </div>
              <p className="text-studio-muted">
                Looply operates entirely as a client-side static application. When you upload images, name layers, or set keyframe values, no data is sent across the network. There are no backend database servers, no API proxy endpoints, and no cloud file buckets.
              </p>
            </div>

            <div className="border-t border-studio-border pt-6">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <HardDrive className="w-5 h-5" />
                <h2 className="text-lg font-bold text-white">2. Browser Storage &amp; IndexedDB</h2>
              </div>
              <p className="text-studio-muted mb-3">
                Your projects and assets are stored directly on your computer inside your browser&apos;s <strong>IndexedDB</strong> database via <strong>Dexie.js</strong>. This allows autosaving between sessions while keeping your work completely private.
              </p>
            </div>

            <div className="border-t border-studio-border pt-6">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-lg font-bold text-white">3. Important: Browser Storage Eviction</h2>
              </div>
              <p className="text-studio-muted mb-2">
                Because data is stored inside browser storage, the following user or system actions can erase local projects:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300 mb-3">
                <li>Clearing your browser cache, cookies, or site data</li>
                <li>Browsing in Private / Incognito mode (data is cleared upon closing the window)</li>
                <li>Operating system disk-cleanup tools that reclaim temporary browser space</li>
                <li>Browser storage eviction under low-disk-space scenarios</li>
              </ul>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong>Best Practice:</strong> Always use the <strong>&quot;Import/Export JSON Backup&quot;</strong> or <strong>&quot;Export ZIP&quot;</strong> feature to save project archives to your local drive for safe permanent storage.
              </div>
            </div>

            <div className="border-t border-studio-border pt-6">
              <h2 className="text-lg font-bold text-white mb-2">4. Analytics &amp; Cookies</h2>
              <p className="text-studio-muted">
                Looply does not use tracking cookies, third-party advertising trackers, or telemetry scripts. We do not track which files you upload or what animations you create.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Open Looply Studio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
