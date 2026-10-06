# aiai pro

AI との協働ツール

事業のための、AI との協働ツールです。会社や団体が、自分たちの IT を AI と一緒に自分で持つための
スキルを置いています。
[aiai](https://github.com/aiseed-dev/aiai) が個人と小さな店のための物なのに対し、aiai pro は、認証、コード、文書、
メール、会議、API、社内の AI、データ分析、ERP のように、会社が外のサービスに預けている物を、
OSS と AI で自分の側に置くための物です。

土台にしたのは、aiseed.dev の「AIネイティブな仕事の作法 — ソフトウェア開発編」の自立編
(https://aiseed.dev/ai-native-ways/software/、CC BY 4.0)です。そこにある考え方
(閉じた形式と外に預けた鍵がロックインの元であること、1 つずつ順に置き換えること、
1 人と AI で運用すること)を、aiai の決まり(スキルが中心、出典と確かめた日を付ける、
本人が決める)で書き直しました。2026-09-28 に確かめました。

## もう、コードは要らない時代です

会社がコードを買う、コードを書く人を雇う、コードを持つ会社に頼む。そのどれも、要らなくなりました。
コードは、何を作るかが決まっていれば、AI がその場で書きます。書き直しも AI がします。
コードを持っていることには、もう値打ちがありません。

値打ちがあるのは、何を作り、何を守り、どう確かめるかを、会社の言葉で書いた物です。それがこの
リポジトリのスキル(`SKILL.md`)です。会社の人は、何を自分の側に置くか、誰が何を見てよいか、
古い物をいつ止めるかを決めます。AI は、それを読んで、設定とコードを書きます。

企業の基幹システムは、AI で扱いやすい物です。受注、在庫、請求の計算のように、仕事の決まりが
はっきりしていて、データも表の形にそろっています。AI は、決まりを読んでコードを書き直し、
古い仕組みと同じ入力で同じ答えが出るかを比べて確かめられます([api](api/))。ネットワークと
Web の構築も同じです。DNS、ファイアウォール、リバースプロキシ、HTTPS、静的なサイトは、
公式の説明書に決まった形があり、設定はテキストで書けて、つながるかどうかで確かめられます
([server](server/)、[web](web/))。手間がかかるのは、
むしろ事業用のアプリにいつも出てくる部品(認証、本人確認、顔認識、メッセージ)です。法令と
他人の情報が絡むので、決まりを条文で確かめることが値打ちになります。

このリポジトリにあるコードと設定は、動く例です。写して使う物ではなく、会社の AI がスキルを
読んで作り直す物です。土台にした aiseed.dev の導入編は、AI が最も難しいコーディングの問題を
解くこと、ソフトウェアエンジニアの仕事を AI がすること、人の役割は何を作るかを決める
ビルダーになることを書いています(https://aiseed.dev/ai-native-ways/software/、CC BY 4.0、
2026-09-28 に確かめました)。

## 考え方

- 中心はスキル(`SKILL.md`)です。何を入れるか、何を守るか、どう確かめるかを書き、設定や
  プログラムは、会社の AI がその会社に合わせて作ります。動く例として置いた設定ファイルは、
  作り直してかまいません
- 置き換えは 1 つずつ、古い物と並べて動かし、確かめてから切り替えます。全部を一度に
  替えません
- 認証は 1 か所で持ち、何ができるかは道具ごとに決めます。自分で作るアプリの認証は
  PocketBase に集め、社員のサインインは Apple ID か Google ID でします。aiai と同じ理由で、
  Microsoft ID は足しません(認証の相手を 1 つ足すたびに、登録して手入れする所が 1 つ増えます)
- 外のサービスに頼るのは、大きな AI のモデルと、Web サイトの公開(Cloudflare Pages)と、
  メールの中継くらいにします。それ以外は OSS を自分のサーバーで動かします
- 秘密の値は、AI への依頼にも、このリポジトリにも、会社のリポジトリ([code](code/))にも
  入れません。具体的には、API のトークンと鍵(AWS のアクセスキー、Google Cloud のサービス
  アカウントの JSON の鍵、Cloudflare の API トークン、Apple のサインインの鍵 `.p8`、AI の
  API キー)、パスワードが入った接続文字列(`postgresql://ユーザー:パスワード@ホスト/…`)、
  `.env` のファイル、compose に直に書いた `JWT_SECRET` や `POSTGRES_PASSWORD`、SSH と TLS の
  秘密鍵、社員やお客さんのデータベースのファイルです。1 度 push すると、消しても漏れた物として
  扱い、まず無効にして作り直します。GitHub の個人のアカウントには push の前に止める機能
  (push protection)が最初から有効ですが、止められる物は一部です。Forgejo にはこの機能が
  あるかを確かめていません

  出典: GitHub Docs「Push protection」
  (https://docs.github.com/en/code-security/concepts/secret-security/push-protection)、
  「Removing sensitive data from a repository」
  (https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)。
  2026-09-28 に確かめました
- 社員やお客さんの個人の情報は、他人の情報です。本人の同意なく AI のサービスに入れ、それが
  応答以外(学習など)に使われると、個人情報保護法に反する可能性があると個人情報保護委員会が
  注意しています。入れるなら、そのサービスが学習に使わないことを確かめてからにします。
  自分の機械で動く AI([ai](ai/))なら、外に出ません。会社の名前、住所、電話は事業として
  出す物なので、AI に渡してかまいません

  出典: 個人情報保護委員会「生成 AI サービスの利用に関する注意喚起等」
  (https://www.ppc.go.jp/news/careful_information/230602_AI_utilize_alert/)。2026-09-28 に確かめました
- ライセンスを確かめてから入れます。この README の表に、確かめた版とライセンスを書いています

## 順番

aiseed.dev の自立編の順です。1 つ終わってから次に進みます。

| 順 | フォルダー | 入れる物 | 置き換える物 |
|---|---|---|---|
| 0 | [server](server/) | サーバー、Docker、Caddy、DNS、バックアップ | (すべての土台) |
| 1 | [dodai](dodai/) | SQLite、PostgreSQL + pgvector、DuckDB、Polars | Azure SQL、Cloud SQL、Power BI |
| 2 | [ninshou](ninshou/) | PocketBase | Entra ID、Google ID |
| 3 | [code](code/) | Forgejo | GitHub、SharePoint、Drive |
| 4 | [bunsho](bunsho/) | OnlyOffice Docs | Office、Docs/Sheets/Slides |
| 5 | [mail](mail/) | Stalwart | Exchange/Outlook、Gmail |
| 6 | [kaigi](kaigi/) | Jitsi Meet、Cal.diy、BigBlueButton、Radicale | Teams、Meet、Bookings |
| 7 | [web](web/) | Cloudflare Pages(aiai の `website/` と cf-publish) | WordPress、Power Pages |
| 8 | [api](api/) | FastAPI(認証は PocketBase、データは PostgreSQL) | Power Apps、Apps Script、古い基幹の仕組み |
| 9 | [jouhou](jouhou/) | OCR、分類、Markdown や adoc への書き起こし | (AI の前の整備) |
| 10 | [ai](ai/) | Ollama、AnythingLLM、pgvector で RAG | Copilot、Gemini |
| 11 | [bunseki](bunseki/) | Polars、scikit-learn、LightGBM、SHAP | 表のデータから予測する SaaS |
| 12 | [erpnext](erpnext/) | ERP とは何かを知り、ERPNext を自分の PC で動かす | (使えると分かってから考える) |

## 事業用のアプリの部品

事業用のアプリにいつも出てくる部品です。aiseed.dev の自立編にはない物で、順番はありません。
要る物から使います。認証は [ninshou](ninshou/) の「会員(お客さん)のサインイン」です。

| フォルダー | 中身 | 使う物 |
|---|---|---|
| [kaiin](kaiin/) | 会員を集めて預かる(招待、同意、本人が見て消せる、漏えいの報告) | aiai の soudan、PocketBase |
| [tsuuchi](tsuuchi/) | 通知(取引のメールと Web Push。広告は入れない) | Stalwart、pywebpush |
| [renraku](renraku/) | メッセージ(会社と会員。会員どうしは届出が要ることがある) | PocketBase |
| [honnin](honnin/) | 本人確認(民泊と簡易宿所の宿泊者名簿が中心) | PocketBase、Jitsi |
| [kagi](kagi/) | 鍵(スマートロックで期間を決めた鍵を出して消す) | Matter と Home Assistant、各社の API |
| [kanshi](kanshi/) | 住宅と空き家の VLM 監視と顔認識 | Frigate、Ollama、OpenCV Zoo |
| [network](network/) | Linux の PC をルーターにする | systemd-networkd、nftables、dnsmasq、Unbound、WireGuard、hostapd |

## 使い方

1. このリポジトリを手元に取り、スキルを読める AI を用意します

   ```
   git clone https://github.com/aiseed-dev/aiai-pro.git
   cd aiai-pro
   ```

   端末で動く道具は要りません。コードと設定は AI(Claude)が下書きし、コマンドは会社の人が
   動かします。Web サイト([web](web/))は、[aiai](https://github.com/aiseed-dev/aiai) の
   `website/` のスキルを使うので、aiai も手元に取ります
2. `server/SKILL.md` から順に AI に読ませます。AI が会社の人に聞きながら、
   1 つずつ入れます
3. サーバーに入る鍵、パスワード、DNS の設定、アカウントの登録、サーバーでコマンドを
   動かすことは、会社の人がします。AI は手順と設定の下書きを作ります
4. 見本の設定(`compose.yaml`、`Caddyfile`、`.env.example`)は、写して会社の名前と番号に
   直して使います。`.env` は `.gitignore` に入っていて、リポジトリに入りません
5. 表のデータから予測するときは、部品を conda で入れてから動かします

   ```
   conda install -c conda-forge polars fastexcel xlsxwriter scikit-learn lightgbm shap
   python bunseki/yosoku.py 学習.xlsx --target 目的の列
   ```

6. 出典は `python tools/kakunin.py --fetch --out 確認の結果.md` で確かめ直せます
   (aiai の物と同じスクリプトです)
7. 入れた物、困ったこと、変わっていたことは、[報告のしかた](HOUKOKU.md)で知らせてください

## 使う物

2026-09-28 に、各プロジェクトの公開の場所(GitHub、Codeberg、Docker Hub、公式の説明書)で
確かめました。版は、そのときの最新の物です。制度と同じで、版もライセンスも変わるので、
入れる前に確かめ直してください。

| 物 | 確かめた版 | ライセンス | 出典 |
|---|---|---|---|
| Docker Engine | (Ubuntu 22.04、24.04、26.04 LTS 用) | Apache-2.0 | https://docs.docker.com/engine/install/ubuntu/ |
| Caddy | v2.11.4 | Apache-2.0 | https://github.com/caddyserver/caddy/releases |
| PostgreSQL + pgvector | pgvector v0.8.6、画像 `pgvector/pgvector:pg18` まで | PostgreSQL License | https://github.com/pgvector/pgvector |
| DuckDB | v1.5.5 | MIT | https://github.com/duckdb/duckdb |
| Polars | py-1.44.2 | MIT | https://github.com/pola-rs/polars |
| PocketBase | v0.40.4 | MIT | https://github.com/pocketbase/pocketbase/releases |
| Forgejo | v16.0.5 | GPL-3.0 | https://codeberg.org/forgejo/forgejo/releases |
| ONLYOFFICE Docs | v9.4.0 | AGPL-3.0 | https://github.com/ONLYOFFICE/DocumentServer/releases |
| Stalwart | v0.16.24 | AGPL-3.0(独自の SELv2 との二重) | https://github.com/stalwartlabs/stalwart/releases |
| Jitsi Meet(docker-jitsi-meet) | stable-11248 | Apache-2.0 | https://github.com/jitsi/docker-jitsi-meet/releases |
| Cal.diy | (calcom/cal.diy) | MIT | https://github.com/calcom/cal.diy |
| BigBlueButton | v3.0.37 | LGPL-3.0 | https://github.com/bigbluebutton/bigbluebutton/releases |
| Radicale | (Kozea/Radicale) | GPL-3.0 | https://github.com/Kozea/Radicale |
| FastAPI | (fastapi/fastapi) | MIT | https://github.com/fastapi/fastapi |
| Tesseract、OCRmyPDF | (tesseract-ocr/tesseract、ocrmypdf/OCRmyPDF) | Apache-2.0、MPL-2.0 | https://github.com/tesseract-ocr/tesseract 、https://github.com/ocrmypdf/OCRmyPDF |
| Ollama | v0.34.4 | MIT | https://github.com/ollama/ollama/releases |
| AnythingLLM | v1.16.2 | MIT | https://github.com/Mintplex-Labs/anything-llm/releases |
| North Mini Code 1.0(Cohere) | 30B(3B が動く)MoE | Apache-2.0 | https://docs.cohere.com/docs/north-mini-code-1.0 |
| scikit-learn、LightGBM、SHAP | 1.9.1、4.7.0、0.52.0(conda-forge) | BSD-3-Clause、MIT、MIT | https://anaconda.org/conda-forge/ |
| ERPNext、Frappe Framework | v16.36.1、v16.35.0(画像 `frappe/erpnext:v16.36.1` に入っている組) | GPL-3.0、MIT | https://github.com/frappe/erpnext/releases 、https://github.com/frappe/frappe/releases |
| frappe_docker | v3.2.2 | MIT | https://github.com/frappe/frappe_docker/releases |
| erpnext-ja-starter(ERPNext の日本語) | コミット b494234(2026-04-25) | MIT | https://github.com/maihatch/erpnext-ja-starter |
| MariaDB、Redis(ERPNext の DB とキュー) | 11.8、8.6 | GPL-2.0、AGPL-3.0 を選べる | https://github.com/frappe/frappe_docker/tree/main/overrides |
| Noto CJK(fonts-noto-cjk、PDF の日本語) | 1:20220127(Debian bookworm) | OFL-1.1 | https://packages.debian.org/bookworm/fonts-noto-cjk |
| pywebpush | 2.5.0 | MPL-2.0 | https://pypi.org/project/pywebpush/ |
| ntfy | v2.28.0 | Apache-2.0 と GPL-2.0 | https://github.com/binwiederhier/ntfy |
| Home Assistant | 2026.9.4 | Apache-2.0 | https://github.com/home-assistant/core |
| Frigate | v0.18.0 | MIT | https://github.com/blakeblackshear/frigate |
| OpenCV Zoo の YuNet、SFace | (opencv/opencv_zoo) | MIT、Apache-2.0 | https://github.com/opencv/opencv_zoo |
| nftables、systemd | 1.1.7、v262 | GPL、LGPL-2.1 | https://www.netfilter.org/projects/nftables/ 、https://github.com/systemd/systemd |
| dnsmasq、Unbound | 2.93、1.26.1 | GPL、BSD-3-Clause | https://thekelleys.org.uk/dnsmasq/doc.html 、https://github.com/NLnetLabs/unbound |
| WireGuard(wireguard-tools)、hostapd | v1.0.20260223、2.12 | GPL-2.0、BSD | https://www.wireguard.com/install/ 、https://w1.fi/hostapd/ |

BigBlueButton のライセンスは、リポジトリの LICENSE を GitHub の API で確かめました。

ERPNext の画像に入っている Frappe の版は、画像の由来の記録(provenance)の `FRAPPE_BRANCH` で
確かめました。ERPNext v16.36.1 の `pyproject.toml` は、Frappe に `>=16.21.0,<17.0.0` を求めています
(https://github.com/frappe/erpnext/blob/v16.36.1/pyproject.toml 、2026-09-29 に確かめました)。

## いまの状態

- ここにある手順と設定は、各プロジェクトの公式の説明書から書き、URL と確かめた日を付けました。
  このリポジトリの中では、まだ実際にサーバーに入れて動かしていません。動かした人の報告で
  直します
- `api/sample/main.py` と `bunseki/yosoku.py` は動く例として書きましたが、この環境には
  部品(fastapi、polars、scikit-learn など)が入っていないので、まだ動かしていません。
  文法の確かめ(`python -m py_compile`)だけしています
- aiseed.dev の自立編が土台にしている公開のリポジトリ(aiseed-dev/workspace の「蔵」、
  aiseed-dev/aiseed-migration-kit、aiseed-dev/cf-publish)は、それぞれのフォルダーで
  参照しています。aiai pro はそれらを写しません

## ライセンス

コード(`.py`、`.js`、`.css`、`.toml`)は AGPL-3.0-or-later(全文は [COPYING](COPYING))、それ以外(文書、
設定の見本、画像)は CC BY 4.0 です。詳しくは [LICENSE](LICENSE) にあります。aiai と同じ決まりです。aiseed.dev の文章(CC BY 4.0)を元にした所は、この README と各フォルダーの
`SKILL.md` に出典を書いています。
