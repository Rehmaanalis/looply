import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cpu, Code2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-studio-border bg-studio-bg text-studio-muted py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-studio-border">
          {/* Brand col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-brand-500 p-0.5">
                <div className="w-full h-full bg-studio-surface rounded-[6px] flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
              </div>
              <span className="font-bold text-lg text-white">Looply</span>
            </Link>
            <p className="text-xs leading-relaxed text-studio-muted">
              The visual keyframe animation studio for the modern web. Design animations with intuitive timeline controls, motion curves, and clean CSS export.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/app" className="hover:text-white transition-colors text-indigo-400 font-medium">
                  Launch Studio →
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Studio Features
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/css-animation-generator" className="hover:text-white transition-colors">
                  CSS Animation Generator
                </Link>
              </li>
              <li>
                <Link href="/image-animation-editor" className="hover:text-white transition-colors">
                  Image Animation Editor
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="hover:text-white transition-colors">
                  Use Cases & Workflows
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/examples" className="hover:text-white transition-colors">
                  Animation Examples
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-white transition-colors">
                  Documentation & Guides
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/guides/getting-started-with-looply" className="hover:text-white transition-colors">
                  Quickstart Tutorial
                </Link>
              </li>
              <li>
                <Link href="/guides/optimizing-images-for-web-animation" className="hover:text-white transition-colors">
                  Asset Optimization Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">About & Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Looply
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Looply Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for web creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
