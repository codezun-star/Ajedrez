/**
 * HomeScreen — the language hub at `/:locale`, the page a market lands on.
 *
 * Hero, feature grid, a three-step "how it works", that language's guides, an
 * FAQ (backed by FAQPage structured data so it can win a rich result) and a
 * closing call to action. Fully translated and SEO-tagged, with hreflang links
 * to its nine siblings.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CpuIcon,
  BotIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  PaletteIcon,
  LanguagesIcon,
  PlayIcon,
  ArrowRightIcon,
  Gamepad2Icon,
  MousePointerClickIcon,
  TrophyIcon,
  CalendarIcon,
  ClockIcon,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { LOCALES, Locale } from '@/i18n/locales';
import { blogPath, homePath, playPath, postPath } from '@/i18n/routes';
import { useSeo, SITE_URL } from '@/hooks/useSeo';
import { postsFor } from '@/content/blog';
import { PieceGlyph } from '@/components/board/PieceGlyph';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

/** Every language's hub — the hreflang set shared by all hub pages. */
const HUB_ALTERNATES = LOCALES.map((l) => ({ locale: l.code, path: homePath(l.code) }));

export function HomeScreen() {
  const { t, locale } = useI18n();
  useSeo({
    title: t('home.seoTitle'),
    description: t('home.seoDescription'),
    path: homePath(locale),
    image: `${SITE_URL}/og.png`,
    locale,
    alternates: HUB_ALTERNATES,
  });

  const posts = postsFor(locale);
  const faq = [1, 2, 3, 4].map((n) => ({ q: t(`faq.q${n}`), a: t(`faq.a${n}`) }));

  const features = [
    { icon: CpuIcon, title: t('home.fEngineTitle'), desc: t('home.fEngineDesc') },
    { icon: BotIcon, title: t('home.fAiTitle'), desc: t('home.fAiDesc') },
    { icon: TrendingUpIcon, title: t('home.fEloTitle'), desc: t('home.fEloDesc') },
    { icon: ShieldCheckIcon, title: t('home.fPrivacyTitle'), desc: t('home.fPrivacyDesc') },
    { icon: PaletteIcon, title: t('home.fStylesTitle'), desc: t('home.fStylesDesc') },
    { icon: LanguagesIcon, title: t('home.fLangsTitle'), desc: t('home.fLangsDesc') },
  ];

  const steps = [
    { icon: Gamepad2Icon, title: t('home.how1Title'), desc: t('home.how1Desc') },
    { icon: MousePointerClickIcon, title: t('home.how2Title'), desc: t('home.how2Desc') },
    { icon: TrophyIcon, title: t('home.how3Title'), desc: t('home.how3Desc') },
  ];

  const stats = [
    { value: '4', label: t('home.statLevelsLabel') },
    { value: 'ELO', label: t('home.statEloLabel') },
    { value: '10', label: t('home.statLangsLabel') },
  ];

  return (
    <div className="app-aura min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:py-24">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          {/* The lockup carries the brand name, so the H1 below is free to be
              the keyword-bearing headline. */}
          <BrandLogo className="h-32 xs:h-40 sm:h-48 lg:h-56" />
          {/* Keyword-bearing H1 — the brand itself is already above in the badge. */}
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight xs:text-4xl sm:text-5xl lg:text-6xl">
            {t('home.h1')}
          </h1>
          <p className="mt-4 max-w-lg text-base text-slate-300 sm:text-lg">{t('home.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={playPath(locale)} className="btn-primary px-5 py-3 text-base sm:px-6">
              <PlayIcon className="h-5 w-5 shrink-0" />
              <span className="truncate">{t('home.ctaPlay')}</span>
            </Link>
            <Link to={blogPath(locale)} className="btn-ghost px-5 py-3 text-base sm:px-6">
              <span className="truncate">{t('home.ctaBlog')}</span>
              <ArrowRightIcon className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 sm:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <div className="font-display text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Decorative mini board */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mx-auto w-full max-w-md"
        >
          <HeroBoard />
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t('home.featuresTitle')}</h2>
          <p className="mt-3 text-slate-400">{t('home.featuresSubtitle')}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 3) * 0.06 + 0.1 }}
              className="card p-5"
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                <f.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">{t('home.howTitle')}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl bg-white/5 p-6 text-center">
              <div className="absolute -top-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {i + 1}
              </div>
              <div className="mx-auto mt-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-semibold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guides written in this language */}
      {posts.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold xs:text-3xl">{t('home.guidesTitle')}</h2>
            <p className="mt-3 text-slate-400">{t('home.guidesSubtitle')}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={postPath(locale, post.slug)}
                className="card block p-5 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                    {post.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                    {post.readingMinutes} {t('blog.minRead')}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-white sm:text-xl">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">{post.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                  {t('blog.read')}
                  <ArrowRightIcon className="h-4 w-4 shrink-0" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ — also emitted as FAQPage structured data below. */}
      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 className="text-center font-display text-2xl font-bold xs:text-3xl">
          {t('home.faqTitle')}
        </h2>
        <div className="mt-8 space-y-3">
          {faq.map((item) => (
            <details key={item.q} className="rounded-2xl bg-white/5 p-5">
              <summary className="cursor-pointer list-none font-semibold text-white">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-center shadow-glow sm:p-12">
          <h2 className="font-display text-2xl font-extrabold text-[#ffffff] xs:text-3xl sm:text-4xl">
            {t('home.ctaTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[#fdecec]">{t('home.ctaDesc')}</p>
          <Link
            to={playPath(locale)}
            className="mt-6 inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5 sm:px-8 sm:text-lg"
          >
            <PlayIcon className="h-5 w-5" />
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>

      <SiteFooter />
      <HomeJsonLd
        faq={faq}
        locale={locale}
        title={t('home.seoTitle')}
        description={t('home.seoDescription')}
      />
    </div>
  );
}

/** WebApplication + FAQPage structured data for this language's hub. */
function HomeJsonLd({
  faq,
  locale,
  title,
  description,
}: {
  faq: { q: string; a: string }[];
  locale: Locale;
  title: string;
  description: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'botAgedrez',
        url: SITE_URL + homePath(locale),
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        inLanguage: locale,
        headline: title,
        description,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        inLanguage: locale,
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/** A small, non-interactive decorative board showing the initial position. */
function HeroBoard() {
  const order = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'] as const;
  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const dark = (row + col) % 2 === 1;
      let piece: { type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; color: 'w' | 'b' } | null = null;
      if (row === 0) piece = { type: order[col], color: 'b' };
      else if (row === 1) piece = { type: 'p', color: 'b' };
      else if (row === 6) piece = { type: 'p', color: 'w' };
      else if (row === 7) piece = { type: order[col], color: 'w' };
      cells.push(
        <div
          key={`${row}-${col}`}
          className={`flex items-center justify-center ${dark ? 'bg-board-dark' : 'bg-board-light'}`}
        >
          {piece && (
            <span className="h-[86%] w-[86%]">
              <PieceGlyph type={piece.type} color={piece.color} className="h-full w-full" />
            </span>
          )}
        </div>,
      );
    }
  }
  return (
    <div className="grid aspect-square grid-cols-8 grid-rows-8 overflow-hidden rounded-2xl shadow-board ring-1 ring-black/40">
      {cells}
    </div>
  );
}
