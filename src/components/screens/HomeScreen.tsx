/**
 * HomeScreen — the marketing landing page. Hero, feature grid, a three-step
 * "how it works", and a closing call to action. Fully translated and SEO-tagged.
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
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { useSeo, SITE_URL } from '@/hooks/useSeo';
import { PieceGlyph } from '@/components/board/PieceGlyph';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export function HomeScreen() {
  const { t } = useI18n();
  useSeo({
    title: 'botAgedrez · ' + t('home.subtitle').slice(0, 60),
    description: t('home.subtitle'),
    path: '/',
    image: `${SITE_URL}/og.png`,
  });

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
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-300 ring-1 ring-brand-400/20">
            ♟ botAgedrez
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight xs:text-4xl sm:text-5xl lg:text-6xl">
            bot<span className="text-brand-400">Agedrez</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-slate-300 sm:text-lg">{t('home.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/jugar" className="btn-primary px-5 py-3 text-base sm:px-6">
              <PlayIcon className="h-5 w-5 shrink-0" />
              <span className="truncate">{t('home.ctaPlay')}</span>
            </Link>
            <Link to="/blog" className="btn-ghost px-5 py-3 text-base sm:px-6">
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

      {/* Bottom CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-center shadow-glow sm:p-12">
          <h2 className="font-display text-2xl font-extrabold text-[#ffffff] xs:text-3xl sm:text-4xl">
            {t('home.ctaTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[#fdecec]">{t('home.ctaDesc')}</p>
          <Link
            to="/jugar"
            className="mt-6 inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5 sm:px-8 sm:text-lg"
          >
            <PlayIcon className="h-5 w-5" />
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
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
