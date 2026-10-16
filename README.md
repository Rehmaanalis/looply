<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f48c9ef5-3268-4b09-8f98-d74357cb0dad

## Features
- **Visual Canvas & Timeline**: Multi-layer keyframe animation editor with sub-pixel transforms and live canvas dragging.
- **Pure CSS Keyframe Export**: Zero-runtime, GPU-accelerated CSS keyframe stylesheets with standalone HTML previews.
- **Production React Native Reanimated Export (Phase 4)**: Generates production-ready React Native Reanimated (v3.x) animation logic with multiple output modes (Expressions, Sequential Tracks, Progress Interpolation), comprehensive compatibility diagnostics, and zero component lock-in.
- **Local-First Autosave**: Automatic background persistence via IndexedDB (Dexie) with portable JSON backup and restore.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the development server:
   `npm run dev`
3. Run automated animation export tests:
   `npm test`
4. Build for production:
   `npm run build`

