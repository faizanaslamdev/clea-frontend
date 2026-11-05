#!/usr/bin/env node
/**
 * Tell Bing (and every IndexNow engine: Yandex, Seznam, Naver…) which pages
 * exist or changed. ChatGPT search and Copilot read Bing's index, so this is
 * the fastest way to get new pages in front of AI assistants.
 *
 * Usage: node scripts/indexnow-submit.mjs            # every URL in the live sitemaps
 *        node scripts/indexnow-submit.mjs URL [URL…]  # just these pages
 */
const SITE = 'https://www.clea.no';
const HOST = 'www.clea.no';
const KEY = '85006c79c5c9a1838d7e15ab4ca7163b';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH = 10000;

async function locs(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function allUrls() {
  const files = await locs(`${SITE}/sitemap-index.xml`);
  const urls = [];
  for (const file of files) {
    try {
      urls.push(...(await locs(file)));
    } catch (error) {
      console.warn('skipped', file, error.message);
    }
  }
  return [...new Set(urls)];
}

const urls = process.argv.length > 2 ? process.argv.slice(2) : await allUrls();
console.log(`submitting ${urls.length} URLs`);
for (let i = 0; i < urls.length; i += BATCH) {
  const urlList = urls.slice(i, i + BATCH);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
  });
  console.log(`batch ${i / BATCH + 1}: HTTP ${res.status}`);
}
