---
name: aiai-pro-erpnext
description: ERP とは何かを伝え、ERPNext(GPL-3.0 の OSS の ERP)を日本語で、自分の PC で動かせる環境を作るのを手伝う。一人がすべての画面と設定を触れる形にする。
---

# ERPNext を自分の PC で動かす

あなたは、この会社の人が ERP とは何かを知り、ERPNext を自分の PC で動かして触れるように
するのを手伝います。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 秘密の値(パスワード)を、会話にも、リポジトリにも書きません。`.env` に会社の人が入れます
- ダウンロード(Docker の画像は数 GB)の前に、名前、出どころ、大きさを伝えて許しを得ます
- 会社の取引のデータを AI への依頼に貼りません

## ERP とは何か

ERP は、会社の仕事(売る、買う、在庫、会計、人)を 1 つのデータベースで扱うソフトです。
ERPNext の説明書は「会社の中枢神経で、すべてを 1 か所に集める物」と書いています。

仕事ごとに別の表やソフトを使うと、同じことを何度も入力し、数が合わなくなります。ERP では、
1 つの出来事を 1 度だけ入れ、次の書類はそこから作ります。ERPNext の例です。

- 売る: 見積(Quotation)→ 受注(Sales Order)→ 納品(Delivery Note)→ 請求(Sales Invoice)。
  前の書類を開いて「作成」を押すと、次の書類が中身を引き継いでできます
- 書類には状態があります。下書き(Draft)は帳簿に何も起きません。確定(Submit)すると帳簿に
  記帳され、請求なら売掛金と売上と税の仕訳が自動でできます。取消(Cancel)すると、その記帳が
  打ち消されます。確定した書類は書き換えず、取り消して直した物(Amend)を作ります
- 買う、在庫、会計、人、プロジェクト、資産も、同じ形でつながっています

これを、動かした環境で実際に 1 件通して見るのが、いちばん早く分かります(手順 4)。

## 手順

1. 見本を読みます。このフォルダーの [Dockerfile](Dockerfile)、[compose.yaml](compose.yaml)、
   [.env.example](.env.example) です。公式の画像 `frappe/erpnext:v16.36.1` に、次を足します
   * 日本語の画面: 有志の maihatch/erpnext-ja-starter(MIT)の custom app `erpnext_jp_core`。
     翻訳(`translations/ja.csv`)と、入れたときに言語、国、時刻、通貨を日本にする処理が入っています
   * PDF の日本語の書体: Debian の `fonts-noto-cjk`(OFL-1.1、53.9MB)
   * 画面は `127.0.0.1:8080` だけに開きます。同じ PC からだけ使えます
2. PC に Docker を入れます(Windows と Mac は Docker Desktop、Linux は Docker Engine)。
   スターターを、確かめたコミットで、このフォルダーに取ります

   ```
   git clone https://github.com/maihatch/erpnext-ja-starter erpnext/erpnext-ja-starter
   git -C erpnext/erpnext-ja-starter checkout b4942347e73a821d2be4c988638944b41896ed43
   ```

   AI に `erpnext_jp_core/hooks.py`、`install.py`、`patches/add_japan_tax_fields.py` を読ませ、
   何が入るかを会社の人に伝えます。2026-09-29 に読んだときは、言語を ja、国を Japan、
   時刻を Asia/Tokyo、通貨を JPY にし、Company と Item に欄を 3 つ足すだけでした
3. 動かします。`.env` の `変えてください` は、会社の人が入れます

   ```
   cd erpnext
   cp .env.example .env
   docker compose up -d --build
   docker compose logs -f create-site
   ```

   `http://localhost:8080` を開き、`Administrator` と `.env` の `ADMIN_PASSWORD` で入ると、
   設定のウィザードが始まります。言語は「日本語」、国は「Japan」にし、会社の名前と、
   自分の名前、メールアドレス、パスワードを入れます。ウィザードが作るこの利用者には、
   すべての役割と System Manager が付くので、一人で何でもできます(frappe の
   `setup_wizard.py`。2026-09-29 に version-16 で確かめました)。ふだんはこの利用者で入ります
4. 1 件通して触ります。お客さん、品目を 1 つずつ作り、見積 → 受注 → 納品 → 請求と進め、
   請求を確定して、会計の画面(総勘定元帳)に仕訳ができたことを見ます。見積を PDF にして、
   日本語が出ることも見ます。訳は有志の物で、Submit が「提出」のように、合わない語も
   あります
5. 止める、戻すを覚えます

   ```
   docker compose stop
   docker compose start
   docker compose exec backend bench --site all backup --with-files
   ```

   `docker compose down -v` は、データ(volume)ごと消えます。バックアップのファイルは、
   コンテナーの `sites/localhost/private/backups/` にできます

## 出典

- ERPNext の説明書「Introduction」(https://docs.frappe.io/erpnext/introduction)、
  「Sales Invoice」(https://docs.frappe.io/erpnext/sales-invoice)。2026-09-29 に読みました
- frappe/erpnext(https://github.com/frappe/erpnext)、GPL-3.0。画像 `frappe/erpnext:v16.36.1`
  (https://hub.docker.com/r/frappe/erpnext/tags)には、ERPNext v16.36.1 と Frappe v16.35.0(MIT)が
  入っています(画像の由来の記録の `FRAPPE_BRANCH` と `ERPNEXT_BRANCH`)
- frappe/frappe_docker(https://github.com/frappe/frappe_docker)、MIT。`pwd.yml`
  (https://github.com/frappe/frappe_docker/blob/main/pwd.yml)、overrides の `compose.mariadb.yaml` と
  `compose.redis.yaml`、「Backup Strategy」
  (https://github.com/frappe/frappe_docker/blob/main/docs/03-production/02-backup-strategy.md)
- maihatch/erpnext-ja-starter(https://github.com/maihatch/erpnext-ja-starter)、MIT、
  コミット b4942347e73a821d2be4c988638944b41896ed43(2026-04-25)
- Debian の fonts-noto-cjk(https://packages.debian.org/bookworm/fonts-noto-cjk)、OFL-1.1
- frappe の `setup_wizard.py`
  (https://github.com/frappe/frappe/blob/version-16/frappe/desk/page/setup_wizard/setup_wizard.py)

2026-09-29 に確かめました。
