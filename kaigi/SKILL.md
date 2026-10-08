---
name: aiai-tools-kaigi
description: 会社の会議と予約を自分のドメインに置くのを手伝う。Jitsi Meet(Teams、Zoom の置き換え)、Cal.diy(Bookings、Calendly の置き換え)、講義には BigBlueButton、カレンダーの同期は Radicale。
---

# 会議と予約を自分の側に

あなたは、この会社が会議と予約の仕組みを自分のドメインに置くのを手伝います。
専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 会議の録画とチャットには、社員とお客さんの話がそのまま入ります。残す物は
  [bunsho](../bunsho/) の置き場に移し、AI への依頼には入れません
- 会議の道具は、映像と音の通り道(UDP)を直接外に開く必要があります。[server](../server/) の
  ファイアウォールで、要る番号だけを開きます
- Cal.diy は、Cal.com の会社が「個人の、本番でない利用に強く勧める」「商用は Cal.com を」と
  書いています(公式の説明書、2026-09-28 に確かめました)。ライセンスは MIT で、使うこと自体は
  できます。会社が自分で守れるか(更新、バックアップ、個人の情報)を伝え、使うかどうかは
  会社が決めます

## 手順

1. 何に使うかを聞きます。社内の打ち合わせ、お客さんとの面談、外からの予約の受付、
   講義や研修(ホワイトボード、挙手、分けた部屋、出席)で、要る物が違います
2. Jitsi Meet を入れます(打ち合わせと面談)。ブラウザーだけで入れ、アプリもアカウントも
   要りません。公式の docker-jitsi-meet の手順です
   * Releases から最新の物を取って展開します(git clone ではありません)
   * `env.example` を `.env` に写し、`./gen-passwords.sh` で秘密の値を作ります
   * 設定のフォルダーを作り、`docker compose up -d` で動かします
   * 外に開く番号は 80/tcp、443/tcp、10000/udp です。Caddy の後ろに置くときは、
     `JVB_ADVERTISE_IPS` にサーバーの外の IP アドレスを書き、`/xmpp-websocket` の
     WebSocket を通します
3. 予約の受付を入れます(Cal.diy)。PostgreSQL([dodai](../dodai/))と Node.js が要ります。
   `NEXT_PUBLIC_WEBAPP_URL`、`NEXTAUTH_SECRET`(`openssl rand -base64 32` で作ります)を
   `.env` に入れます。確認とリマインダーのメールは [mail](../mail/) の SMTP から送ります
4. 講義と研修には BigBlueButton を入れます。専用の機械が要ります。公式の要件は、
   Ubuntu 22.04、CPU 8 コア、メモリー 16 GB、ディスク 500 GB(録画しないなら 50 GB)、
   80/tcp、443/tcp、16384〜32768/udp、上りと下り 250 Mbit/s 以上、公開の名前
   (`bbb.example.jp`)です。ほかの物と同じサーバーには置きません。入れるのは
   `bbb-install.sh`(v3.0.x-release)です
5. カレンダーの同期は Radicale(CalDAV)で持ちます。Thunderbird とスマートフォンの
   カレンダーが読み書きできます。aiseed.dev の「蔵」は、予定を .ics のファイルとして
   文書の置き場に置き、購読の URL で配る形です
6. 移すのは簡単です。会議の URL は使い捨てです。先の予定だけを .ics で出して新しい側に
   入れ、残す録画とチャットは文書の置き場に移します

## 出典

- Jitsi「Self-Hosting Guide - Docker」
  (https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker)。
  docker-jitsi-meet stable-11248(https://github.com/jitsi/docker-jitsi-meet/releases)、Apache-2.0
- Cal.diy の説明書(https://www.cal.diy/、https://www.cal.diy/installation)。
  リポジトリは https://github.com/calcom/cal.diy 、MIT。Cal.com の自分で置く説明書は、
  2026-09-28 時点で cal.diy に転送されます
- BigBlueButton「Install」(https://docs.bigbluebutton.org/administration/install/)。
  v3.0.37(https://github.com/bigbluebutton/bigbluebutton/releases)、LGPL-3.0
- Radicale(https://github.com/Kozea/Radicale)。GPL-3.0
- aiseed.dev「会議と予約を自分の側に」(https://aiseed.dev/ai-native-ways/software/meetings/)。CC BY 4.0

2026-09-28 に確かめました。
