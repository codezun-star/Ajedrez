/**
 * Ad inventory — every third-party unit the site can render, in one place.
 *
 * Three shapes of creative, each with its own delivery mechanism:
 *
 *   - `AD_UNITS`   fixed-size iframe banners. The network's `invoke.js` reads a
 *                  global `atOptions` and `document.write`s the creative, which
 *                  would blow away a single-page app if it ran in the main
 *                  document — so every one of these is rendered inside its own
 *                  `srcdoc` iframe (see `AdSlot`).
 *   - `NATIVE_AD`  a container-based native block that appends itself to a div
 *                  with a fixed id. That id may exist only once per document,
 *                  so `NativeAd` allows a single live instance at a time.
 *   - document-level scripts (social bar / pop) loaded once for the whole site
 *                  from `index.html`, not from React.
 *
 * Sizes are the IAB standards the network was configured with; they are also
 * what lets a slot reserve the right box up front, so a late-arriving ad never
 * shifts the article the reader is already in.
 */

export interface AdUnit {
  /** The network's zone key. */
  key: string;
  width: number;
  height: number;
}

export const AD_UNITS = {
  /** 728×90 — desktop leaderboard. */
  leaderboard: { key: '506673a427236fc25f144e18a3e4efac', width: 728, height: 90 },
  /** 468×60 — the fallback strip for tablets and narrow columns. */
  banner: { key: 'a4e067816c3fc182484c049e107b4933', width: 468, height: 60 },
  /** 300×250 — the medium rectangle; the highest-yield in-content unit. */
  rectangle: { key: 'c4caf0d4856d8e320a4b751cab4a657b', width: 300, height: 250 },
  /** 320×50 — the mobile strip, and the anchor bar on phones. */
  mobile: { key: '7b267ae13bffb9ead55de14222a05b2f', width: 320, height: 50 },
  /** 160×600 — wide-screen side rail. */
  skyscraper: { key: 'f2d11c1e3f6e4b38cf2a5a1e0c2142f0', width: 160, height: 600 },
  /** 160×300 — the short rail, for a rail area without 600px to give. */
  halfRail: { key: '97d925a09fd63b609cca552d73ce802b', width: 160, height: 300 },
} as const satisfies Record<string, AdUnit>;

export type AdUnitId = keyof typeof AD_UNITS;

/**
 * Candidate ladders, widest first.
 *
 * A slot measures the room it actually got and takes the first unit that fits,
 * so the same `<AdSlot>` is a leaderboard on a desktop and a 320×50 strip on a
 * phone without the caller knowing which screen it is on.
 */
export const AD_LADDERS = {
  /** A horizontal strip across a content column. */
  horizontal: ['leaderboard', 'banner', 'mobile'],
  /** A block inside the reading flow. */
  inline: ['rectangle', 'mobile'],
  /** A vertical rail beside the content. */
  rail: ['skyscraper', 'halfRail'],
  /** Pinned to the bottom edge of the viewport. */
  anchor: ['leaderboard', 'mobile'],
  /** A narrow column — the game's side panel. */
  panel: ['rectangle', 'halfRail', 'mobile'],
  /** A fixed 320×50, for a spot whose height budget is already spent. */
  strip: ['mobile'],
} as const satisfies Record<string, readonly AdUnitId[]>;

export type AdLadder = keyof typeof AD_LADDERS;

/** Host serving the `atOptions` iframe banners. */
export const BANNER_HOST = 'https://www.highrevenueformat.com';

/** The container-based native block. One instance per document. */
export const NATIVE_AD = {
  id: '36eb8406479d19df08355a0c8ced78ab',
  src: 'https://pl31073502.profitableratecpmnetwork.com/36eb8406479d19df08355a0c8ced78ab/invoke.js',
  /** Roughly what the native grid settles at; used to reserve space. */
  minHeight: 250,
};

/** Loaded once from `index.html` — kept here so every zone id lives together. */
export const SOCIAL_BAR_SRC =
  'https://pl31073503.profitableratecpmnetwork.com/81/4a/59/814a59c7bceb52fd9a0e164460d98b84.js';

/**
 * A second document-level zone, also loaded once per visit from `index.html`.
 * That one is injected after `load` on an idle frame rather than parsed with
 * the page, so it never shares the boot with the engine bundle — see the tail
 * of `index.html`. Kept here so every zone id lives together.
 */
export const SECONDARY_DOC_SRC =
  'https://pl31475973.profitableratecpmnetwork.com/f7/12/2d/f7122dce2908d4049cf8a23b83765b74.js';
