-- SPDX-License-Identifier: AGPL-3.0-or-later
-- D1 (SQLite) tables for koukoku: page views, ads, and ad counts.
-- No IP address, no cookie, no identifier of a person is kept.

-- Page views, counted on the server, per day, page, country, region and referring host
CREATE TABLE IF NOT EXISTS views (
  day TEXT NOT NULL,              -- YYYY-MM-DD in UTC
  path TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',  -- request.cf.regionCode, e.g. "13" for Tokyo
  referrer TEXT NOT NULL DEFAULT '', -- host only, e.g. "www.google.com"
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path, country, region, referrer)
);

-- Ads: our own services (jisha) and sold sponsorships (kyousan)
CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY,
  slot TEXT NOT NULL,             -- the name in <div data-koukoku="slot"></div>
  kind TEXT NOT NULL CHECK (kind IN ('jisha', 'kyousan')),
  path_prefix TEXT NOT NULL DEFAULT '/',  -- pages it may appear on
  region TEXT NOT NULL DEFAULT '', -- '' for anywhere, else a regionCode
  text TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '', -- URL of an image, or ''
  url TEXT NOT NULL,
  starts TEXT NOT NULL DEFAULT '0000-01-01',
  ends TEXT NOT NULL DEFAULT '9999-12-31',
  weight INTEGER NOT NULL DEFAULT 1,
  advertiser TEXT NOT NULL DEFAULT ''  -- who bought it (kyousan), for the report
);

-- How often each ad was shown and followed, per day and page
CREATE TABLE IF NOT EXISTS ad_counts (
  day TEXT NOT NULL,
  ad_id INTEGER NOT NULL,
  path TEXT NOT NULL,
  shown INTEGER NOT NULL DEFAULT 0,
  clicked INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, ad_id, path)
);
