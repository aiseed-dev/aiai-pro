---
name: aiai-tools-web
description: 会社の Web サイトを静的なページにして Cloudflare Pages で公開するのを手伝う。作り方は aiai の website のスキルと同じ。Python だけで公開するときは cf-publish、いまの CMS から移すときは aiseed-migration-kit を参照する。
---

# Web を公開する(Cloudflare Pages)

あなたは、この会社の Web サイトを、静的なページにして公開するのを手伝います。
会社のサイトは大きく変わらないので、静的で足ります。サーバーもデータベースもプラグインも
無くなり、守る所が減ります。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- ページの作り方、聞くこと、守ることは、[aiai の website のスキル](https://github.com/aiseed-dev/aiai/blob/main/website/SKILL.md)と
  同じです。先にそれを読んでください。会社の事実(名前、住所、電話、営業時間)は
  `事業.sheet.adoc` から写し、お客さんに向けた文は会社の人の言葉から下書きします
- お問い合わせの中身(お客さんの連絡先)を AI への依頼に入れません
- サインインが要る物(社員だけのページ、申し込み)は、静的なサイトに置かず、
  [api](../api/) の後ろに置きます。「窓は借り、金庫は自分で持つ」形です
- Cloudflare の API のトークンは会社の人が作り、環境の変数で渡します。リポジトリに入れません

## 手順

1. いまのサイトを聞きます(WordPress か、ほかの CMS か、誰が更新しているか、
   ページの数、お問い合わせの受け方)
2. 作る、確かめる、公開する、を分けます
   * 作る: `python build.py . --out _site`(aiai の `website/sample/build.py`)
   * 確かめる: `python -m http.server --directory _site 8000` で開いて見ます
   * 公開する: 確かめた `_site` をそのまま Cloudflare Pages に上げます。先に preview の
     ブランチで見て、それから本番にします。確かめた HTML と公開した HTML が同じになります
3. 公開の方法を決めます
   * GitHub か GitLab のリポジトリを Pages につなぐ: aiai の website のスキルの 7 のとおりです
   * Python だけで上げる: cf-publish(aiseed-dev/cf-publish、MIT、PyPI)を使うと、wrangler も
     Node.js も要りません。`cf-publish ./_site --project サイトの名前` で上がります。
     変わったファイルだけを送ります。pip で入れるので、名前と出どころを伝えて許しを得ます
4. いまの CMS から移すときは、aiseed-migration-kit(aiseed-dev/aiseed-migration-kit、AGPL-3.0)を
   参照します。取り込む(ingest)、分ける(classify)、Markdown にする(convert)、作る(build)、
   配る(publish)の流れです。変換は下書きで、人が仕上げます。aiai tools はそれを写しません
5. お問い合わせは、aiai の website のスキルの 8 のとおり、Workers と R2 で受けます。
   名前が要る物は [api](../api/) で受けます
6. DNS は Cloudflare で会社のドメインにつなぎます。メールのレコード([mail](../mail/))は
   触りません

## 出典

- aiai の website のスキルと README(https://github.com/aiseed-dev/aiai/tree/main/website)。Cloudflare の制限と料金の出典は
  そちらにあります
- aiseed-dev/cf-publish(https://github.com/aiseed-dev/cf-publish)、
  aiseed-dev/aiseed-migration-kit(https://github.com/aiseed-dev/aiseed-migration-kit)
- aiseed.dev「Webを公開する」(https://aiseed.dev/ai-native-ways/software/web/)。CC BY 4.0

2026-09-28 に確かめました。
