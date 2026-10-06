// SPDX-License-Identifier: AGPL-3.0-or-later
// /go/<ad id>?from=<page>: counts the click and sends the browser on

import { countAd, today } from "../../lib/koukoku.js";

export async function onRequestGet(context) {
  const { env, params, request } = context;
  const ad = await env.DB.prepare("SELECT id, url FROM ads WHERE id = ?").bind(Number(params.id)).first();
  if (!ad) return new Response("Not found", { status: 404 });
  const from = new URL(request.url).searchParams.get("from") || "";
  context.waitUntil(countAd(env.DB, today(), ad.id, from.startsWith("/") ? from : "", "clicked").run());
  return Response.redirect(ad.url, 302);
}
