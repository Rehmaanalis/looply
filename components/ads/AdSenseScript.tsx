import React from 'react';
import Script from 'next/script';
import { getAdsConfig } from '@/lib/ads/config';

export default async function AdSenseScript() {
  const config = await getAdsConfig();

  // If globally disabled or in test mode without live client, do not load the external AdSense script
  if (!config.enabled || config.testMode || !config.client || config.client.includes('0000')) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.client}`}
      crossOrigin="anonymous"
    />
  );
}
