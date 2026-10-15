'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Menu, X, Sparkles, Layers, ShieldCheck, Download } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-studio-bg/90 border-b border-studio-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-brand-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-studio-surface rounded-[7px] flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              Looply
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Studio
              </span>
            </span>
            <span className="text-[10px] text-studio-muted -mt-1 hidden sm:inline">Visual Animation Studio</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-studio-muted">
          <Link href="/features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/examples" className="hover:text-white transition-colors">
            Examples
          </Link>
          <Link href="/guides" className="hover:text-white transition-colors">
            Guides
          </Link>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-white" />
            Launch Studio
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-studio-muted hover:text-white hover:bg-studio-surface"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-studio-border bg-studio-surface px-4 py-5 space-y-3">
          <Link
            href="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            Features
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            How It Works
          </Link>
          <Link
            href="/use-cases"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            Use Cases
          </Link>
          <Link
            href="/examples"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            Examples
          </Link>
          <Link
            href="/guides"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            Guides & Tutorials
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            Blog
          </Link>
          <div className="pt-3 border-t border-studio-border">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Studio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
