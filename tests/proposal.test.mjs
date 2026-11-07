import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { createStaticServer } from '../server.mjs';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../site.webmanifest', import.meta.url), 'utf8'));
const socialShare = await readFile(new URL('../assets/brand/social-share.png', import.meta.url));

test('the single-brand proposal has two service cards and six accessible disclosures', () => {
  assert.equal((html.match(/<article class="service-card /g) || []).length, 2);
  assert.equal((html.match(/<details class="accordion"/g) || []).length, 6);
  assert.equal((html.match(/<summary>/g) || []).length, 6);
  assert.equal((html.match(/<details[^>]+ open>/g) || []).length, 2);
  const controls = html.match(/aria-controls="([^"]+)"/)[1].split(' ');
  assert.equal(controls.length, 6);
  for (const id of controls) assert.ok(html.includes(`id="${id}"`));
});

test('Orelli × Stalite branding replaces the old brand and audience copy', () => {
  assert.match(html, /<title>Orelli × Stalite/);
  assert.ok(html.includes('src="https://www.stalite.in/logo.png"'));
  assert.ok(html.includes('alt="Stalite"'));
  assert.ok(!html.includes('One brand. <em>'));
  assert.ok(!html.includes('One growth plan.'));
  assert.ok(!html.includes('Orelli × Stalite marketing proposal'));
  assert.ok(html.includes('<h1 id="proposal-title">A focused growth plan</h1>'));
  assert.match(css, /h1 \{[^}]*font-size: clamp\(42px, 4\.6vw, 62px\);/);
  assert.ok(html.includes('Made to reach'));
  assert.ok(html.includes('The correct<br />audience'));
  assert.ok(html.includes('Orelli × Stalite</span>'));
  for (const stale of ['PK Furnishings', 'pk-wordmark', 'Two brands', 'per brand', 'Both brands', '40 years', '3 branches', 'Proposed', 'proposed', '₹50,000', '₹65,000', '₹40,000', 'social-investment', 'Pricing &amp; advertising', 'Better together', 'combined-plan', 'investment-note']) {
    assert.ok(!html.includes(stale), `Old content remains: ${stale}`);
  }
});

test('the social card retains the single-brand deliverables and strategy', () => {
  const social = html.split('<article class="service-card social-card"')[1].split('</article>')[0];
  for (const content of ['10–12', '2–3', '12–15', '3', 'B-roll', 'lead-tracking', 'location-based SEO', 'founder-led personal branding', 'Hindi content', 'premium product showcases', 'AI presentations, models &amp; moodboards', 'not general consumers', 'No price- or discount-led promotions', 'product price segments separate', '₹25,000']) {
    assert.ok(social.includes(content), `Missing social scope: ${content}`);
  }
  assert.ok(social.includes('<strong>10–12</strong><span>reels</span>'));
  assert.ok(social.includes('<li>12–15 content pieces in total</li>'));
  assert.ok(!social.includes('<strong>15</strong><span>reels</span>'));
  assert.ok(!social.includes('17–18 content pieces'));
});

test('performance marketing contains exactly 10 numbered points and a fixed monthly fee', () => {
  const performance = html.split('<article class="service-card performance-card"')[1].split('</article>')[0];
  assert.equal((performance.match(/<li>/g) || []).length, 10);
  assert.ok(performance.includes('start="5"'));
  assert.ok(performance.includes('start="8"'));
  assert.ok(performance.includes('₹15,000</span><span class="price-period">/ month'));
  assert.ok(performance.includes('Campaign management · ad spend separate'));
  assert.ok(performance.includes('market availability'));
  assert.ok(!performance.includes('budget-badge'));
});

test('both cards share the light-beige Orelli theme and both logos preserve proportions', () => {
  assert.ok(css.includes('--page: #F5EFE6;'));
  assert.ok(css.includes('--paper: #F5EFE6;'));
  assert.ok(css.includes('--ink: #1A1A1A;'));
  assert.ok(css.includes('--line: #DED5C8;'));
  assert.ok(css.includes('--footer: #EAE0D1;'));
  assert.ok(css.includes('--green: #755A2E;'));
  assert.ok(css.includes('--clay: #C9A96E;'));
  assert.ok(css.includes('.service-card, .social-card, .performance-card { --accent: var(--green); --accent-soft: var(--green-soft);'));
  assert.ok(css.includes('.brand-logo { display: block; flex-shrink: 0; width: auto; height: 48px; max-width: 190px; object-fit: contain; }'));
  assert.ok(html.includes('src="assets/brand/ORELLI-header-logo.png"'));
  assert.ok(html.includes('class="brand-logo orelli-logo"'));
  assert.ok(html.includes('class="brand-logo stalite-logo"'));
  assert.ok(!css.includes('--accent: var(--clay)'));
  assert.ok(!css.includes('.budget-badge'));
});

test('the social card is renamed and has only three dropdowns', () => {
  const social = html.split('<article class="service-card social-card"')[1].split('</article>')[0];
  assert.ok(social.includes('<h2 id="social-title">Social media management</h2>'));
  assert.equal((social.match(/<details class="accordion"/g) || []).length, 3);
  assert.ok(!social.includes('accordion-index">04'));
});

test('the Orelli splash has a blur fade, upward exit, and accessible motion fallbacks', () => {
  assert.match(html, /id="splash-screen"[^>]+role="dialog"[^>]+aria-modal="true"[^>]+hidden>/);
  assert.ok(html.includes('id="splash-label">Made for</p>'));
  const splashMarkup = html.split('<div class="splash-screen"')[1].split('<div class="page-shell"')[0];
  assert.ok(splashMarkup.includes('class="splash-logo" src="assets/brand/ORELLI-header-logo.png"'));
  assert.ok(splashMarkup.includes('id="splash-skip"'));
  assert.ok(css.includes('.splash-screen[hidden] { display: none; }'));
  assert.ok(css.includes('body.splash-active { overflow: hidden; }'));
  assert.match(css, /@keyframes splash-logo-in \{ from \{ opacity: 0; filter: blur\(16px\);/);
  assert.ok(css.includes('body.splash-leaving .splash-screen { transform: translateY(-100%);'));
  assert.ok(css.includes('body.splash-leaving .page-shell { opacity: 1; transform: translateY(0);'));
  assert.ok(css.includes('body.splash-leaving .splash-screen { display: none; }'));
  assert.ok(css.includes('.splash-screen { display: none !important; }'));
  assert.ok(js.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"));
  assert.ok(js.includes('site.inert = true;'));
  assert.ok(js.includes('site.inert = false;'));
  assert.ok(js.includes("event.key === 'Escape'"));
  assert.ok(js.includes('finishSplash({ immediate: true });'));
  assert.ok(js.includes('splash.hidden = true;'));
  assert.match(css, /\.splash-label \{[^}]*font-size: 18px;/);
  assert.match(css, /\.splash-content \{[^}]*text-align: center;/);
  assert.ok(js.includes("window.history.scrollRestoration = 'manual'"));
  assert.ok(js.includes('window.scrollTo(0, 0);'));
});

test('social sharing metadata, favicons, and the web manifest are complete', () => {
  assert.ok(html.includes('<title>Orelli × Stalite — A focused growth plan</title>'));
  assert.ok(html.includes('<link rel="canonical" href="https://oreli-proposal.vercel.app/" />'));
  assert.ok(html.includes('property="og:image" content="https://oreli-proposal.vercel.app/assets/brand/social-share.png"'));
  assert.ok(html.includes('property="og:image:width" content="1200"'));
  assert.ok(html.includes('property="og:image:height" content="630"'));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes('name="twitter:image" content="https://oreli-proposal.vercel.app/assets/brand/social-share.png"'));
  assert.ok(html.includes('href="assets/brand/favicon.ico"'));
  assert.ok(html.includes('href="assets/brand/favicon-16x16.png"'));
  assert.ok(html.includes('href="assets/brand/favicon-32x32.png"'));
  assert.ok(html.includes('href="assets/brand/apple-touch-icon.png"'));
  assert.ok(html.includes('rel="manifest" href="site.webmanifest"'));
  assert.equal(socialShare.readUInt32BE(16), 1200);
  assert.equal(socialShare.readUInt32BE(20), 630);
  assert.equal(manifest.theme_color, '#F5EFE6');
  assert.equal(manifest.background_color, '#F5EFE6');
  assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
});

test('the server serves the page, local assets and safe error responses', async (t) => {
  const server = createStaticServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(await page.text(), /Performance marketing/);
  const styles = await fetch(`${base}/styles.css`);
  assert.equal(styles.status, 200);
  assert.match(styles.headers.get('content-type'), /text\/css/);
  const font = await fetch(`${base}/assets/fonts/dm-sans-latin.woff2`);
  assert.equal(font.status, 200);
  assert.equal(font.headers.get('content-type'), 'font/woff2');
  const favicon = await fetch(`${base}/assets/brand/favicon.ico`);
  assert.equal(favicon.status, 200);
  assert.equal(favicon.headers.get('content-type'), 'image/x-icon');
  const webmanifest = await fetch(`${base}/site.webmanifest`);
  assert.equal(webmanifest.status, 200);
  assert.equal(webmanifest.headers.get('content-type'), 'application/manifest+json');
  const shareImage = await fetch(`${base}/assets/brand/social-share.png`);
  assert.equal(shareImage.status, 200);
  assert.equal(shareImage.headers.get('content-type'), 'image/png');
  const head = await fetch(base, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal((await head.text()).length, 0);
  assert.equal((await fetch(`${base}/.git/config`)).status, 403);
  assert.equal((await fetch(`${base}/%2e%2e%2f%2e%2e%2fetc/passwd`)).status, 403);
  assert.equal((await fetch(`${base}/missing-page`)).status, 404);
  assert.equal((await fetch(`${base}/server.mjs`)).status, 404);
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${base}/%E0%A4%A`)).status, 400);
});
