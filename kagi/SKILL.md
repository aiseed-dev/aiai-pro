---
name: aiai-tools-kagi
description: 民泊や小さな宿、事務所の扉に、スマートロック(電気錠)を付け、本人確認が済んだ人にだけ、決めた期間だけ使える鍵(暗証番号など)を自分のアプリから出して消すのを手伝う。Matter と Home Assistant で手元から動かす道と、クラウドの API(RemoteLOCK、SwitchBot、igloohome など)を比べる。Aliro も見ておく。
---

# 鍵を出す(スマートロック)

あなたは、この会社が、扉の鍵を自分のアプリから出したり消したりできるようにするのを
手伝います。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 鍵を出すのは、本人確認が済んだ泊まりや人にだけにします([honnin](../honnin/))。
  出した鍵は、期間が終わったら消します
- 錠のメーカーの API のトークン、Home Assistant の長期のアクセストークンは、会社の人が作って
  `.env` に入れます。会話にも、リポジトリにも入れません
- 分譲マンションの玄関扉に手を加える前に、その建物の規約を会社の人が確かめます。
  国交省の標準管理規約では、錠と内側の塗装は専有部分、扉の外側は共用部分です。共用部分や
  外観に関わる工事は、理事長の承認が要ります(第 7 条、第 17 条、第 22 条とそのコメント)
- 電池切れ、ネットが切れたとき、アプリが止まったときに、どう開けるかを先に決めます。
  物理の鍵か、錠の中に残る暗証番号です

## 選び方(2026-09-29 に確かめた)

| | 動かし方 | 期間を決めた鍵 | 止まったとき |
|---|---|---|---|
| Matter の錠 + Home Assistant(Apache-2.0、2026.9.4) | 手元(Wi-Fi か Thread)。クラウドなし | 錠の機能(Door Lock の YearDay スケジュール)にはある。Home Assistant のサービスには、利用者と暗証番号を入れる・消す(`set_lock_credential`、`clear_lock_credential`)はあるが、スケジュールを入れる物はない | 錠の機種しだい |
| RemoteLOCK(構造計画研究所) | クラウド。OAuth 2.0 | Access Guest の開始と終了の日時で PIN を出す | 出してある番号は Wi-Fi が切れても使える。API を使うには NDA が要る |
| SwitchBot ロック + キーパッド | クラウド(API v1.1) | キーパッドに期間限定か一回だけの番号を作れる。結果は Webhook で届く | 元の鍵で開けられる |
| igloohome | クラウドの API。PIN の確かめは錠がオフラインでする(algoPIN) | 有効期間を組み込んだ PIN | 錠がネットにつながらなくても PIN を確かめる。API は 1 台あたり月 2 ドル |
| SESAME(CANDY HOUSE) | クラウドの Web API(`x-api-key`)。Wi-Fi モジュール 2 につないだ錠に送る | 作れない | ― |

- Matter: 1.4 で、錠に Aliro の資格情報を渡す機能が入りました。Home Assistant の Matter の
  つなぎ役は、python-matter-server(8.1.2 で終わり)から matterjs-server(v1.4.0、ベータ)に
  移っています
- Aliro: CSA が 2026-02-26 に 1.0 を公開した、スマートフォンや腕時計を鍵にする規格です
  (NFC、Bluetooth、UWB)。Apple、Google、Samsung などが加わっています。資格情報に期間を
  入れられますが、鍵を人に分ける機能は「これからの段階」とされています。日本で Aliro の錠を
  売っているかは確かめていません。いまは見ておく物です
- SESAME: Web API でできるのは、状態と履歴を読むことと、施錠、解錠、切り替え(コマンド 82、83、
  88)だけです。暗証番号(SESAME Touch など)の追加と削除は、Bluetooth のコマンド(SesameSDK、
  MIT)で行うので、アプリから期間を決めた番号を出すには、錠のそばに Bluetooth で話せる機械を
  置く必要があります。番号を出さずに、本人確認が済んだ人の求めに応じてアプリが Web API で
  解錠する形なら、クラウドだけで動きます。Hub3 につなぐと Matter に対応しますが、Matter から
  暗証番号を入れられるかは確かめていません

## 手順

1. 扉を聞きます。建物(戸建て、分譲マンション、賃貸)、今の錠のメーカーと型、共用玄関が
   あるか、部屋の数
2. 分譲マンションなら、規約を会社の人が確かめます。確かめた結果を書いておきます
3. 錠と動かし方を選びます。上の表を見せ、会社が決めます。手元で動かすなら Matter と
   Home Assistant、クラウドでよければ各社の API です
4. アプリとつなぎます。泊まり(`stays`、[honnin](../honnin/))の状態に合わせます
   * 本人確認が済んだら: 鍵を作ります。Home Assistant なら、REST API で
     `matter.set_lock_credential` を呼び、泊まりごとに新しい暗証番号を入れます。クラウドの
     API なら、開始と終了の日時を付けて作ります
   * チェックアウトの時刻: 鍵を消します。PocketBase の cron で、終わった泊まりの鍵を消す仕事を
     動かします。Home Assistant にはスケジュールのサービスが無いので、消すのはアプリの役目です。
     消せなかったときに係の人に知らせます([tsuuchi](../tsuuchi/)。自分のサーバーに置ける ntfy
     なら、cron の仕事から `curl` 1 行で係の人のスマートフォンに送れます)
   * 暗証番号は、宿泊者に知らせる物です。番号そのものはデータベースに残さず、知らせた記録だけ
     残します
5. 開け閉めの記録を受けます。Webhook か Home Assistant のイベントで、いつ開いたかを泊まりに
   付けて残します。人が来たかどうかは、カメラと合わせて見られます([kanshi](../kanshi/))
6. 止まったときの手順を書きます。電池の替え時、物理の鍵の置き場所と渡し方、係の人が駆け
   つける時間(民泊のガイドラインは、苦情から 30 分以内を目安にしています)

## 出典

- 国交省「マンション標準管理規約(単棟型)」令和 7 年改正
  (https://www.mlit.go.jp/jutakukentiku/house/content/001999013.pdf)第 7 条、第 12 条、第 14 条、
  第 17 条、第 22 条とコメント
- 住宅宿泊事業法施行規則(https://laws.e-gov.go.jp/law/429M60000900002)第 4 条。観光庁
  「住宅宿泊事業法施行要領(ガイドライン)」(https://www.mlit.go.jp/kankocho/minpaku/content/001622384.pdf)
- Matter の Door Lock クラスター
  (https://github.com/project-chip/connectedhomeip/blob/master/data_model/1.4/clusters/DoorLock.xml)。
  Home Assistant の Matter のサービス
  (https://github.com/home-assistant/core/blob/2026.9.4/homeassistant/components/matter/services.yaml)、
  Matter の説明(https://github.com/home-assistant/home-assistant.io/blob/current/source/_integrations/matter.markdown)。
  python-matter-server(https://github.com/matter-js/python-matter-server)、matterjs-server
  (https://github.com/matter-js/matterjs-server)
- CSA「Introducing Aliro 1.0」
  (https://csa-iot.org/newsroom/introducing-aliro-1-0-a-unified-standard-to-transform-the-access-control-ecosystem/)、
  Aliro の FAQ(https://csa-iot.org/all-solutions/aliro/aliro-faq/)
- RemoteLOCK(https://remotelock.kke.co.jp/faq/、https://developer.remotelock.com/api/docs)、
  SwitchBot API(https://github.com/OpenWonderLabs/SwitchBotAPI)、SESAME
  (https://github.com/CANDY-HOUSE/API_document、Web API
  https://github.com/CANDY-HOUSE/API_document/blob/master/SesameOS3/webapi.md、Hub3 と Matter
  https://jp.candyhouse.co/products/sesame5)、Nuki(https://developer.nuki.io/t/bridge-http-api/26)、
  igloohome(https://docs.igloohome.co/home、https://www.igloohome.co/developers)
- ntfy(https://docs.ntfy.sh/、https://github.com/binwiederhier/ntfy)v2.28.0、Apache-2.0 と GPL-2.0

2026-09-29 に確かめました。
