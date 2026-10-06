---
name: aiai-pro-koukoku
description: 自分のサイトのアクセス解析と広告を、Google Analytics と AdSense に頼らず、サーバーの側で作るのを手伝う。Cloudflare Pages の Functions と D1 で、ページの表示を数え、広告の枠に自社広告か売った協賛を差し込み、押された数を数える。ブラウザーにタグを送らず、IP アドレスも Cookie も個人の ID も持たない。
---

# 自分で数えて、自分で広告を出す(広告)

あなたは、この会社が、自分のサイトの解析と広告を自分の側で持つのを手伝います。まず自社のサービスの
案内(自社広告)に使い、その枠を、その地域の店や会社に協賛として売れるようにします。
専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- ブラウザーに解析や広告のタグを送りません。数えるのも、広告を差し込むのも、サーバーの側でします
- IP アドレス、Cookie、個人の ID を持ちません。参照元は、ページの住所でなくホストだけを残します
- 協賛の枠には「広告」と書き、自社広告(「お知らせ」)と見分けられるようにします
- 協賛の広告主には、日ごとの表示と押された数の合計だけを見せます。見た人の情報は渡しません
- Cloudflare の API のトークンは、会社の人が作って入れます。会話にも、リポジトリにも入れません

## 決まり(2026-10-07 に確かめた)

- 天気、ニュース、地図などの情報を出すサイトは、電気通信事業法の外部送信規律の対象です。ブラウザーに
  利用者の情報を送らせるタグを入れると、送る先が自分のサーバーでも「外部送信」に入り、送る情報、送り先、
  目的を知らせるか公表します(総務省の FAQ 問 1-9、1-16)。サーバーが受けたリクエストを数えるだけなら、
  ブラウザーに送らせる物がありません(そう書いた FAQ は見つかりませんでした)
- 広告であることを隠した広告は、景品表示法で規制されます(2023-10-01 から)。規制されるのは広告主です
- Cloudflare の無料の範囲
  * Functions が動いたリクエストは Workers のリクエストとして数えられ、1 日 10 万までです。
    静的なファイルは、Functions を通さなければ無料で数の上限もありません。`_routes.json` で、
    画像などを Functions から外します
  * D1 の書き込みは 1 日 10 万行です。表示 1 回で、ページの数と広告の数の 2 行を書くので、
    1 日 5 万の表示ほどが無料の範囲です

## 作り

| ファイル | 役目 |
|---|---|
| [schema.sql](schema.sql) | D1 の表。`views`(日、ページ、国、地域、参照元のホスト、数)、`ads`、`ad_counts` |
| [lib/koukoku.js](lib/koukoku.js) | 広告を選ぶ、枠に差し込む、数える、広告主への報告 |
| [functions/_middleware.js](functions/_middleware.js) | ページを返す前に数え、`<div data-koukoku="枠の名前"></div>` を広告に替える |
| [functions/go/[id].js](functions/go/[id].js) | `/go/広告の番号?from=ページ` で押された数を数え、広告の先へ送る |
| [_routes.json](_routes.json) | Functions を通すページと、通さないファイル |
| [test/koukoku.test.mjs](test/koukoku.test.mjs) | Node 24 の `node:sqlite` を D1 の代わりにした確かめ |

広告は、枠、自社か協賛か、出してよいページ(住所の始まり)、地域(`regionCode`)、期間、重みで選びます。
同じ枠に、合う協賛があれば協賛を、無ければ自社広告を出します。

## 手順

1. 何を数え、どこに枠を置くかを聞きます。案内したい自社のサービス、枠の場所(ページの上、横)、
   協賛を売るか
2. D1 のデータベースを作り、表を入れます。Pages のプロジェクトの設定で、D1 を `DB` という名前で
   つなぎます(wrangler を使うなら、ダウンロードの前に許しを得ます)

   ```
   npx wrangler d1 create koukoku
   npx wrangler d1 execute koukoku --remote --file=schema.sql
   ```

3. `functions/`、`lib/`、`_routes.json` をサイトの公開のフォルダーの根に置き、ページの枠の場所に
   `<div data-koukoku="top"></div>` のように書きます。`_routes.json` の除く物は、サイトの
   ファイルに合わせて直します
4. 自社広告を入れます(`ads` に `kind = 'jisha'`)。協賛を売ったら `kind = 'kyousan'` で、広告主の
   名前、出す地域とページ、期間を入れます
5. 協賛を売るなら、値段(地点のページの月決めなど)、載せない広告の決まり、請求(適格請求書)を
   会社が決めます。広告主への報告は `report()` の合計です
6. 確かめます。手元で次を動かし、公開の後は、枠が出ること、`/go/` で広告の先へ移ること、D1 に
   数が入ることを見ます

   ```
   node --test koukoku/test/koukoku.test.mjs
   ```

人ごとに広告を出し分けたくなったら、そのときは個人の情報を預かることになります。会員の同意から
始めます([kaiin](../kaiin/))。

## 出典

- Cloudflare「Middleware」(https://developers.cloudflare.com/pages/functions/middleware/)、
  「Pricing」(https://developers.cloudflare.com/pages/functions/pricing/)、「Routing」
  (https://developers.cloudflare.com/pages/functions/routing/)、「Bindings」
  (https://developers.cloudflare.com/pages/functions/bindings/)、「API reference」
  (https://developers.cloudflare.com/pages/functions/api-reference/)
- Cloudflare D1「Pricing」(https://developers.cloudflare.com/d1/platform/pricing/)、
  「Prepared statements」(https://developers.cloudflare.com/d1/worker-api/prepared-statements/)
- Cloudflare「Request」の `cf`(https://developers.cloudflare.com/workers/runtime-apis/request/)
- 総務省「外部送信規律 FAQ」(https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/gaibusoushin_kiritsu_00002.html)
- 消費者庁「ステルスマーケティング」
  (https://www.caa.go.jp/policies/policy/representation/fair_labeling/stealth_marketing/)
- Node.js「SQLite」(https://nodejs.org/docs/latest-v24.x/api/sqlite.html)

2026-10-07 に確かめました。
