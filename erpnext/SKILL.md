---
name: aiai-pro-erpnext
description: ERPNext(GPL-3.0 の OSS の ERP)を日本の会社で使える形にするのを手伝う。いまの ERP の周りの仕事(CRM、見積、購買の依頼、プロジェクト、備品、社内の問い合わせ)だけに使うか、置き換えるかは、会社が決める。日本語、書体、帳票、CSV のつなぎ、インボイス制度、勘定科目、源泉徴収の順。
---

# ERPNext を日本の会社で使える形にする

あなたは、この会社が ERPNext を使えるようにするのを手伝います。ソースがすべて手元にある
ERP なので、AI に読ませて構造を理解させ、会社に合わせて直せます。
専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- どこまで使うかは、会社が決めます。いまの ERP と並べて周りの仕事(CRM、見積、購買の依頼、
  プロジェクト、備品、社内の問い合わせ)に使うことも、いまの ERP を置き換えることもできます。
  あなたは選ぶための材料を伝えます。たとえば、会計に使うなら、日本の決まり(インボイス制度、
  勘定科目、源泉徴収)のうち、まだ無い物があること(手順 8)です
- 会社の取引のデータを AI への依頼に貼りません。DocType の名前と項目で設計はできます
- 本体(frappe/erpnext、frappe/frappe)のコードは直さず、別のアプリ(Frappe の custom app)で
  足します。本体を直すと、版を上げるたびに当て直すことになります
- ERPNext は GPL-3.0、Frappe Framework は MIT です。作ったアプリを人に渡すときの決まりは
  [README](README.md) の「ライセンス」を読み、会社の人に伝えます
- 試す前に、ダウンロード(Docker の画像は数 GB)の名前、出どころ、大きさを伝えて
  許しを得ます

## 手順

1. 何に使いたいかを聞きます。いまの ERP は何か、ERPNext でしたいことは何か
   (たとえば、見積が Excel でばらばら、備品の管理が無い、いまの ERP を置き換えたい)
2. 試します。会社の人の PC で、使い捨ての物を動かします。日本語の画面で触るなら、有志の
   maihatch/erpnext-ja-starter(MIT)がそのまま動きます。中身は、公式の画像に
   `erpnext_jp_core` という custom app(翻訳と、インボイスの欄が 3 つ)を足した物です

   ```
   git clone https://github.com/maihatch/erpnext-ja-starter
   cd erpnext-ja-starter
   cp .env.example .env
   docker compose up -d
   ```

   `http://localhost:8080/desk` に `Administrator` と `admin` で入ります。画面が英語のときは、
   右上のアバターの「Edit Profile」で Language を「日本語」にして保存し、読み込み直します。
   英語の画面でよければ、frappe_docker の `pwd.yml`(`docker compose -f pwd.yml up -d`、
   画像は `frappe/erpnext:v16.36.1`)でも試せます。どちらも試すための物で、パスワードが
   `admin` のままなので、会社のデータは入れません
3. 自分の PC に、一人で使う ERPNext を作ります。一人が、すべての画面と設定を触れる形です。
   見本は、このフォルダーの [Dockerfile](Dockerfile)、[compose.yaml](compose.yaml)、
   [.env.example](.env.example) です。スターターから次を変えました
   * 版を `v16.36.1` に固定しました。スターターは `version-16` で、黙って版が上がります
   * PDF の日本語の書体(Debian の `fonts-noto-cjk`、OFL-1.1、53.9MB)を足しました
   * 画面の番号を `127.0.0.1` だけに向けました。同じ PC からだけ開けます
   * パスワードの既定の `admin` をやめ、`.env` に無ければ止まるようにしました
   * v16 の PDF が使う chromium の場所を、frappe_docker の compose.yaml と同じく設定します
   * DB と Redis を、frappe_docker の overrides と同じ `mariadb:11.8`、`redis:8.6-alpine` にしました

   PC には Docker が要ります(Windows と Mac は Docker Desktop、Linux は Docker Engine)。
   入れる前に、スターターの中身を読みます。スターターは、このフォルダーに、確かめた
   コミットで取ります(`.gitignore` に入っていて、このリポジトリには入りません)

   ```
   git clone https://github.com/maihatch/erpnext-ja-starter erpnext/erpnext-ja-starter
   git -C erpnext/erpnext-ja-starter checkout b4942347e73a821d2be4c988638944b41896ed43
   ```

   AI に `erpnext_jp_core/hooks.py`、`install.py`、`patches/add_japan_tax_fields.py` を読ませ、
   何を変えるかを会社の人に伝えます。2026-09-29 に読んだときは、入れたときに言語を ja、
   国を Japan、時刻を Asia/Tokyo、通貨を JPY にし、Company に「課税区分」と
   「インボイス登録番号」、Item に「税区分」の欄を足すだけでした。コミットを変えたら読み直します。
   読んだら、会社の人が動かします(画像は数 GB です)。`.env` の `変えてください` は、
   会社の人が入れます

   ```
   cd erpnext
   cp .env.example .env
   docker compose up -d --build
   docker compose logs -f create-site
   ```

   `http://localhost:8080` を開き、`Administrator` と `.env` の `ADMIN_PASSWORD` で入ると、
   設定のウィザードが始まります。言語は「日本語」、国は「Japan」にし、会社の名前と、
   自分の名前、メールアドレス、パスワードを入れます。ウィザードが作るこの利用者には、
   Administrator などの特別な物を除くすべての役割と、System Manager が付きます
   (frappe の `setup_wizard.py` の `create_or_update_user`。2026-09-29 に version-16 で
   確かめました)。これで一人が何でもできます。ふだんはこの利用者で入り、Administrator は
   使いません。入ったら、`.env` の `ADMIN_PASSWORD` は消します(サイトを作るときにだけ使います)

   止めるときは `docker compose stop`、また使うときは `docker compose start` です。
   `docker compose down -v` は、データ(volume)ごと消すので使いません。
   バックアップは、frappe_docker の説明書のとおり、日ごとに次を動かし、できたファイル
   (`sites/localhost/private/backups/` の中)を PC の外(外付けのディスクなど)に写します。
   戻せることを 1 度は確かめます

   ```
   docker compose exec backend bench --site all backup --with-files
   docker compose cp backend:/home/frappe/frappe-bench/sites/localhost/private/backups ./backups
   ```

   人を増やすときや、外から使うときは、サーバーに移します。`.env` の `SITE_NAME` を
   `erp.example.jp` にしてサイトを作り、バックアップから戻し、
   [server の Caddyfile](../server/Caddyfile) の `erp.example.jp` から出して、次を動かします

   ```
   docker compose exec backend bench --site erp.example.jp set-config host_name https://erp.example.jp
   ```

4. 日本語を見直します。本体には ja の翻訳がありません(erpnext/locale と frappe/locale に
   ありません。2026-09-27 に確かめました)。スターターの `translations/ja.csv`(17,735 行)で
   画面は日本語になりますが、次のことに気をつけます(2026-09-29 に確かめました)
   * 出どころが書いてありません。6,113 組(約 35%)が、ERPNext の version-13 にあった
     `erpnext/translations/ja.csv`(GPL-3.0)と訳まで同じです。スターターは全体を MIT と
     しています。社内で使うだけなら渡す相手がいませんが、人に渡すときは、出どころを
     作者に確かめます([README](README.md) の「ライセンス」)
   * 訳語を、会社の言葉に合わせます。たとえば Submit が「提出」、Journal Entry が「仕訳帳」、
     Posting Date が「転記日付」、Grand Total が「総額」です。561 行は英語のままです。
     会社が使う画面から順に、会社の人が見直します
   * 見直した訳は、会社の custom app の `translations/ja.csv` に置きます。見直した物は、
     スターターに返します。もう 1 つの有志の lifegence/frappe_japanese_translations
     (MIT、v15 と v16 用)は、大半が AI の下書きで人が見直していません
5. PDF の書体を確かめます。見積書を 1 枚 PDF にして、日本語が出ることを見ます
6. 帳票を作ります。見積書、発注書、納品書の形と、和暦の日付を、Print Format で作ります。
   会社のいまの帳票を見せてもらい、同じ項目を並べます
7. いまの ERP のデータを入れます。いまの ERP から CSV で出し、ERPNext の Data Import で
   読み込む形を作ります。読むだけにするか、移し切るかは、会社が決めます
8. 会計に使うときは、日本の決まりを足します。2026-09-27 に、ERPNext の develop と
   version-16 で確かめたことです
   * 日本の地域の設定(erpnext/regional)と、日本の勘定科目表(chart_of_accounts)が
     ありません。会社の勘定科目表を作って入れます
   * 税: 1 枚の請求書に 10% と 8% を混ぜるのは、Item Tax Template で設定できます
     (説明書の記載。試していません)。税の行ごとに 1 回丸めます(`round_row_wise_tax` を
     切ったとき)。切り捨ての丸め方はありません
   * インボイス制度: 登録番号は自由な文字の欄(`tax_id`)で、T と 13 桁の確かめが無く、
     標準の請求書に印刷されません。税率ごとの合計と、軽減税率の品目の印も出ません。
     国税庁の要件(https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice_about.htm)を
     読み、Print Format と custom app で足します。スターターが足す欄は、置き場所だけです。
     登録番号は自由な文字の欄で、Item の「税区分」は税の計算につながっていません。また、
     本体の Tax Category の訳も「税区分」で、名前がぶつかります
   * 源泉徴収: 1 つの税率は入りますが、100 万円を超える所の 20.42% の 2 段の計算と、
     円未満の切り捨てがありません
9. 作った物(翻訳、書体、帳票、日本の決まりの app)は、会社のリポジトリ([code](../code/))に
   置き、公開してよい物は GitHub に出します。次に使う会社が同じ物を作らずに済みます

## 出典

- frappe/erpnext(https://github.com/frappe/erpnext)v16.36.0、license.txt は GPL-3.0。
  frappe/frappe(https://github.com/frappe/frappe)v15.121.1、LICENSE は MIT
- frappe/frappe_docker(https://github.com/frappe/frappe_docker)v3.2.2、MIT。
  `pwd.yml`(https://github.com/frappe/frappe_docker/blob/main/pwd.yml)、
  README(https://github.com/frappe/frappe_docker/blob/main/README.md)
- frappe_docker の説明書「Build Setup」
  (https://github.com/frappe/frappe_docker/blob/main/docs/02-setup/02-build-setup.md)、
  「Backup Strategy」(https://github.com/frappe/frappe_docker/blob/main/docs/03-production/02-backup-strategy.md)、
  「Caddy with HTTPS」(https://github.com/frappe/frappe_docker/blob/main/docs/03-production/05-caddy-https.md)、
  overrides の `compose.mariadb.yaml` と `compose.redis.yaml`。2026-09-29 に確かめました
- maihatch/erpnext-ja-starter(https://github.com/maihatch/erpnext-ja-starter)、MIT、
  コミット b4942347e73a821d2be4c988638944b41896ed43(2026-04-25)。README に v16.13 の
  ERPNext と v16.14 の Frappe で動かしたとあります。2026-09-29 に読みました
- ERPNext version-13 の翻訳
  (https://github.com/frappe/erpnext/blob/version-13/erpnext/translations/ja.csv)。
  2026-09-29 に、スターターの ja.csv と比べました
- Debian の fonts-noto-cjk(https://packages.debian.org/bookworm/fonts-noto-cjk)、
  OFL-1.1。公式の画像は Debian bookworm です。2026-09-29 に確かめました
- frappe の設定のウィザード `setup_wizard.py`
  (https://github.com/frappe/frappe/blob/version-16/frappe/desk/page/setup_wizard/setup_wizard.py)。
  最初の利用者に付く役割を、2026-09-29 に読んで確かめました
- lifegence/frappe_japanese_translations(https://github.com/lifegence/frappe_japanese_translations)
- 国税庁「インボイス制度の概要」
  (https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice_about.htm)

2026-09-28 に確かめました(ERPNext の日本の決まりの調べは 2026-09-27)。
