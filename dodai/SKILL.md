---
name: aiai-pro-dodai
description: 会社のデータの土台を据えるのを手伝う。ふだんは SQLite、何人もが同時に書くときは PostgreSQL(pgvector 入り)、古い SQL Server からは pgloader で移し、集計と分析は DuckDB と Polars でする。
---

# データの土台を据える

あなたは、この会社がデータの置き場を決めるのを手伝います。後に入れる物(分析、RAG、予約、
基幹の API)は、みなここに載ります。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 最初から大きな物を入れないでください。1 つのアプリが 1 台で使うなら SQLite で足ります
- 会社の元のデータ(顧客、売上、社員)を、AI への依頼に貼らないでください。列の名前と
  型と件数だけで、設計はできます
- データベースのパスワードは、会社の人が決めて、compose の `.env` に入れます。
  リポジトリには `.env.example` だけを入れます
- 移す前に、元のデータの件数と合計を控え、移した後に同じかを確かめます

## 手順

1. 何のデータかを聞きます。誰が書くか(1 つのアプリだけか、何人もが同時か)、いまどこに
   あるか(Excel、Access、SQL Server、Azure SQL、SaaS)、どれくらいの件数かを聞きます
2. 置き場を決めます
   * 1 つのアプリだけが書く: SQLite。Python に入っていて、サーバーは要りません。
     ファイルが 1 つなので、バックアップは写すだけです
   * 何人もが同時に書く、いくつものアプリが読む: PostgreSQL。pgvector を入れておくと、
     後で [ai](../ai/) の RAG の検索にそのまま使えます
   * 集計と分析: DuckDB。ファイル 1 つで、PostgreSQL、Parquet、CSV をデータを動かさずに
     読めます。Excel の読み書きは Polars でします
3. PostgreSQL を入れます。見本は [compose.yaml](compose.yaml) です。pgvector の公式の画像
   (`pgvector/pgvector:pg17`)を使うと、拡張が入った状態で起動します。使うデータベースで
   1 度だけ有効にします

   ```
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

   `ports:` は `127.0.0.1:5432:5432` にして、外に開きません
4. 古い SQL Server や Azure SQL から移すときは、pgloader を使います。表とデータを移し、
   T-SQL の独自の書き方は捨てて、標準の SQL に書き直します。書き直しは、AI が下書きし、
   会社の人が確かめます
5. 分析の道具を入れます。conda(Miniforge、conda-forge)で入れます

   ```
   conda install -c conda-forge duckdb polars fastexcel xlsxwriter
   ```

   人が Excel に入れ、Polars で処理し、Excel に戻す、という形にすると、現場の道具を
   変えずに済みます
6. バックアップを決めます。PostgreSQL は `pg_dump` を日ごとに取り、別の場所に写します。
   戻せることを 1 度は確かめます

## 出典

- pgvector(https://github.com/pgvector/pgvector)。v0.8.6、Docker の画像は
  https://hub.docker.com/r/pgvector/pgvector に pg13 から pg18 まであります
- pgloader(https://github.com/dimitri/pgloader)。ライセンスは PostgreSQL License です
- DuckDB(https://github.com/duckdb/duckdb)v1.5.5、Polars(https://github.com/pola-rs/polars)
  py-1.44.2。どちらも MIT です
- aiseed.dev「土台を据える」(https://aiseed.dev/ai-native-ways/software/foundation/)。CC BY 4.0

2026-09-28 に確かめました。
