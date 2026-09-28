---
name: aiai-pro-ai
description: 会社の中に自前の AI を据えるのを手伝う。Ollama で開いた重みのモデルを動かし、AnythingLLM で使い、社内の文書は pgvector で RAG にする。秘密の物は社内で、難しい考えごとと大きなコードの生成は外の大きなモデルで。
---

# 自前の AI を据える(Ollama と RAG)

あなたは、この会社が、社内に AI を置くのを手伝います。値打ちは、いちばん賢いことでなく、
会社のデータを外に出さずに、毎日の仕事に AI を入れられることです。
専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 社内の AI と、外の大きな AI を分けます
  * 社内(Ollama): 秘密の文書の要約と分類、RAG の検索と答え、決まった形の処理
  * 外(Claude など): 難しい考えごと、大きなコードの生成、最新のモデルが要る物。
    社内の文書の中身は渡さず、伏せた形で聞きます
- AI は門番を通ります。RAG の検索も、[ninshou](../ninshou/) の認証の後ろに置き、
  その人が読めない文書は、検索にも出しません。文書を入れるときに、誰が読めるかを
  一緒に入れます
- モデルは開いた重みで、ライセンスを確かめた物だけを使います。使う人の数と条件が
  付いている物は、条件を会社の人に伝えます
- 画面は AnythingLLM(MIT)にします。Open WebUI と LobeChat は、名前とロゴの変更を禁じるなど
  条件を足したライセンスで、OSI が認めた物ではないので使いません(2026-09-28 に確かめました)。
  サインインを Forgejo にまとめたいときは LibreChat(MIT)も選べます

## 手順

1. 何に使うかを聞きます(社内の文書を探して答える、文書の要約、コードを書く手伝い、
   画像の PDF を読む)。それで、要るモデルと機械が決まります
2. 機械を決めます。GPU があれば速く、無くても小さなモデルは動きます。メモリーの大きさで
   動かせるモデルの大きさが決まります。いまの機械で試してから、買うかを決めます
3. Ollama を入れます。公式の手順は、`ollama.com/install.sh` を curl で取って sh に渡す 1 行です。
   ダウンロードなので、名前、出どころ、大きさを伝えて許しを得てからです。systemd で動き、
   モデルは `/usr/share/ollama` に置かれます
4. モデルを取ります。コードの手伝いには North Mini Code 1.0(Cohere、Apache-2.0、30B の
   MoE で動くのは 3B、Ollama の library に `north-mini-code-1.0` があります)。
   文書の埋め込み(RAG の検索に使う数の列)には、Ollama の library の埋め込みのモデル
   (`nomic-embed-text` など)を使います。モデルは大きい(数 GB)ので、取る前に大きさを伝えます
5. AnythingLLM を入れます。ChatGPT のような画面で、文書を入れて聞く RAG が最初から
   入っています。公式の Docker の手順は、置き場のフォルダーと `.env` を作ってから

   ```
   docker run -d -p 127.0.0.1:3001:3001 --cap-add SYS_ADMIN --add-host=host.docker.internal:host-gateway -v ${STORAGE_LOCATION}:/app/server/storage -v ${STORAGE_LOCATION}/.env:/app/server/.env -e STORAGE_DIR="/app/server/storage" mintplexlabs/anythingllm
   ```

   です(公式は `-p 3001:3001` ですが、aiai pro では 127.0.0.1 に向けて Caddy から
   `chat.example.jp` で出します)。LLM と埋め込みに Ollama を選び、ベクトルの置き場は
   既定の LanceDB か、[dodai](../dodai/) の PGVector を選びます。複数の人で使うモードにし、
   認証は AnythingLLM 自身が持ちます
6. RAG を作ります。[jouhou](../jouhou/) で整えた文書を、埋め込みにして [dodai](../dodai/) の
   pgvector に入れ、質問に近い所を探して、モデルに一緒に渡します。答えには、元の文書の
   場所を付けます。読める人の情報を、文書と一緒に入れます。仕組みは会社の AI が
   FastAPI([api](../api/))で作ります
7. 確かめます。会社の人が、答えが分かっている質問を 10 個ほど用意し、答えと元の文書の
   場所が合っているかを見ます。合わないときは、モデルでなく、[jouhou](../jouhou/) の
   整え方を直します

## 出典

- Ollama「Linux」(https://docs.ollama.com/linux)。v0.34.4(https://github.com/ollama/ollama/releases)、MIT。
  library は https://ollama.com/library
- Cohere「North Mini Code」(https://docs.cohere.com/docs/north-mini-code-1.0)。Apache-2.0
- AnythingLLM(https://github.com/Mintplex-Labs/anything-llm)v1.16.2、MIT。Docker の手順は
  https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/HOW_TO_USE_DOCKER.md
- LibreChat(https://github.com/LibreChat-AI/LibreChat)MIT。Open WebUI の LICENSE
  (https://github.com/open-webui/open-webui/blob/main/LICENSE)、LobeHub の LICENSE
  (https://github.com/lobehub/lobehub/blob/main/LICENSE)
- aiseed.dev「自前の AI を据える」(https://aiseed.dev/ai-native-ways/software/ai/)。CC BY 4.0

2026-09-28 に確かめました。
