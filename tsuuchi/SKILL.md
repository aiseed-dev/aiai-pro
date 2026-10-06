---
name: aiai-pro-tsuuchi
description: 事業用のアプリから会員に、取引の通知(招待、予約の確認、案内)をメールと Web Push で届けるのを手伝う。広告は入れない。Gmail と Yahoo の送信者の決まりに合わせる。
---

# 知らせを届ける(通知)

あなたは、この会社のアプリが会員に知らせを届ける仕組みを作るのを手伝います。
専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- SMTP のパスワードと、VAPID の秘密鍵は、会社の人が作って `.env` に入れます。会話にも、
  リポジトリにも入れません
- 会員のメールアドレスの一覧と、送った中身を、AI への依頼に貼りません。テンプレートは、
  差し込む欄の名前(`{予約の日}`)で作ります
- 通知には広告を入れません。広告や宣伝を含まず、広告のサイトへも誘わない取引の通知は、
  特定電子メール法の「特定電子メール」に当たりません(総務省と消費者庁のガイドライン)。
  広告を添えると当たり、前もっての同意や表示の決まりがかかります

## 決まり(2026-09-29 に確かめた)

- Gmail と Yahoo に届けるには、すべての送信者に、SPF か DKIM、送る IP の逆引き(PTR)、TLS、
  迷惑メールの報告率 0.3% 未満が要ります。1 日 5,000 通以上を Gmail に送るなら、SPF と DKIM の
  両方と DMARC も要ります
- Web Push は、ブラウザの標準(RFC 8030、8291、8292)です。iPhone と iPad は iOS 16.4 から、
  ホーム画面に追加した Web アプリで受け取れます。許可を求めてよいのは、利用者がボタンを押した
  ときだけです。Apple Developer Program の会員でなくても使えます

## 手順

1. 何を知らせるかを書き出します(招待、同意の文が変わったこと、予約の確認、前日の案内、
   新しいメッセージ)
2. 送る道を決めます。自分のメールサーバー([mail](../mail/) の Stalwart)から送るか、中継の
   サービス(SMTP リレー)を使うかです。中継を使うと、会員のアドレスを中継の会社に預けるので、
   [kaiin](../kaiin/) の委託として扱います
3. メールを送ります。アプリのサーバーから SMTP で送ります。PocketBase なら、Settings > Mail
   settings で SMTP を設定し(既定の sendmail は使いません)、フック(`pb_hooks` の `*.pb.js`)で
   `$app.newMailClient().send(...)`、決まった時刻の知らせは `cronAdd` で送ります
4. Web Push を送ります。画面(Web アプリ)で購読してもらい、購読の情報を会員に付けて置き、
   サーバーから pywebpush(MPL-2.0、2.5.0)で送ります。VAPID の鍵は会社の人が作ります
5. 届いたかを見ます。迷惑メールの報告率を見て、送った記録を残します

## 出典

- Google「Email sender guidelines」(https://support.google.com/mail/answer/81126)。Yahoo
  「Sender Best Practices」(https://senders.yahooinc.com/best-practices/)
- 総務省・消費者庁「特定電子メールの送信等に関するガイドライン」
  (https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/pdf/m_mail_081114_1.pdf)
- PocketBase「Sending emails」(https://pocketbase.io/docs/js-sending-emails/)、
  「Job scheduling」(https://pocketbase.io/docs/js-jobs-scheduling/)。v0.40.4
- Stalwart(https://github.com/stalwartlabs/stalwart)v0.16.24
- RFC 8030(https://www.rfc-editor.org/info/rfc8030)、RFC 8291(https://www.rfc-editor.org/info/rfc8291)、
  RFC 8292(https://www.rfc-editor.org/info/rfc8292)。WebKit「Web Push for Web Apps on iOS and iPadOS」
  (https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)。pywebpush
  (https://pypi.org/pypi/pywebpush/json)

2026-10-06 に確かめました。
