import type { Metadata } from 'next';
import './globals.css';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-studio-bg text-studio-text antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
