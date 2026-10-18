import fs from 'fs/promises';
import path from 'path';
import { BLOG_POSTS as FALLBACK_BLOGS, EXAMPLES as FALLBACK_EXAMPLES } from './data';

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  tags: string[];
  readTime: string;
  category: string;
  summary: string;
  htmlFile?: string;
}

export interface BlogPost extends BlogPostMeta {
  htmlContent: string;
}

export interface ExampleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  tags: string[];
  readTime: string;
  category: string;
  summary: string;
  htmlFile?: string;
}

export interface Example extends ExampleMeta {
  htmlContent: string;
}

export interface HowItWorksStep {
  num: string;
  slug: string;
  title: string;
  desc: string;
  htmlFile?: string;
  stepHtml?: string;
}

export interface HowItWorksData {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  overviewHtml: string;
  steps: HowItWorksStep[];
}

const DATA_CONTENT_DIR = path.join(process.cwd(), 'data', 'content');

/**
 * Retrieve all blog posts from data/content/blogs/index.json
 */
export async function getBlogPosts(): Promise<BlogPostMeta[]> {
  try {
    const indexPath = path.join(DATA_CONTENT_DIR, 'blogs', 'index.json');
    const raw = await fs.readFile(indexPath, 'utf-8');
    const posts: BlogPostMeta[] = JSON.parse(raw);
    return posts;
  } catch (err) {
    console.warn('[contentService] Falling back to embedded blog posts:', err);
    return FALLBACK_BLOGS.map((b) => ({
      slug: b.slug,
      title: b.title,
      description: b.description,
      date: b.date,
      datePublished: `${b.date}T00:00:00Z`,
      author: b.author,
      tags: b.tags,
      readTime: b.readTime,
      category: b.category,
      summary: b.summary,
    }));
  }
}

/**
 * Retrieve a single blog post by slug along with its HTML content
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  const meta = posts.find((p) => p.slug === slug);
  if (!meta) return null;

  let htmlContent = '';
  try {
    const htmlFileName = meta.htmlFile || `${slug}.html`;
    const htmlPath = path.join(DATA_CONTENT_DIR, 'blogs', htmlFileName);
    htmlContent = await fs.readFile(htmlPath, 'utf-8');
  } catch (err) {
    console.warn(`[contentService] Could not read HTML for blog ${slug}, generating from sections:`, err);
    const fallback = FALLBACK_BLOGS.find((b) => b.slug === slug);
    if (fallback) {
      htmlContent = fallback.sections
        .map(
          (s) => `
        <section class="space-y-3 mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">${s.heading}</h2>
          <p class="text-slate-300 leading-relaxed">${s.content}</p>
          ${s.codeSnippet ? `<pre class="p-4 rounded-xl bg-[#090b10] border border-studio-border font-mono text-xs text-emerald-300 overflow-x-auto my-4"><code>${s.codeSnippet}</code></pre>` : ''}
        </section>`
        )
        .join('');
    }
  }

  return {
    ...meta,
    htmlContent,
  };
}

/**
 * Retrieve all animation examples from data/content/examples/index.json
 */
export async function getExamples(): Promise<ExampleMeta[]> {
  try {
    const indexPath = path.join(DATA_CONTENT_DIR, 'examples', 'index.json');
    const raw = await fs.readFile(indexPath, 'utf-8');
    const examples: ExampleMeta[] = JSON.parse(raw);
    return examples;
  } catch (err) {
    console.warn('[contentService] Falling back to embedded examples:', err);
    return FALLBACK_EXAMPLES.map((e) => ({
      slug: e.slug,
      title: e.title,
      description: e.description,
      date: e.date,
      datePublished: `${e.date}T00:00:00Z`,
      author: e.author,
      tags: e.tags,
      readTime: e.readTime,
      category: e.category,
      summary: e.summary,
    }));
  }
}

/**
 * Retrieve a single example by slug along with its HTML content
 */
export async function getExample(slug: string): Promise<Example | null> {
  const examples = await getExamples();
  const meta = examples.find((e) => e.slug === slug);
  if (!meta) return null;

  let htmlContent = '';
  try {
    const htmlFileName = meta.htmlFile || `${slug}.html`;
    const htmlPath = path.join(DATA_CONTENT_DIR, 'examples', htmlFileName);
    htmlContent = await fs.readFile(htmlPath, 'utf-8');
  } catch (err) {
    console.warn(`[contentService] Could not read HTML for example ${slug}:`, err);
    const fallback = FALLBACK_EXAMPLES.find((e) => e.slug === slug);
    if (fallback) {
      htmlContent = fallback.sections
        .map(
          (s) => `
        <section class="space-y-3 mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">${s.heading}</h2>
          <p class="text-slate-300 leading-relaxed">${s.content}</p>
          ${s.codeSnippet ? `<pre class="p-4 rounded-xl bg-[#090b10] border border-studio-border font-mono text-xs text-emerald-300 overflow-x-auto my-4"><code>${s.codeSnippet}</code></pre>` : ''}
        </section>`
        )
        .join('');
    }
  }

  return {
    ...meta,
    htmlContent,
  };
}

/**
 * Retrieve How It Works data and step HTML fragments from data/content/how-it-works/
 */
export async function getHowItWorks(): Promise<HowItWorksData> {
  try {
    const indexPath = path.join(DATA_CONTENT_DIR, 'how-it-works', 'index.json');
    const raw = await fs.readFile(indexPath, 'utf-8');
    const data: HowItWorksData = JSON.parse(raw);

    // Read overview HTML
    let overviewHtml = '';
    try {
      const overviewPath = path.join(DATA_CONTENT_DIR, 'how-it-works', data.overviewHtml || 'overview.html');
      overviewHtml = await fs.readFile(overviewPath, 'utf-8');
    } catch {
      overviewHtml = `<p class="text-slate-300 leading-relaxed">${data.description}</p>`;
    }

    // Read step HTML files
    const stepsWithHtml = await Promise.all(
      data.steps.map(async (step) => {
        let stepHtml = '';
        if (step.htmlFile) {
          try {
            const stepPath = path.join(DATA_CONTENT_DIR, 'how-it-works', step.htmlFile);
            stepHtml = await fs.readFile(stepPath, 'utf-8');
          } catch {
            stepHtml = `<p class="text-slate-300">${step.desc}</p>`;
          }
        }
        return {
          ...step,
          stepHtml,
        };
      })
    );

    return {
      ...data,
      overviewHtml,
      steps: stepsWithHtml,
    };
  } catch (err) {
    console.warn('[contentService] Falling back to default how-it-works data:', err);
    return {
      title: 'How Looply Works: From Vector Images to 60 FPS Production CSS & Reanimated Animations',
      description: 'Learn how Looply transforms imported images into production animations.',
      datePublished: '2025-01-10T08:00:00Z',
      dateModified: '2025-03-15T08:00:00Z',
      overviewHtml: '<p class="text-slate-300">A streamlined local-first workflow bridging visual animation tools with clean, production-grade frontend code.</p>',
      steps: [],
    };
  }
}

// ----------------------------------------------------------------------------
// Schema.org Structured Data Generators (https://schema.org/Blog)
// ----------------------------------------------------------------------------

export function generateBlogSchema(posts: BlogPostMeta[], siteUrl: string = 'https://rehmaanalis.github.io/looply') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${siteUrl}/blog#blog`,
    name: 'Looply Engineering Blog',
    description: 'Deep dives into local-first architecture, CSS keyframe optimization, browser compositor threads, and modern web motion performance.',
    url: `${siteUrl}/blog`,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Looply Studio',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon-512.png`,
      },
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      '@id': `${siteUrl}/blog/${post.slug}#article`,
      headline: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.datePublished,
      dateModified: post.dateModified || post.datePublished,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Looply Studio',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/icon-512.png`,
        },
      },
      keywords: post.tags,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${siteUrl}/blog/${post.slug}`,
      },
    })),
  };
}

export function generateBlogPostSchema(post: BlogPost, siteUrl: string = 'https://rehmaanalis.github.io/looply') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteUrl}/blog/${post.slug}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Looply Studio',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon-512.png`,
      },
    },
    inLanguage: 'en-US',
    articleBody: post.summary,
    keywords: post.tags.join(', '),
  };
}
