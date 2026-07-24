/**
 * BlogListScreen & BlogPostScreen — a simple markdown-driven blog.
 *
 * The list shows every article (each tagged with its own language, for SEO
 * across markets); the post view renders the article HTML with JSON-LD
 * structured data for rich results.
 */

import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { LOCALES } from '@/i18n/locales';
import { useSeo, SITE_URL } from '@/hooks/useSeo';
import { BLOG_POSTS, getPost, BlogPost } from '@/content/blog';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

function langMeta(code: string) {
  return LOCALES.find((l) => l.code === code);
}

function formatDate(date: string, locale: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function BlogListScreen() {
  const { t, locale } = useI18n();
  useSeo({
    title: `${t('blog.title')} · botAgedrez`,
    description: t('blog.subtitle'),
    path: '/blog',
  });

  return (
    <div className="app-aura min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{t('blog.title')}</h1>
        <p className="mt-2 text-slate-400">{t('blog.subtitle')}</p>

        <div className="mt-8 grid gap-4">
          {BLOG_POSTS.map((post, i) => {
            const lm = langMeta(post.lang);
            return (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="card block p-4 transition-transform hover:-translate-y-0.5 sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
                      {lm?.flag} {lm?.name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {formatDate(post.date, post.lang)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {post.readingMinutes} {t('blog.minRead')}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-bold text-white sm:text-xl">{post.title}</h2>
                  <p className="mt-1.5 text-sm text-slate-400">{post.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                    {t('blog.read')}
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </main>
      <SiteFooter />
      <BlogListJsonLd posts={BLOG_POSTS} locale={locale} />
    </div>
  );
}

export function BlogPostScreen() {
  const { slug } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const post = slug ? getPost(slug) : undefined;

  useSeo({
    title: post ? `${post.title} · botAgedrez` : 'botAgedrez',
    description: post?.description ?? '',
    path: `/blog/${slug ?? ''}`,
    type: 'article',
  });

  useEffect(() => {
    if (!post) {
      const id = setTimeout(() => navigate('/blog', { replace: true }), 1500);
      return () => clearTimeout(id);
    }
  }, [post, navigate]);

  if (!post) {
    return (
      <div className="app-aura min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-slate-400">404 — {t('blog.back')}…</p>
        </main>
      </div>
    );
  }

  const lm = langMeta(post.lang);

  return (
    <div className="app-aura min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/blog" className="btn-ghost mb-6 text-sm">
          <ArrowLeftIcon className="h-4 w-4" />
          {t('blog.back')}
        </Link>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
            {lm?.flag} {lm?.name}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatDate(post.date, post.lang)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {post.readingMinutes} {t('blog.minRead')}
          </span>
        </div>

        <article
          lang={post.lang}
          className="article mt-4"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-center shadow-glow sm:p-6">
          <p className="text-lg font-semibold text-[#ffffff]">{t('home.ctaTitle')}</p>
          <Link
            to="/jugar"
            className="mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {t('home.ctaPlay')}
          </Link>
        </div>
      </main>
      <SiteFooter />
      <BlogPostJsonLd post={post} />
    </div>
  );
}

/** Inject BlogPosting structured data for a post. */
function BlogPostJsonLd({ post }: { post: BlogPost }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: post.lang,
    author: { '@type': 'Organization', name: 'botAgedrez' },
    publisher: { '@type': 'Organization', name: 'botAgedrez' },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BlogListJsonLd({ posts, locale }: { posts: BlogPost[]; locale: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'botAgedrez Blog',
    inLanguage: locale,
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.date,
      inLanguage: p.lang,
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
