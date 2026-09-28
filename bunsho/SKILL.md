---
name: aiai-pro-bunsho
description: 会社の文書を Office の外に置くのを手伝う。ファイルは自分のサーバーのフォルダーに置き、ブラウザーで一緒に直すときは OnlyOffice Docs を使う。docx と xlsx は、外とやり取りする通り道にして、住む所にしない。
---

# 文書を取り戻す(OnlyOffice Docs)

あなたは、この会社が文書を自分のサーバーに置くのを手伝います。Office は「使う」のでなく
「通過させる」物にします。外の相手とは docx と xlsx でやり取りし、中身はファイルとして
自分の側に置きます。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 文書の中身を AI への依頼に貼らないでください。フォルダーの分け方と、誰が読めるかで、
  設計はできます
- `JWT_SECRET` は会社の人が決めて入れます。設定しないと、再起動のたびに変わって
  つながらなくなります(公式の説明書にそう書いてあります)
- ONLYOFFICE Docs の Community Edition は AGPL-3.0 です。社内で使う分には制約は
  ありませんが、外の人にサービスとして出すときは、AGPL の義務(変えたコードを渡せるように
  すること)が付きます
- 文書はデータベースの中でなく、ディスクのファイル(docx、xlsx、pptx、adoc、md)として
  置きます。人も、Polars も、AI も、そのまま読めます

## 手順

1. いま文書がどこにあるかを聞きます(SharePoint、Drive、共有フォルダー、個人の PC)。
   誰が読み、誰が書くか、部署ごとに聞きます
2. 置き場を決めます。サーバーのフォルダーに部署ごとに分け、誰が読めるかをフォルダーで
   決めます。aiseed.dev の「蔵」(aiseed-dev/workspace)は、権限をフォルダーの xattr に持ち、
   認証を PocketBase に任せ、FastAPI で出す形です。公開の版を参照できますが、
   aiai pro はそれを写しません。会社の AI が、会社の分け方に合わせて作ります
3. OnlyOffice Docs を入れます。見本は [compose.yaml](compose.yaml) です。Docs(編集の
   エンジン)だけを入れ、DocSpace は入れません。要る機械は、公式の説明書では CPU 2 コア
   2 GHz、メモリー 4 GB、ディスク 40 GB、スワップ 4 GB 以上です
   * `ports:` は `127.0.0.1:8081:80` にして、Caddy から `docs.example.jp` で出します
   * 9.4.0 で「同時に開ける文書が 20 までの制限」が無くなりました(CHANGELOG に
     「Removed the limitation of 20 simultaneously opened documents」とあります)
4. 自分のアプリから開けるようにします。開くには、文書の URL、保存の戻り先(callback)、
   `JWT_SECRET` で署名した設定を、エディターに渡します。同時編集の合わせ込みはエンジンが
   し、直した文書は戻り先に返ってくるので、それをファイルに書き戻します。
   認証は [ninshou](../ninshou/) の PocketBase に任せ、新しいアカウントを作りません
5. 手元で docx と xlsx を直す道具は、aiai と同じく officework([aiai の office](https://github.com/aiseed-dev/aiai/tree/main/office))も
   使えます。ブラウザーで何人かが一緒に直すときは OnlyOffice、1 人が手元で様式を埋めて
   PDF にするときは officework、と分けます
6. 移す順は、新しい文書からです。古い文書は、要る物だけを写し、SharePoint や Drive は
   契約の更新まで読むだけにします

## 出典

- ONLYOFFICE Help Center「Installing ONLYOFFICE Docs Community Edition for Docker」
  (https://helpcenter.onlyoffice.com/docs/installation/docs-community-install-docker.aspx)
- ONLYOFFICE DocumentServer の CHANGELOG(https://github.com/ONLYOFFICE/DocumentServer/blob/master/CHANGELOG.md)。
  v9.4.0、AGPL-3.0
- aiseed-dev/workspace(蔵)の README(https://github.com/aiseed-dev/workspace)
- aiseed.dev「文書を取り戻す」(https://aiseed.dev/ai-native-ways/software/documents/)。CC BY 4.0

2026-09-28 に確かめました。
