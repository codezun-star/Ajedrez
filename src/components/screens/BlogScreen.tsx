/**
 * BlogListScreen & BlogPostScreen — a markdown-driven blog, one tree per
 * language.
 *
 * `/:locale/blog` lists only the articles written in that language (mixing all
 * ten in one feed made every index look like duplicated boilerplate to a
 * crawler and buried the reader's own language). Each article advertises its
 * translations via hreflang.
 *
 * Structured data is NOT emitted from here. Every indexable URL is prerendered
 * with its own `<head>` (see `scripts/prerender.mjs`), including a BlogPosting
 * or Blog node anchored to the site's `@id`s. Rendering a second graph from
 * React only added an `@id`-less copy that contradicted it — two `FAQPage`
 * nodes for one page, and a `WebApplication` claiming a different URL.
 */

import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { LOCALES } from '@/i18n/locales';
import { blogPath, playPath, postPath } from '@/i18n/routes';
import { useSeo } from '@/hooks/useSeo';
import { postsFor, getPost, loadPostContent, translationsOf, BlogPost } from '@/content/blog';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { NotFoundScreen } from '@/components/screens/NotFoundScreen';
import { AdAnchor, AdRail, AdSlot, ArticleWithAds, NativeAd } from '@/components/ads';

/** How many article cards go between two ads in the index. */
const AD_EVERY_N_POSTS = 3;

/** True when a unit belongs after the card at `i`, never after the last one. */
function adAfterCard(i: number, total: number): boolean {
  return i % AD_EVERY_N_POSTS === AD_EVERY_N_POSTS - 1 && i < total - 1;
}

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
      <SiteHeader title={t('blog.title')} revealTitle />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-12">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{t('blog.title')}</h1>
        <p className="mt-2 text-slate-400">{t('blog.subtitle')}</p>

        <AdSlot className="mt-6" />

        <div className="mt-8 grid gap-4">
          {posts.map((post, i) => (
            <Fragment key={post.slug}>
              <motion.article
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

              {/* A unit every few cards — often enough to be seen while
                  scanning, rare enough that the page still reads as a list of
                  articles. Never after the last card, where the closing strip
                  already sits. */}
              {adAfterCard(i, posts.length) &&
                (i === AD_EVERY_N_POSTS - 1 ? (
                  <NativeAd className="my-4" />
                ) : (
                  <AdSlot ladder="inline" className="my-4" />
                ))}
            </Fragment>
          ))}
        </div>

        <AdSlot className="mt-8" />
      </main>
      <SiteFooter />
      <AdAnchor />
    </div>
  );
}

/**
 * A dead slug is a dead URL, so it renders the 404 (which marks itself
 * `noindex`) instead of the old flash-then-redirect. The article itself lives
 * in `Article` so its hooks never run for a slug that doesn't exist.
 */
export function BlogPostScreen() {
  const { slug } = useParams();
  const { locale } = useI18n();
  const post = slug ? getPost(locale, slug) : undefined;
  return post ? <Article post={post} /> : <NotFoundScreen />;
}

function Article({ post }: { post: BlogPost }) {
  const { t, locale } = useI18n();

  useSeo({
    title: `${post.title} · botAgedrez`,
    description: post.description,
    path: postPath(post.lang, post.slug),
    type: 'article',
    locale,
    alternates: translationsOf(post),
  });

  // The body is a chunk of its own, fetched only for the article being read —
  // see `loadPostContent`. Until it lands the prose is a skeleton; everything
  // around it (title, dates, links) is already metadata we hold.
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setHtml(null);
    loadPostContent(post).then((content) => {
      if (live) setHtml(content.html);
    });
    return () => {
      live = false;
    };
  }, [post]);

  const others = postsFor(locale).filter((p) => p.slug !== post.slug);

  return (
    <div className="app-aura min-h-screen">
      <SiteHeader title={post.title} back={blogPath(locale)} revealTitle />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-12">
        {/* On a phone the app bar's back button does this. */}
        <Link to={blogPath(locale)} className="btn-ghost mb-6 hidden text-sm md:inline-flex">
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

        <AdSlot className="mt-5" />

        {html === null ? <ArticleSkeleton /> : <ArticleWithAds html={html} lang={post.lang} />}

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-center shadow-glow sm:p-6">
          <p className="text-lg font-semibold text-[#ffffff]">{t('home.ctaTitle')}</p>
          <Link
            to={playPath(locale)}
            className="mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {t('home.ctaPlay')}
          </Link>
        </div>

        <AdSlot ladder="inline" className="mt-10" />

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
        <AdSlot className="mt-10" />
      </main>
      {/* Only from 2xl up, where the reading column leaves real empty margin. */}
      <AdRail side="left" />
      <AdRail side="right" />
      <SiteFooter />
      <AdAnchor />
    </div>
  );
}

/** Placeholder lines while the article's own chunk is in flight. */
function ArticleSkeleton() {
  return (
    <div className="mt-4 animate-pulse space-y-3" aria-hidden="true">
      <div className="h-7 w-3/4 rounded bg-white/10" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`h-4 rounded bg-white/5 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
