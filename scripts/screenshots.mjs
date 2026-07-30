/**
 * Captures the screenshots the install prompt shows.
 *
 * A manifest without `screenshots` still installs, but the browser offers it
 * with a single line of text; with them, Chrome shows a rich card — the same
 * difference as an app store listing with and without images. They have to be
 * real captures of the running app, so this serves `dist/` and drives a real
 * browser over it.
 *
 * Playwright is not a dependency of the project — this runs by hand when the
 * design changes, not on every install, the same deal as `brand-assets.py` and
 * Pillow. Run after `npm run build`:
 *
 *     npm i --no-save playwright && npx playwright install chromium
 *     node scripts/screenshots.mjs
 *
 * `CHROME_PATH` overrides the browser binary when the machine already has one,
 * which skips the 150 MB download.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'public/screenshots');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

/** Static server over dist/, with the SPA fallback Cloudflare Pages applies. */
function serve() {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const candidates = [join(DIST, path), join(DIST, path, 'index.html'), join(DIST, 'index.html')];
    const file = candidates.find((f) => existsSync(f) && extname(f));

    if (!file) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  });

  return new Promise((resolve) => {
    server.listen(0, () => resolve({ server, port: server.address().port }));
  });
}

/**
 * The captures, at the two form factors the manifest declares: Chrome picks
 * `wide` or `narrow` by the device it is offering the install on.
 *
 * `/play` opens on the setup panel, so the board shots press "Jugar" first —
 * a screenshot of a settings form does not sell a chess game.
 */
const SHOTS = [
  { name: 'escritorio-inicio', path: '/es', width: 1280, height: 800 },
  { name: 'escritorio-partida', path: '/es/play', width: 1280, height: 800, start: true },
  { name: 'movil-inicio', path: '/es', width: 390, height: 844 },
  { name: 'movil-partida', path: '/es/play', width: 390, height: 844, start: true },
];

const { server, port } = await serve();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

try {
  for (const shot of SHOTS) {
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 1,
    });
    await page.goto(`http://127.0.0.1:${port}${shot.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    if (shot.start) {
      await page.getByRole('button', { name: 'Jugar', exact: true }).click();
      // The engine boots in a worker and the board animates in.
      await page.waitForTimeout(2500);
    }

    // Everything animates in; capture the settled state.
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT, `${shot.name}.png`) });
    await page.close();
    console.log(`${shot.name}.png — ${shot.width}x${shot.height}`);
  }
} finally {
  await browser.close();
  server.close();
}
