# このリポジトリで作業するときの決まり

aiai pro は、会社や団体が、認証、コード、文書、メール、会議、API、社内の AI、データ分析、ERP を、
OSS と AI で自分の側に置くためのスキルを置くリポジトリです。個人と小さな店のための
[aiai](https://github.com/aiseed-dev/aiai) と同じ発注者の、別のリポジトリです。
書き方、確かめ方、作業の進め方は aiai の CLAUDE.md と同じで、ここには違う所と、この
リポジトリで決めたことだけを書きます。

## 方針(発注者が決めたこと)

- 土台は aiseed.dev の「AIネイティブな仕事の作法 — ソフトウェア開発編」の自立編
  (https://aiseed.dev/ai-native-ways/software/、CC BY 4.0)。順番もそれに合わせる。aiseed.dev の
  文と公式の説明書が違うときは、公式の説明書に合わせ、違いを README に書く
- 中心はスキル(`SKILL.md`)。設定の見本(`compose.yaml`、`Caddyfile`)と `.py` は動く例で、
  作り直してよい。今あるファイルは消さない
- 置き換えは 1 つずつ、古い物と並べて動かし、確かめてから切り替える
- 認証は、自分で作るアプリの分を PocketBase に集め、社員のサインインは Apple ID と Google ID。
  Microsoft ID は移る間の選択肢とだけ書く。PocketBase は OpenID Connect の提供者にならないので、
  OSS の道具の認証はそれぞれが持つ(2026-09-28 に確かめた)
- 使う OSS は、OSI の認めたライセンスの物にする。Open WebUI と LobeChat は条件を足した
  ライセンスなので使わず、AI の画面は AnythingLLM(MIT)にする
- コードの開発は Claude でよい。端末で動くコーディングエージェントを前提にしない。
  コードと設定は AI が下書きし、コマンドは会社の人が動かす
- 秘密の値(パスワード、鍵、トークン)と、社員やお客さんの個人の情報は、AI への依頼にも
  リポジトリにも入れない。見本には `変えてください`、`example.jp`、`127.0.0.1` を書く
- Web サイトは aiai の `website/` のスキルを使い、ここでは作り直さない。officework も aiai と
  同じく、公開された版を使うだけにする
- ERPNext は、いまの ERP を置き換えず、照会と周りの仕事から入る。GPL と「自社利用限定」の
  関係は `erpnext/README.md` に書いてあり、法律の助言ではないと明記する

## 作業の進め方(aiai と違う所)

- 作業を始めるときに `python tools/kakunin.py --fetch` を動かす。`tools/kakunin.py` は aiai の物と
  同じスクリプトで、標準ライブラリだけで動く。直すときは aiai の側を直し、ここに写す
- ダウンロード(apt、docker pull、pip、conda、モデル)は、名前、出どころ、大きさを伝えて
  許しを得てからする。このリポジトリの中では、サーバーに入れて動かすことはしない
- Issue のラベルは「入れた記録」「提案」「新しい情報」。GitHub のリポジトリと
  ラベルは発注者が作る
- push は発注者がする。コミットまでで止める。コミットは触ったファイルだけを名前で指定する

## 中身

| 場所 | 中身 |
|---|---|
| `server/`、`dodai/`、`ninshou/`、`code/`、`bunsho/`、`mail/`、`kaigi/`、`web/`、`api/`、`jouhou/`、`ai/` | aiseed.dev の自立編の順のスキル。見本の設定と `api/sample/main.py` |
| `bunseki/` | 表のデータから予測する(Polars、scikit-learn、LightGBM、SHAP)。`yosoku.py` |
| `erpnext/` | ERPNext を日本の会社で使える形にする。`README.md` にライセンスの決まり |
| `tools/kakunin.py` | 出典の URL と確かめた日を集め、確かめ直す物を出す。aiai と同じ |
| `HOUKOKU.md`、`.github/ISSUE_TEMPLATE/` | 報告のしかたと Issue のひな形 |

## 残っていること(2026-09-28 時点)

- どのスキルも、まだサーバーに入れて動かしていない。手順と版は公式の説明書で確かめた
  (2026-09-28)。動かした人の報告で直す
- `api/sample/main.py` と `bunseki/yosoku.py` は py_compile だけ。部品(fastapi、polars、
  scikit-learn など)が入っていない。conda で入れて動かすには、発注者の許しが要る
- Cal.com の自分で置く版は cal.diy(MIT)に分かれ、「個人の、本番でない利用に強く勧める」と
  書いてある。使うかどうかは会社が決める形にした
- ERPNext の日本の決まり(日本語、書体、帳票、インボイス制度、勘定科目、源泉徴収)は、
  調べ(2026-09-27)を手順に書いただけで、custom app はまだ作っていない
- GitHub のリポジトリ(aiseed-dev/aiai-pro、公開)は発注者が作る。作ったらラベルを作る
