// SPDX-License-Identifier: AGPL-3.0-or-later
// koukoku: count page views and serve ads on the server, without tags,
// cookies or any identifier of a person. Runs in Cloudflare Pages Functions
// with a D1 database bound as DB; the same code is tested with node:sqlite.

const SLOT = /<div data-koukoku="([a-z0-9_-]+)"><\/div>/g;

export function today(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

// Only the host of the referring page is kept, never the full address
export function referrerHost(referer, ownHost) {
  try {
    const host = new URL(referer).host;
    return host === ownHost ? "" : host;
  } catch {
    return "";
  }
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// The ads that may appear in a slot on this page, today, in this region.
// Sponsorships (kyousan) come before our own (jisha) when both fit.
export async function candidates(db, slot, path, region, day) {
  const { results } = await db
    .prepare(
      `SELECT * FROM ads WHERE slot = ? AND ? LIKE path_prefix || '%'
         AND (region = '' OR region = ?) AND starts <= ? AND ends >= ?
       ORDER BY kind = 'kyousan' DESC`,
    )
    .bind(slot, path, region, day, day)
    .all();
  if (!results.length) return [];
  const best = results[0].kind;
  return results.filter((a) => a.kind === best);
}

// One ad by weight; random() is passed in so tests can fix it
export function pick(ads, random = Math.random) {
  const total = ads.reduce((s, a) => s + Math.max(1, a.weight), 0);
  let r = random() * total;
  for (const a of ads) {
    r -= Math.max(1, a.weight);
    if (r < 0) return a;
  }
  return ads[ads.length - 1] ?? null;
}

export function render(ad, path) {
  const label = ad.kind === "kyousan" ? "広告" : "お知らせ";
  const href = `/go/${ad.id}?from=${encodeURIComponent(path)}`;
  const img = ad.image ? `<img src="${escapeHtml(ad.image)}" alt="" loading="lazy">` : "";
  return (
    `<aside class="koukoku koukoku-${ad.kind}"><span class="koukoku-label">${label}</span>` +
    `<a href="${escapeHtml(href)}" rel="sponsored noopener">${img}<span>${escapeHtml(ad.text)}</span></a></aside>`
  );
}

// Fill every <div data-koukoku="slot"></div> in the page; returns the new
// page and the ids of the ads shown
export async function fill(db, html, path, region, day, random = Math.random) {
  const shown = [];
  const slots = [...new Set([...html.matchAll(SLOT)].map((m) => m[1]))];
  const chosen = {};
  for (const slot of slots) {
    const ad = pick(await candidates(db, slot, path, region, day), random);
    chosen[slot] = ad;
    if (ad) shown.push(ad.id);
  }
  const out = html.replace(SLOT, (_, slot) => (chosen[slot] ? render(chosen[slot], path) : ""));
  return { html: out, shown };
}

export function countView(db, day, path, country, region, referrer) {
  return db
    .prepare(
      `INSERT INTO views (day, path, country, region, referrer, n) VALUES (?, ?, ?, ?, ?, 1)
       ON CONFLICT (day, path, country, region, referrer) DO UPDATE SET n = n + 1`,
    )
    .bind(day, path, country, region, referrer);
}

export function countAd(db, day, adId, path, column) {
  if (column !== "shown" && column !== "clicked") throw new Error("column");
  return db
    .prepare(
      `INSERT INTO ad_counts (day, ad_id, path, ${column}) VALUES (?, ?, ?, 1)
       ON CONFLICT (day, ad_id, path) DO UPDATE SET ${column} = ${column} + 1`,
    )
    .bind(day, adId, path);
}

// What a sponsor is shown: totals per day for its ads, no person in it
export async function report(db, advertiser, from, to) {
  const { results } = await db
    .prepare(
      `SELECT c.day, a.id AS ad_id, SUM(c.shown) AS shown, SUM(c.clicked) AS clicked
         FROM ad_counts c JOIN ads a ON a.id = c.ad_id
        WHERE a.advertiser = ? AND c.day BETWEEN ? AND ?
        GROUP BY c.day, a.id ORDER BY c.day, a.id`,
    )
    .bind(advertiser, from, to)
    .all();
  return results;
}
