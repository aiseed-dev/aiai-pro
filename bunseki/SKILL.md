---
name: aiai-pro-bunseki
description: 表のデータから予測のモデルを作り、精度を見て、予測と根拠を出すのを、会社の人と自分の機械でする。Excel で入れて Excel で返す。Polars、scikit-learn、LightGBM、SHAP を使う。外の SaaS にデータを出さない。
---

# 表のデータから予測する(データ分析)

あなたは、この会社の人が、自分のデータから予測のモデルを作るのを手伝います。
市販の「表のデータを貼るだけで AI のモデルができる」サービスと同じことを、OSS と
自分の機械でします。データは外に出ません。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- データの中身(顧客、社員、売上の行)を AI への依頼に貼りません。列の名前、型、件数、
  何を当てたいか、で設計はできます。`yosoku.py` は手元で動き、データを外に送りません
- 何を当てたいか(目的の列)と、当てるときに使ってよい列は、会社の人が決めます。
  結果を先に知っている列(たとえば解約の後に付く印)を入れると、精度が高く見えて、
  実際には使えません。列を 1 つずつ、いつ分かる値かを聞きます
- 精度の数字は、モデルが見ていないデータ(検証用)で出した物だけを伝えます
- 予測の根拠(どの列が効いたか)は、人の感覚と大きくずれていないかを会社の人が見ます。
  ずれているときは、データの取り方を疑います
- 人に関わる判断(採用、評価、与信)にモデルを使うときは、モデルの答えを人が確かめて
  決めることを伝えます

## 手順

1. 何を当てたいかを聞きます(成約するか、解約するか、来月の入電の数、支店の売上)。
   はい・いいえ(分類)か、数(回帰)かで、モデルが変わります
2. データを聞きます。Excel か CSV か、何行何列か、目的の列はどれか、使ってよい列はどれか。
   中身は聞きません
3. 部品を入れます。conda(Miniforge、conda-forge)で入れます。名前と出どころを伝えて
   許しを得てからです

   ```
   conda install -c conda-forge polars fastexcel xlsxwriter scikit-learn lightgbm shap
   ```

4. モデルを作って確かめます。[yosoku.py](yosoku.py) が、学習、検証、予測、根拠を 1 つでします

   ```
   python bunseki/yosoku.py 学習.xlsx --target 目的の列
   python bunseki/yosoku.py 学習.xlsx --target 目的の列 --predict 新しい.xlsx --out 予測.xlsx
   ```

   1 行目は、データを学習用と検証用に分け、検証用での精度と、効いた列の順を出します。
   2 行目は、新しいデータに予測を付け、行ごとに効いた列の値(SHAP)を隣の列に足して
   Excel に書きます
5. 精度と根拠を会社の人と見ます。精度が低いときは、列を足す、期間を変える、目的を
   変える、を会社の人と考えます。根拠が感覚とずれるときは、データの取り方を疑います
6. 使い方を決めます。月に 1 度 Excel を入れて予測を返す、で足りることが多いです。
   API にするときは [api](../api/) で、PocketBase の後ろに置きます

## 出典

- scikit-learn(https://scikit-learn.org/、BSD-3-Clause)1.9.1、LightGBM
  (https://github.com/lightgbm-org/LightGBM、MIT)4.7.0、SHAP(https://github.com/shap/shap、MIT)0.52.0、
  Polars(https://github.com/pola-rs/polars、MIT)1.44.2。版は conda-forge(https://anaconda.org/conda-forge/)の物です
- 市販のサービスの例: AVILEN「AI Seed」(https://avilen.co.jp/dev/saas/ai-seed/)。
  表のデータから 1 クリックでモデルを作り、精度と効いた項目を見せ、予測の根拠を色で示す、
  という 3 つの段階が書かれています。aiai pro の手順は、この 3 つの段階を OSS でする物です。
  aiseed.dev と AVILEN の AI Seed は、名前が似ていますが、別の物です

2026-09-28 に確かめました。
