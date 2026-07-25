/**
 * BlogListScreen & BlogPostScreen — a markdown-driven blog, one tree per
 * language.
 *
 * `/:locale/blog` lists only the articles written in that language (mixing all
 * ten in one feed made every index look like duplicated boilerplate to a
 * crawler and buried the reader's own language). Each article advertises its
 * translations via hreflang and carries BlogPosting + FAQPage structured data.
 */

import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { LOCALES, Locale } from '@/i18n/locales';
import { blogPath, playPath, postPath } from '@/i18n/routes';
import { useSeo, SITE_URL } from '@/hooks/useSeo';
import { postsFor, getPost, translationsOf, BlogPost } from '@/content/blog';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

/** Every language's blog index — the hreflang set shared by all indexes. */
const INDEX_ALTERNATES = LOCALES.map((l) => ({ locale: l.code, path: blogPath(l.code) }));

function formatDate(date: string, locale: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function BlogListScreen() {
  const { t, locale } = useI18n();
  const posts = postsFor(locale);

  useSeo({
    title: `${t('blog.title')} · botAgedrez`,
    description: t('blog.subtitle'),
    path: blogPath(locale),
    locale,
    alternates: INDEX_ALTERNATES,
  });

  return (
    <div className="app-aura min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{t('blog.title')}</h1>
        <p className="mt-2 text-slate-400">{t('blog.subtitle')}</p>

        <div className="mt-8 grid gap-4">
          {posts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={postPath(locale, post.slug)}
                className="card block p-4 transition-transform hover:-translate-y-0.5 sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                    {formatDate(post.date, post.lang)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                    {post.readingMinutes} {t('blog.minRead')}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-lg font-bold text-white sm:text-xl">
                  {post.title}
                </h2>
                <p className="mt-1.5 text-sm text-slate-400">{post.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                  {t('blog.read')}
                  <ArrowRightIcon className="h-4 w-4 shrink-0" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      </main>
      <SiteFooter />
      <BlogListJsonLd posts={posts} locale={locale} />
    </div>
  );
}

export function BlogPostScreen() {
  const { slug } = useParams();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const post = slug ? getPost(locale, slug) : undefined;

  useSeo({
    title: post ? `${post.title} · botAgedrez` : 'botAgedrez',
    description: post?.description ?? '',
    path: postPath(locale, slug ?? ''),
    type: 'article',
    locale,
    alternates: post ? translationsOf(post) : undefined,
  });

  useEffect(() => {
    if (!post) {
      const id = setTimeout(() => navigate(blogPath(locale), { replace: true }), 1500);
      return () => clearTimeout(id);
    }
  }, [post, navigate, locale]);

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

  const others = postsFor(locale).filter((p) => p.slug !== post.slug);

  return (
    <div className="app-aura min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link to={blogPath(locale)} className="btn-ghost mb-6 text-sm">
          <ArrowLeftIcon className="h-4 w-4 shrink-0" />
          {t('blog.back')}
        </Link>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            {formatDate(post.date, post.lang)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
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
            to={playPath(locale)}
            className="mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {t('home.ctaPlay')}
          </Link>
        </div>

        {/* Keep readers (and crawlers) moving between the articles of this language. */}
        {others.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold">{t('blog.keepReading')}</h2>
            <div className="mt-4 grid gap-3">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  to={postPath(locale, p.slug)}
                  className="card block p-4 transition-transform hover:-translate-y-0.5"
                >
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <BlogPostJsonLd post={post} />
    </div>
  );
}

/** BlogPosting (+ FAQPage when the article ends in a Q&A) structured data. */
function BlogPostJsonLd({ post }: { post: BlogPost }) {
  const url = SITE_URL + postPath(post.lang, post.slug);
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: post.lang,
      keywords: post.tags.join(', '),
      wordCount: post.readingMinutes * 200,
      author: { '@type': 'Organization', name: 'botAgedrez' },
      publisher: { '@type': 'Organization', name: 'botAgedrez' },
      mainEntityOfPage: url,
      url,
    },
  ];
  if (post.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      inLanguage: post.lang,
      mainEntity: post.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  const data = { '@context': 'https://schema.org', '@graph': graph };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

function BlogListJsonLd({ posts, locale }: { posts: BlogPost[]; locale: Locale }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'botAgedrez',
    url: SITE_URL + blogPath(locale),
    inLanguage: locale,
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      inLanguage: p.lang,
      url: SITE_URL + postPath(p.lang, p.slug),
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
