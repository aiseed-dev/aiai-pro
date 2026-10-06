// SPDX-License-Identifier: AGPL-3.0-or-later
// node --test koukoku/test/  (Node 24, node:sqlite in place of D1)

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequest } from "../functions/_middleware.js";
import { onRequestGet } from "../functions/go/[id].js";
import { fill, pick, referrerHost, report } from "../lib/koukoku.js";

// The part of the D1 API that koukoku uses, over node:sqlite
function d1() {
  const sql = new DatabaseSync(":memory:");
  sql.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
  const statement = (q, args = []) => ({
    bind: (...a) => statement(q, a),
    all: async () => ({ results: sql.prepare(q).all(...args).map((r) => ({ ...r })) }),
    first: async () => {
      const r = sql.prepare(q).get(...args);
      return r ? { ...r } : null;
    },
    run: async () => sql.prepare(q).run(...args),
  });
  return { sql, prepare: (q) => statement(q), batch: async (list) => Promise.all(list.map((s) => s.run())) };
}

function addAds(db) {
  db.sql.exec(`
    INSERT INTO ads (id, slot, kind, path_prefix, region, text, url, weight, advertiser) VALUES
      (1, 'top', 'jisha', '/', '', 'aiai で自分の仕事を', 'https://aiai.aiseed.dev/', 1, ''),
      (2, 'top', 'kyousan', '/point/', '13', '東京の店', 'https://shop.example.jp/', 1, '東京の店'),
      (3, 'side', 'jisha', '/', '', 'ほかのサービス', 'https://aiseed.dev/', 1, '')`);
}

function context(db, url, html, { cf = {}, referer = "" } = {}) {
  const waits = [];
  const headers = new Headers(referer ? { referer } : {});
  return {
    waits,
    request: Object.assign(new Request(url, { headers }), { cf }),
    env: { DB: db },
    params: {},
    next: async () => new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }),
    waitUntil: (p) => waits.push(p),
  };
}

const PAGE = '<main><div data-koukoku="top"></div><p>天気</p><div data-koukoku="side"></div></main>';

test("a sponsorship for the region wins over our own ad, and is labelled 広告", async () => {
  const db = d1();
  addAds(db);
  const { html, shown } = await fill(db, PAGE, "/point/44132", "13", "2026-10-07", () => 0);
  assert.deepEqual(shown, [2, 3]);
  assert.match(html, /<span class="koukoku-label">広告<\/span>.*東京の店/);
  assert.match(html, /お知らせ.*ほかのサービス/);
  assert.doesNotMatch(html, /data-koukoku=/);
});

test("outside the region, or on other pages, our own ad is shown", async () => {
  const db = d1();
  addAds(db);
  assert.deepEqual((await fill(db, PAGE, "/point/44132", "27", "2026-10-07")).shown, [1, 3]);
  assert.deepEqual((await fill(db, PAGE, "/ranking/", "13", "2026-10-07")).shown, [1, 3]);
});

test("an ad out of its dates is not shown, and an empty slot leaves nothing", async () => {
  const db = d1();
  db.sql.exec(`INSERT INTO ads (id, slot, kind, text, url, starts, ends) VALUES (9, 'top', 'jisha', 'x', 'https://x.example.jp/', '2026-01-01', '2026-01-31')`);
  const { html, shown } = await fill(db, PAGE, "/", "", "2026-10-07");
  assert.deepEqual(shown, []);
  assert.equal(html, "<main><p>天気</p></main>");
});

test("pick follows the weights", () => {
  const ads = [{ id: 1, weight: 1 }, { id: 2, weight: 3 }];
  assert.equal(pick(ads, () => 0.1).id, 1);
  assert.equal(pick(ads, () => 0.5).id, 2);
  assert.equal(pick([], () => 0), null);
});

test("only the referring host is kept, and our own host is dropped", () => {
  assert.equal(referrerHost("https://www.google.com/search?q=%E5%A4%A9%E6%B0%97", "weather.time-j.net"), "www.google.com");
  assert.equal(referrerHost("https://weather.time-j.net/ranking/", "weather.time-j.net"), "");
  assert.equal(referrerHost("not a url", "weather.time-j.net"), "");
});

test("the middleware counts the view and the ads shown, and keeps no address or identifier", async () => {
  const db = d1();
  addAds(db);
  const ctx = context(db, "https://weather.time-j.net/point/44132", PAGE, {
    cf: { country: "JP", regionCode: "13" },
    referer: "https://www.google.com/search?q=x",
  });
  const res = await onRequest(ctx);
  const body = await res.text();
  await Promise.all(ctx.waits);
  assert.match(body, /東京の店/);
  assert.equal(res.headers.get("set-cookie"), null);
  const view = db.sql.prepare("SELECT * FROM views").all();
  assert.deepEqual(view.map((r) => ({ ...r })), [
    { day: view[0].day, path: "/point/44132", country: "JP", region: "13", referrer: "www.google.com", n: 1 },
  ]);
  const shown = db.sql.prepare("SELECT ad_id, shown, clicked FROM ad_counts ORDER BY ad_id").all();
  assert.deepEqual(shown.map((r) => ({ ...r })), [{ ad_id: 2, shown: 1, clicked: 0 }, { ad_id: 3, shown: 1, clicked: 0 }]);
});

test("pages that are not HTML pass through untouched and are not counted", async () => {
  const db = d1();
  const ctx = context(db, "https://weather.time-j.net/data.json", "{}");
  ctx.next = async () => new Response("{}", { headers: { "content-type": "application/json" } });
  assert.equal(await (await onRequest(ctx)).text(), "{}");
  assert.equal(db.sql.prepare("SELECT COUNT(*) AS n FROM views").get().n, 0);
});

test("/go counts the click and redirects; the sponsor's report has only totals", async () => {
  const db = d1();
  addAds(db);
  const ctx = context(db, "https://weather.time-j.net/go/2?from=%2Fpoint%2F44132", "");
  ctx.params = { id: "2" };
  const res = await onRequestGet(ctx);
  await Promise.all(ctx.waits);
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "https://shop.example.jp/");
  const rows = await report(db, "東京の店", "2000-01-01", "2999-12-31");
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]).sort(), ["ad_id", "clicked", "day", "shown"]);
  assert.equal(rows[0].clicked, 1);
  ctx.params = { id: "999" };
  assert.equal((await onRequestGet(ctx)).status, 404);
});
