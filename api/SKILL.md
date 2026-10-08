---
name: aiai-tools-api
description: 会社の基幹の仕事の決まり(業務ロジック)を FastAPI の API に集めるのを手伝う。人は PocketBase の札で確かめ、データは PostgreSQL に置く。古い仕組みと並べて動かし、答えが同じになってから切り替える。
---

# API を作る(FastAPI)

あなたは、この会社が、仕事の決まり(受注、在庫、請求の計算など)を 1 つの API に集めるのを
手伝います。Web、スマートフォン、社内のアプリは、みなこの API を呼びます。
専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 「動いている物に触るな」は、書き直しが高かったときの決まりです。いまは AI が書き直せる
  ので、古い物と新しい物を並べて動かし、同じ入力で同じ答えが出ることを確かめてから
  切り替えます。答えが違ったら、どちらが正しいかを会社の人が決めます
- 仕事の決まりは、会社の人から聞いて書きます。あなたが決めたり推測したりしません。
  決まりの根拠(規程、契約、法令)を、コードのコメントに書きます
- 独自の方言(PL/SQL、T-SQL)を捨て、持ち運べる物(PostgreSQL の標準の SQL、Python)に
  します
- 人を確かめてからデータに触ります。すべての API で、先に PocketBase の札を確かめ、
  そのうえで「この人はこれを見てよいか」を API の側で決めます
- 本番のデータを AI への依頼に貼りません。テストのデータは、会社の人が架空で作ります

## 手順

1. いまの基幹の仕組みを聞きます(何で書かれているか、誰が直せるか、どの仕事が入っているか)。
   一度に全部でなく、1 つの仕事(たとえば見積の計算)から始めます
2. その仕事の決まりを、会社の人から聞いて、文章(Markdown か adoc)に書きます。
   これが仕様であり、コードはここから作ります
3. テストのデータを作ります。会社の人が、実際にあった形の架空の入力と、正しい答えを
   用意します。古い仕組みに入れた答えと、新しい API の答えを比べる物です
4. API を書きます。見本は [sample/main.py](sample/main.py) です
   * 人の確かめ: PocketBase の `auth-refresh` に札を送り、返った `record` を使います
     ([ninshou](../ninshou/))
   * データ: [dodai](../dodai/) の PostgreSQL に、標準の SQL で読み書きします
   * 部品は conda で入れます: `conda install -c conda-forge fastapi uvicorn httpx psycopg`
5. 画面が要るときは Flet で作ります。aiai の [moushikomi](https://github.com/aiseed-dev/aiai/tree/main/moushikomi) と同じ形
   (API と同じアドレスの `/app/` で Web の画面を出す)です
6. サーバーで動かします。systemd で `uvicorn` を `127.0.0.1:8400` で動かし、Caddy から
   `api.example.jp` で出します
7. 並べて動かします。同じ入力を古い仕組みと新しい API に入れ、答えを比べます。
   しばらく同じであれば、切り替えます。古い仕組みは、契約の更新まで読むだけで残します

## 出典

- FastAPI(https://github.com/fastapi/fastapi)。MIT
- PocketBase「API Records」の auth-refresh(https://pocketbase.io/docs/api-records/)
- aiseed-dev/workspace(蔵)の README(https://github.com/aiseed-dev/workspace)。
  FastAPI と PocketBase の introspection の例です
- aiseed.dev「API を作る」(https://aiseed.dev/ai-native-ways/software/fastapi/)。CC BY 4.0

2026-09-28 に確かめました。
