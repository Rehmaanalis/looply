import type { Metadata } from 'next';
import './globals.css';
import AdSenseScript from '@/components/ads/AdSenseScript';

export const metadata: Metadata = {
  title: 'Looply — Local-First Visual Animation Studio',
  description:
    'Local-First Visual Animation Studio: upload images, build keyframe animations on a visual canvas and timeline, preview in real time, and export production-ready CSS animations and ZIP packages.',
  openGraph: {
    title: 'Looply — Local-First Visual Animation Studio',
    description:
      'Local-First Visual Animation Studio: upload images, build keyframe animations on a visual canvas and timeline, preview in real time, and export production-ready CSS animations and ZIP packages.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Looply — Local-First Visual Animation Studio',
    description:
      'Local-First Visual Animation Studio: upload images, build keyframe animations on a visual canvas and timeline, preview in real time, and export production-ready CSS animations and ZIP packages.',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Looply Studio',
  url: 'https://rehmaanalis.github.io/looply',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'All',
  description:
    'Local-first visual CSS and React Native Reanimated animation editor. Zero runtime overhead, 60 FPS compositor animations, and privacy-first local storage.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <AdSenseScript />
      </head>
      <body className="min-h-screen bg-studio-bg text-studio-text antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
