---
name: aiai-pro-mail
description: 会社のメールを自分のサーバーの Stalwart に置くのを手伝う。Exchange と Gmail の置き換え。DNS(MX、SPF、DKIM、DMARC、PTR)を整え、imapsync で古いメールを写し、Thunderbird で読む。
---

# メールを自分の側に(Stalwart)

あなたは、この会社がメールを自分のサーバーに置くのを手伝います。メールは事業の記録
そのものです。受け取る箱は自分の側に置き、届ける確かさが要る所(送信)は、中継の
サービスに任せる選択もあります。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- メールの中身と、社員の一覧を AI への依頼に貼らないでください
- 管理者のパスワードは、初回の起動の記録(ログ)に出ます。会社の人が読んで、すぐに変えます
- DNS を切り替える(MX を向ける)のは、並べて動かして確かめた後です。切り替える日を決め、
  戻す手順も先に書いておきます
- サーバーの IP アドレスが、送信を拒まれる一覧(ブラックリスト)に入っていないかを、
  借りる前に確かめます。入っていると、送ったメールが届きません

## 手順

1. いまのメールを聞きます(Microsoft 365 か Google Workspace か、人数、ドメイン、
   共有の箱があるか)
2. Stalwart を入れます。見本は [compose.yaml](compose.yaml) です。画像は
   `stalwartlabs/stalwart:v0.16` のように小さい版で止めます(公式の説明書が勧めています)。
   開く番号は、25(SMTP)、587 と 465(送信)、143 と 993(IMAP)、110 と 995(POP3)、
   4190(Sieve)、443 と 8080(Web の管理)です。メールの番号は、コンテナーが直接外に
   開く必要があるので、`ports:` でそのまま開きます。管理の画面だけ Caddy から出します
   * 初回の起動で、`docker logs stalwart 2>&1 | grep -A8 'bootstrap mode'` に管理者の
     仮のパスワードが出ます。`http://サーバー:8080/admin` で設定を始めます
   * 置き場は、何もしなければ RocksDB です。[dodai](../dodai/) の PostgreSQL に
     替えるときは、設定の画面から替えられます
3. DNS を整えます。会社の人がします
   * MX: `mail.example.jp` に向けます
   * SPF: このサーバーから送ることを許します
   * DKIM: Stalwart が作った鍵を DNS に置きます
   * DMARC: 方針と報告の宛先を書きます
   * PTR(逆引き): サーバーの IP アドレスから `mail.example.jp` が引けるようにします。
     借りるサーバーの設定の画面で決めます
4. 社員のアカウントを作ります。管理の画面の Account Manager で作ります。
   認証を外の OpenID Connect の提供者に任せることもできます(Stalwart の directory の
   `Oidc`)。PocketBase は提供者になれないので、そうするなら Forgejo などです
   ([ninshou](../ninshou/) を見てください)
5. 読む道具を決めます。PC は Thunderbird(Windows、Mac、Linux)、スマートフォンは
   IMAP に対応した標準のメールのアプリです
6. 古いメールを写します。`imapsync` で、Microsoft 365 や Gmail から Stalwart に写します。
   写している間は両方が動いているので、社員は仕事を止めずに済みます
7. 並べて動かして確かめてから、MX を切り替えます。切り替えた後も、古い側は契約の
   更新まで残し、届かなかった物が無いかを見ます

## 出典

- Stalwart「Docker」(https://stalw.art/docs/install/platform/docker)、
  「OpenID Connect directory」(https://stalw.art/docs/auth/backend/oidc)。
  v0.16.24(https://github.com/stalwartlabs/stalwart/releases)、AGPL-3.0
- aiseed.dev「メールを自分の側に」(https://aiseed.dev/ai-native-ways/software/mail/)。CC BY 4.0

2026-09-28 に確かめました。
