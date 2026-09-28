/**
 * SettingsSheet — the app's settings, as one bottom sheet reachable from the
 * tab bar, the app bar and the game screen.
 *
 * On a phone these used to be scattered: a theme button here, a language
 * dropdown there, sound only inside a game and piece style only on the setup
 * screen. Grouped like a native settings page they are all one tap away from
 * anywhere, and the game header gives its width back to the board.
 *
 * Mounted once, at the app root. Whether it is open lives in the history entry
 * (see `useSheet`), so back closes it.
 */

import { ReactNode } from 'react';
import { CheckIcon, DownloadIcon, Share2Icon, SquareArrowUpIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { LOCALES } from '@/i18n/locales';
import { homePath } from '@/i18n/routes';
import { SITE_URL } from '@/hooks/useSeo';
import { useSheet } from '@/hooks/useSheet';
import { useLocaleSwitch } from '@/hooks/useLocaleSwitch';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { PieceGlyph } from '@/components/board/PieceGlyph';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { SunIcon, MoonIcon, VolumeIcon, MuteIcon } from '@/components/ui/Icons';
import { BottomSheet } from './BottomSheet';

export function SettingsSheet() {
  const { t, locale } = useI18n();
  const { open, hide } = useSheet('settings');
  const settings = useGameStore((s) => s.settings);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const setPieceStyle = useGameStore((s) => s.setPieceStyle);
  const switchTo = useLocaleSwitch();
  const install = useInstallPrompt();
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const share = async () => {
    try {
      await navigator.share({
        title: 'botAgedrez',
        text: t('app.shareText'),
        url: `${SITE_URL}${homePath(locale)}`,
      });
    } catch {
      /* dismissed */
    }
  };

  return (
    <BottomSheet open={open} onClose={hide} title={t('app.settings')}>
      <div className="space-y-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-1">
        <Group title={t('app.appearance')}>
          <Row label={t('app.theme')}>
            <Segmented
              value={settings.theme}
              onChange={(v) => v !== settings.theme && toggleTheme()}
              options={[
                { value: 'light', label: t('app.light'), icon: <SunIcon className="h-4 w-4" /> },
                { value: 'dark', label: t('app.dark'), icon: <MoonIcon className="h-4 w-4" /> },
              ]}
            />
          </Row>
          <Row label={t('setup.pieceStyle')}>
            <Segmented
              value={settings.pieceStyle}
              onChange={setPieceStyle}
              options={(['classic', 'modern'] as const).map((style) => ({
                value: style,
                label: t(`setup.${style}`),
                icon: (
                  <span className="h-5 w-5">
                    <PieceGlyph
                      type="n"
                      color="w"
                      className="h-full w-full"
                      styleOverride={style}
                    />
                  </span>
                ),
              }))}
            />
          </Row>
        </Group>

        <Group>
          <button
            type="button"
            role="switch"
            aria-checked={!settings.muted}
            onClick={toggleMute}
            className="settings-row w-full text-start"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
              {settings.muted ? (
                <MuteIcon className="h-5 w-5" />
              ) : (
                <VolumeIcon className="h-5 w-5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">{t('app.sound')}</span>
              <span className="block truncate text-xs text-slate-400">{t('app.soundDesc')}</span>
            </span>
            <Switch on={!settings.muted} />
          </button>
        </Group>

        <Group title={t('lang.label')}>
          <div className="grid grid-cols-2 gap-1.5 p-1.5">
            {LOCALES.map((l) => {
              const active = l.code === locale;
              return (
                <button
                  key={l.code}
                  type="button"
                  lang={l.code}
                  aria-pressed={active}
                  // Replace, so the history entry holding the open sheet is
                  // swapped for the new page instead of left behind it — back
                  // then returns to the previous page, not to this menu.
                  onClick={() => (active ? hide() : switchTo(l.code, { replace: true }))}
                  className={`flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-brand-500/20 font-semibold text-white ring-1 ring-brand-400/40'
                      : 'text-slate-300 active:bg-white/10'
                  }`}
                >
                  <FlagIcon code={l.code} />
                  <span className="min-w-0 flex-1 truncate text-start">{l.name}</span>
                  {active && <CheckIcon className="h-4 w-4 shrink-0 text-brand-300" />}
                </button>
              );
            })}
          </div>
        </Group>

        {(install.canPrompt || install.showIosHint || canShare) && (
          <Group>
            {install.canPrompt && (
              <ActionRow
                icon={<DownloadIcon className="h-5 w-5" />}
                label={t('app.install')}
                hint={t('app.installDesc')}
                onClick={install.promptInstall}
              />
            )}
            {install.showIosHint && (
              <div className="settings-row">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                  <SquareArrowUpIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white">{t('app.install')}</span>
                  <span className="block text-xs text-slate-400">{t('app.installIos')}</span>
                </span>
              </div>
            )}
            {canShare && (
              <ActionRow
                icon={<Share2Icon className="h-5 w-5" />}
                label={t('app.share')}
                onClick={share}
              />
            )}
          </Group>
        )}

        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} botAgedrez
        </p>
      </div>
    </BottomSheet>
  );
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section>
      {title && (
        <h3 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </h3>
      )}
      <div className="settings-group">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="settings-row flex-wrap justify-between">
      <span className="font-semibold text-white">{label}</span>
      {children}
    </div>
  );
}

function ActionRow({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="settings-row w-full text-start active:bg-white/5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-white">{label}</span>
        {hint && <span className="block text-xs text-slate-400">{hint}</span>}
      </span>
    </button>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-black/20 p-1" role="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`flex min-w-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              active ? 'bg-brand-500 text-[#ffffff] shadow-sm' : 'text-slate-400'
            }`}
          >
            {o.icon}
            <span className="truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        on ? 'bg-brand-500' : 'bg-slate-500/40'
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-[#ffffff] shadow transition-all ${
          on ? 'start-[1.375rem]' : 'start-0.5'
        }`}
      />
    </span>
  );
}
