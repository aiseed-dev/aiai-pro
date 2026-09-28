---
name: aiai-pro-code
description: 会社のコードと設定と文書の版を、自分のサーバーの Forgejo に置くのを手伝う。GitHub と SharePoint と Drive の置き換え。Forgejo Actions で確かめ、AI と一緒に直す。
---

# コードを手元に置く(Forgejo)

あなたは、この会社が、コード、設定、文書の版を自分のサーバーに置くのを手伝います。
aiai pro では、compose や Caddyfile のような設定も、社内の文書(Markdown や adoc)も、
ここに置いて版を残します。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 秘密の値(`.env`、鍵、トークン)をリポジトリに入れないでください。`.gitignore` に
  `.env` を書き、`.env.example` だけを入れます
- 社員やお客さんの個人の情報が入るファイルは、リポジトリに入れません
- GitHub をいますぐ消しません。Forgejo と並べて動かし(GitHub を鏡にし)、慣れてから
  Forgejo を本にします
- 大きな版の上げ方(たとえば 16 から 17)は、公式の説明書に「手作業と人の確認が要る」と
  あります。上げる前に説明書を読み、バックアップを取ります

## 手順

1. 何を置くかを聞きます。コード、設定、文書、それぞれ誰が書き、誰が見るかを聞きます
2. Forgejo を入れます。見本は [compose.yaml](compose.yaml) です。データベースは、
   何もしなければ SQLite です。[dodai](../dodai/) の PostgreSQL を使うときは、
   `FORGEJO__database__DB_TYPE=postgres` など、`FORGEJO__section__KEY` の形の環境の変数で
   渡します。画像は `codeberg.org/forgejo/forgejo:16` のように大きな版で指定します
   * Web は 3000 番、SSH は 22 番(ホストでは 222 番)です。Web は `127.0.0.1:3000:3000` にして
     Caddy から `git.example.jp` で出します
   * データ(`./forgejo`)の持ち主は、`USER_UID` と `USER_GID` の人にします
3. 誰でも登録できないようにします。`FORGEJO__service__DISABLE_REGISTRATION=true` にし、
   管理者が社員のアカウントを作ります。サインインを 1 つにまとめたい道具があるときは、
   Forgejo が OpenID Connect の提供者になれます([ninshou](../ninshou/) を見てください)
4. 手元から使えるようにします。社員の SSH の公開鍵を Forgejo に登録し、

   ```
   git remote add origin ssh://git@git.example.jp:222/会社/リポジトリ.git
   ```

   のように向けます。エディターは何でもかまいません。aiseed.dev の例は Zed から AI を呼ぶ形です
5. 確かめる仕組み(CI)を Forgejo Actions で作ります。GitHub Actions と同じ書き方で、
   `.forgejo/workflows/ci.yml` に置きます。runner は別のコンテナーで動かします。
   aiai の `tools/kakunin.py` のような確かめを、push のたびに動かせます
6. 設定と文書のリポジトリを作ります。[server](../server/) の compose と Caddyfile、
   各道具の `.env.example`、入れた記録をここに置きます。これが、壊れたときに
   AI が作り直す元になります
7. GitHub から移すときは、Forgejo の「新しい移行」で URL を指定して写します。
   移した後も、しばらく GitHub に鏡を置きます

## 出典

- Forgejo「Installation with Docker」(https://forgejo.org/docs/latest/admin/installation/docker/)、
  「Configuration Cheat Sheet」(https://forgejo.org/docs/latest/admin/config-cheat-sheet/)、
  「OAuth2 provider」(https://forgejo.org/docs/latest/user/authentication/oauth2-provider/)。
  v16.0.5(https://codeberg.org/forgejo/forgejo/releases)、GPL-3.0
- aiseed.dev「コードを手元に」(https://aiseed.dev/ai-native-ways/software/code/)。CC BY 4.0

2026-09-28 に確かめました。
