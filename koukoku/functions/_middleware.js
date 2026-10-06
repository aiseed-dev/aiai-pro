// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs in front of the pages listed in _routes.json. Counts the view and
// fills the ad slots on the server; the browser is sent nothing extra.

import { countAd, countView, fill, referrerHost, today } from "../lib/koukoku.js";

export async function onRequest(context) {
  const { request, env } = context;
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (request.method !== "GET" || response.status !== 200 || !type.includes("text/html") || !env.DB) {
    return response;
  }
  const url = new URL(request.url);
  const cf = request.cf || {};
  const day = today();
  const region = cf.regionCode || "";
  const { html, shown } = await fill(env.DB, await response.text(), url.pathname, region, day);
  const writes = [
    countView(env.DB, day, url.pathname, cf.country || "", region, referrerHost(request.headers.get("referer"), url.host)),
    ...shown.map((id) => countAd(env.DB, day, id, url.pathname, "shown")),
  ];
  context.waitUntil(env.DB.batch(writes));
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: 200, headers });
}
