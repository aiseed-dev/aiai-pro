---
name: aiai-pro-erpnext
description: ERPNext(GPL-3.0 の OSS の ERP)を日本の会社で使える形にするのを手伝う。いまの ERP を置き換えず、照会と周りの仕事(CRM、見積、購買の依頼、プロジェクト、備品、社内の問い合わせ)から入る。日本語、書体、帳票、CSV のつなぎ、インボイス制度、勘定科目、源泉徴収の順。
---

# ERPNext を日本の会社で使える形にする

あなたは、この会社が ERPNext を使えるようにするのを手伝います。ソースがすべて手元にある
ERP なので、AI に読ませて構造を理解させ、会社に合わせて直せます。
専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- いまの ERP を置き換えません。まず照会(いまの ERP のデータを CSV で写して見る)と、
  周りの仕事(CRM、見積、購買の依頼、プロジェクト、備品、社内の問い合わせ)から入ります。
  会計まで広げるのは、日本の決まり(インボイス制度、勘定科目、源泉徴収)が入ってからです
- 会社の取引のデータを AI への依頼に貼りません。DocType の名前と項目で設計はできます
- 本体(frappe/erpnext、frappe/frappe)のコードは直さず、別のアプリ(Frappe の custom app)で
  足します。本体を直すと、版を上げるたびに当て直すことになります
- ERPNext は GPL-3.0、Frappe Framework は MIT です。作ったアプリを人に渡すときの決まりは
  [README](README.md) の「ライセンス」を読み、会社の人に伝えます
- 試す前に、ダウンロード(Docker の画像は数 GB)の名前、出どころ、大きさを伝えて
  許しを得ます

## 手順

1. 何から入るかを聞きます。いまの ERP は何か、周りの仕事のうち、いまいちばん困っている物は
   どれか(たとえば、見積が Excel でばらばら、備品の管理が無い)
2. 試します。frappe_docker の `pwd.yml` で、使い捨ての物が動きます

   ```
   git clone https://github.com/frappe/frappe_docker
   cd frappe_docker
   docker compose -f pwd.yml up -d
   ```

   `http://localhost:8080` に `Administrator` と `admin` で入ります。画像は
   `frappe/erpnext:v16.36.0`(pwd.yml に書いてある版)です。README に「短い評価のため
   だけの物で、custom app は入れられない」とあります。本番は、frappe_docker の
   `docs/03-production/`(TLS、バックアップ、複数の site、Caddy での HTTPS)を読んで作ります
3. 日本語にします。本体には ja の翻訳がありません(erpnext/locale と frappe/locale に
   ありません。2026-09-27 に確かめました)。有志の lifegence/frappe_japanese_translations
   (MIT、v15 と v16 用)は、大半が AI の下書きで人が見直していません。使うなら、会社が
   使う画面から順に、会社の人が見直します。見直した物は、その有志のリポジトリに返します
4. 書体を入れます。公式の Docker の画像には、PDF の日本語の書体がありません。
   custom app の画像に、開いた書体(IPAex や Noto CJK など。ライセンスを確かめます)を足します
5. 帳票を作ります。見積書、発注書、納品書の形と、和暦の日付を、Print Format で作ります。
   会社のいまの帳票を見せてもらい、同じ項目を並べます
6. いまの ERP とつなぎます。いまの ERP から CSV で出し、ERPNext の Data Import で
   読み込む形を作ります。まず照会だけ(読むだけ)にし、書き戻しません
7. 会計まで広げるときは、日本の決まりを足します。2026-09-27 に、ERPNext の develop と
   version-16 で確かめたことです
   * 日本の地域の設定(erpnext/regional)と、日本の勘定科目表(chart_of_accounts)が
     ありません。会社の勘定科目表を作って入れます
   * 税: 1 枚の請求書に 10% と 8% を混ぜるのは、Item Tax Template で設定できます
     (説明書の記載。試していません)。税の行ごとに 1 回丸めます(`round_row_wise_tax` を
     切ったとき)。切り捨ての丸め方はありません
   * インボイス制度: 登録番号は自由な文字の欄(`tax_id`)で、T と 13 桁の確かめが無く、
     標準の請求書に印刷されません。税率ごとの合計と、軽減税率の品目の印も出ません。
     国税庁の要件(https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice_about.htm)を
     読み、Print Format と custom app で足します。有志の maihatch/erpnext-ja-starter(MIT)は、
     登録番号など 3 つの欄を足す物です
   * 源泉徴収: 1 つの税率は入りますが、100 万円を超える所の 20.42% の 2 段の計算と、
     円未満の切り捨てがありません
8. 作った物(翻訳、書体、帳票、日本の決まりの app)は、会社のリポジトリ([code](../code/))に
   置き、公開してよい物は GitHub に出します。次に使う会社が同じ物を作らずに済みます

## 出典

- frappe/erpnext(https://github.com/frappe/erpnext)v16.36.0、license.txt は GPL-3.0。
  frappe/frappe(https://github.com/frappe/frappe)v15.121.1、LICENSE は MIT
- frappe/frappe_docker(https://github.com/frappe/frappe_docker)v3.2.2、MIT。
  `pwd.yml`(https://github.com/frappe/frappe_docker/blob/main/pwd.yml)、
  README(https://github.com/frappe/frappe_docker/blob/main/README.md)
- lifegence/frappe_japanese_translations(https://github.com/lifegence/frappe_japanese_translations)、
  maihatch/erpnext-ja-starter(https://github.com/maihatch/erpnext-ja-starter)
- 国税庁「インボイス制度の概要」
  (https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice_about.htm)

2026-09-28 に確かめました(ERPNext の日本の決まりの調べは 2026-09-27)。
