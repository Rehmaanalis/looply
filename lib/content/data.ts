export interface ContentItem {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: string;
  category: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
    codeSnippet?: string;
  }[];
}

export const EXAMPLES: ContentItem[] = [
  {
    slug: 'floating-app-badge',
    title: 'Floating SaaS Feature Badge with Ambient Halo',
    description: 'Learn how to construct a floating 3D-feel badge with pulsating ambient glow rings using keyframes and transform origin.',
    date: '2025-01-15',
    author: 'Looply Team',
    tags: ['CSS Keyframes', 'SaaS Design', 'Badge', 'Micro-interactions'],
    readTime: '4 min read',
    category: 'Micro-interactions',
    summary: 'A multi-layer animation combining scale oscillation, subtle vertical translation, and opacity waves.',
    sections: [
      {
        heading: 'Why micro-interactions convert',
        content: 'Badges and floating feature highlights attract user attention without obstructing reading flow. By staggering the timing between the central icon and outer halo, we produce an organic, breathing effect.'
      },
      {
        heading: 'Layer orchestration',
        content: 'This example uses 2 layers: a background radial gradient halo and the foreground badge icon. The halo scales between 0.85 and 1.2 at a 3-second cycle, while the badge glides up 15px with an ease-in-out easing.'
      },
      {
        heading: 'Generated CSS snippet',
        content: 'Exported from Looply, this snippet uses GPU-accelerated transform: translate3d and will run smoothly at 60 FPS.',
        codeSnippet: `@keyframes looply-anim-halo {
  0% { transform: translate3d(200px, 100px, 0) scale(0.85); opacity: 0.3; }
  50% { transform: translate3d(200px, 100px, 0) scale(1.15); opacity: 0.85; }
  100% { transform: translate3d(200px, 100px, 0) scale(0.85); opacity: 0.3; }
}`
      }
    ]
  },
  {
    slug: 'hero-product-reveal',
    title: 'Staggered Hero Product Showcase Reveal',
    description: 'Sequential entrance animation for landing page heroes featuring 3 layered interface mockups gliding into view.',
    date: '2025-02-01',
    author: 'Looply Team',
    tags: ['Landing Page', 'Hero Animation', 'Staggered Delay'],
    readTime: '6 min read',
    category: 'Landing Page',
    summary: 'Create impactful first impressions with smoothly coordinated staggered entrance delays.',
    sections: [
      {
        heading: 'Orchestrating staggered delays',
        content: 'When displaying multiple product screenshots or UI cards, animating them simultaneously can feel jarring. Adding a 0.2s delay between layer entries guides the viewers eye naturally across your interface.'
      },
      {
        heading: 'Managing fill mode and initial states',
        content: 'Looply exports CSS with animation-fill-mode: forwards and sets initial 0% keyframe opacities, ensuring that cards do not flicker before their entrance delays complete.'
      }
    ]
  },
  {
    slug: 'pulsing-cta-button-glow',
    title: 'Attention-Grabbing Pulsing CTA Glow Effect',
    description: 'High-conversion call-to-action button animation with expanding neon ripples and scale feedback.',
    date: '2025-02-18',
    author: 'Looply Team',
    tags: ['CTA', 'Conversion Rate', 'Button Animation'],
    readTime: '5 min read',
    category: 'Conversion',
    summary: 'Direct visitor focus towards primary conversion points with subtle cyclical CSS animations.',
    sections: [
      {
        heading: 'Conversion psychology',
        content: 'Subtle motion draws peripheral vision. By restricting the amplitude of motion to under 8% scale, the CTA feels alive without appearing distracting or annoying.'
      }
    ]
  }
];

export const BLOG_POSTS: ContentItem[] = [
  {
    slug: 'introducing-looply-phase-2-spring-physics-and-dual-modes',
    title: 'Introducing Looply Phase 2: Simple vs Advanced Modes & Spring Physics',
    description: 'Explore the major enhancements in Looply Phase 2: a guided beginner-friendly workflow, Reanimated-inspired spring physics, cubic-bezier curves, and multi-layer staggering.',
    date: '2025-03-01',
    author: 'Rehmaan Ali',
    tags: ['Phase 2', 'Spring Physics', 'Reanimated', 'CSS Animations'],
    readTime: '8 min read',
    category: 'Release Notes',
    summary: 'Looply Phase 2 bridges the gap between quick guided motion presets and deep physical animation control.',
    sections: [
      {
        heading: 'The Dual Mode Architecture',
        content: 'Not every animation requires manual keyframing from scratch. In Simple Mode, creators select a layer, pick an entrance or motion preset (like Elastic Bounce, Pulse, or Floating), customize the duration pill, and preview immediately. For motion designers and engineers who demand precision, Advanced Mode unlocks individual property tracks, custom cubic-bezier curves, and physical springs.'
      },
      {
        heading: 'Bringing React Native Reanimated Concepts to the Browser',
        content: 'Inspired by Reanimated, Looply now features a full damped harmonic oscillator spring solver. Creators can specify mass, stiffness, and damping, and preview the settling curve in real time. Upon export, Looply samples the spring physics at 24 discrete keyframe points, producing mathematically faithful CSS @keyframes with zero JavaScript runtime.'
      },
      {
        heading: 'Seamless Multi-Layer Staggering',
        content: 'Choreographing multiple layers used to require tedious manual delay calculations. The new Stagger tool distributes step delays across all selected layers with a single click, supporting both top-to-bottom and bottom-to-top z-index ordering.'
      }
    ]
  },
  {
    slug: 'why-local-first-animation-tools-matter',
    title: 'Why Local-First Creative Tools Are the Future of Web Design',
    description: 'Explore the architectural advantages of IndexedDB, zero-backend processing, and client-side CSS compilation for privacy and speed.',
    date: '2025-01-20',
    author: 'Rehmaan Ali',
    tags: ['Local-First', 'Privacy', 'IndexedDB', 'Web Architecture'],
    readTime: '7 min read',
    category: 'Architecture',
    summary: 'Creative workflows demand instant feedback and zero latency. Local-first architectures eliminate cloud bottlenecks while protecting sensitive brand assets.',
    sections: [
      {
        heading: 'The pain of cloud-dependent creative tools',
        content: 'Every designer and developer has experienced lost work due to dropped connections, slow asset uploads to distant servers, or surprise subscription paywalls for basic CSS export. Looply runs 100% in your browser using Dexie.js and IndexedDB.'
      },
      {
        heading: 'Zero data leakage for unreleased products',
        content: 'When working on confidential client redesigns or unreleased product screenshots, uploading assets to third-party servers presents a security concern. With Looply, your images and project data never leave your local hardware.'
      },
      {
        heading: 'Instant compilation without servers',
        content: 'Transforming keyframe matrices into production CSS and ZIP bundles happens directly in the browser thread via JSZip and pure string templates, yielding sub-millisecond exports.'
      }
    ]
  },
  {
    slug: 'css-transforms-vs-javascript-animations',
    title: 'CSS Keyframes vs JavaScript Animations: Performance In-Depth',
    description: 'Understanding browser compositor threads, layout shifts, paint cycles, and why pure CSS keyframes dominate web performance.',
    date: '2025-02-10',
    author: 'Rehmaan Ali',
    tags: ['Performance', 'CSS', 'GPU Acceleration', 'Web Vitals'],
    readTime: '8 min read',
    category: 'Performance',
    summary: 'A deep dive into why CSS transforms and opacity avoid CPU bottlenecks and ensure smooth 60fps animations.',
    sections: [
      {
        heading: 'The browser rendering pipeline',
        content: 'Every frame rendered by the browser passes through layout (reflow), paint, and composite. Animating top, left, width, or height forces expensive reflows. Looply isolates transformations to translate3d, scale, rotation, and opacity, allowing the browser to offload execution directly to the GPU compositor.'
      },
      {
        heading: 'Eliminating main-thread jank',
        content: 'JavaScript animation libraries (like GSAP or Framer Motion) run requestAnimationFrame on the main JavaScript thread. When React or heavy scripts execute, frame rates drop. CSS keyframes run on a dedicated compositor thread and continue smoothly even if the main thread is busy.'
      }
    ]
  },
  {
    slug: 'mastering-cubic-bezier-curves',
    title: 'Mastering Cubic-Bézier Curves for Natural UI Motion',
    description: 'The mathematics and intuition behind physics-inspired easing curves that make digital interfaces feel tactile.',
    date: '2025-02-25',
    author: 'Looply Team',
    tags: ['Easing', 'Cubic-Bézier', 'Motion Design'],
    readTime: '6 min read',
    category: 'Motion Design',
    summary: 'Move beyond linear and default ease. Learn to craft custom acceleration curves that reflect physical inertia.',
    sections: [
      {
        heading: 'The 4 control points',
        content: 'A cubic-bézier curve is defined by P0(0,0), P1(x1,y1), P2(x2,y2), and P3(1,1). The slope at the beginning represents initial velocity, while the slope at the end dictates deceleration.'
      },
      {
        heading: 'Recommended curves for UI elements',
        content: 'For entrances, try cubic-bezier(0.16, 1, 0.3, 1) for a snappy modern arrival with gradual settling. For exits, use cubic-bezier(0.7, 0, 0.84, 0) so elements exit rapidly without hesitation.'
      }
    ]
  }
];

export const GUIDES: ContentItem[] = [
  {
    slug: 'spring-physics-and-cubic-bezier-curves',
    title: 'Complete Guide to Spring Physics and Cubic-Bézier Curves in Looply',
    description: 'How to configure mass, stiffness, and damping, customize visual acceleration curves, and export sampled keyframes.',
    date: '2025-03-02',
    author: 'Looply Documentation',
    tags: ['Spring Physics', 'Cubic Bézier', 'Advanced Mode', 'Tutorial'],
    readTime: '7 min read',
    category: 'Advanced Tutorials',
    summary: 'Deep dive into Phase 2 physics features: harmonic oscillation, settling time, and cubic-bezier control points.',
    sections: [
      {
        heading: 'Understanding Spring Parameters',
        content: 'Stiffness (k) controls tension and speed toward the target. Damping (c) introduces friction that prevents indefinite oscillation. Mass (m) provides inertia and weight. Use presets like Bouncy (k:240, c:11) for playful UI elements or Smooth (k:180, c:20) for enterprise interfaces.'
      },
      {
        heading: 'Visualizing the Settling Curve',
        content: 'Open the Spring Physics modal from the toolbar or inspector. The live SVG visualizer plots displacement over elapsed time and calculates estimated settling time before you apply it to your layer.'
      },
      {
        heading: 'CSS Export Behavior for Springs',
        content: 'Standard CSS does not possess a native spring() timing function. When exporting, Looply samples the spring trajectory at 24 equidistant intervals into @keyframes percentages, ensuring your exported CSS matches the editor preview identically.'
      }
    ]
  },
  {
    slug: 'getting-started-with-looply',
    title: 'Complete Guide: Creating Your First Keyframe Animation in Looply',
    description: 'Step-by-step walkthrough from importing your first PNG asset to timeline keyframing and downloading a ZIP package.',
    date: '2025-01-10',
    author: 'Looply Documentation',
    tags: ['Tutorial', 'Basics', 'Workflow', 'Export'],
    readTime: '5 min read',
    category: 'Tutorials',
    summary: 'Follow this comprehensive tutorial to master the Looply workspace in under 5 minutes.',
    sections: [
      {
        heading: 'Step 1: Launching the Studio and Importing Images',
        content: 'Click Launch Studio in the header. Drag and drop any PNG, JPEG, WebP, or SVG file directly into the left Asset Panel or click the Upload button. Your image will be loaded locally into your private browser storage.'
      },
      {
        heading: 'Step 2: Placing Layers on the Canvas Stage',
        content: 'Click Add to Stage on any uploaded asset. The layer appears on the center canvas. You can drag it to position, adjust width/height and opacity in the right-hand Properties Inspector, and set transform origin.'
      },
      {
        heading: 'Step 3: Timeline & Keyframing',
        content: 'Move the playhead to any timestamp (e.g. 0s) and click + Keyframe. Move the playhead forward (e.g. 1.5s), adjust position or rotation, and add another keyframe. Press Space or Play to preview the motion in real time!'
      },
      {
        heading: 'Step 4: Exporting Production CSS and ZIP',
        content: 'Click Export in the top toolbar. Choose ZIP Package to download index.html, animation.css, and your bundled assets, or copy Self-Contained CSS for immediate pasting into your website.'
      }
    ]
  },
  {
    slug: 'optimizing-images-for-web-animation',
    title: 'Optimizing Graphic Assets for Fast, Crisp CSS Animations',
    description: 'Best practices for SVG sanitization, PNG transparency, resolution scaling, and mobile viewport performance.',
    date: '2025-01-28',
    author: 'Looply Documentation',
    tags: ['Image Optimization', 'SVG', 'PNG', 'Assets'],
    readTime: '6 min read',
    category: 'Best Practices',
    summary: 'Ensure your animation assets load instantly, scale crisply on Retina screens, and maintain clean alpha transparency.',
    sections: [
      {
        heading: 'Vector SVGs vs Raster Images',
        content: 'For geometric logos, icons, and badges, SVG delivers crisp edges at any scale with minimal file size. For photographic imagery or complex illustrations, compress transparent PNGs or WebP files using tools like Squoosh or TinyPNG before importing.'
      },
      {
        heading: 'Retina resolution scaling',
        content: 'Export raster assets at 2x native display size (e.g., 400x400 for a 200x200 layer) to maintain sharp definition on high-density mobile screens without triggering blurriness.'
      }
    ]
  },
  {
    slug: 'integrating-exported-animations-into-react-and-nextjs',
    title: 'How to Integrate Looply CSS Animations into React & Next.js Projects',
    description: 'Learn how to cleanly import generated CSS into React components, Next.js App Router, or Tailwind projects.',
    date: '2025-02-15',
    author: 'Looply Documentation',
    tags: ['React', 'Next.js', 'Tailwind', 'Integration'],
    readTime: '5 min read',
    category: 'Developer Guide',
    summary: 'A seamless workflow for adding your exported Looply animations into modern React applications.',
    sections: [
      {
        heading: 'Method 1: Direct CSS Module or Global Stylesheet',
        content: 'Copy animation.css into your styles folder or rename it to animation.module.css. Place assets in your public/ folder, and render the exact stage hierarchy provided in the export modal.'
      },
      {
        heading: 'Method 2: Combining with Tailwind CSS',
        content: 'Looply CSS works harmoniously alongside Tailwind classes. You can add tailwind utility classes like rounded-2xl shadow-xl directly onto the .looply-stage container.'
      }
    ]
  }
];
