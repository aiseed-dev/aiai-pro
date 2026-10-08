---
name: aiai-tools-erpnext
description: ERP とは何かを伝え、ERPNext(GPL-3.0 の OSS の ERP)を日本語で、自分の PC(Ubuntu)で動かせる環境を、Docker を使わずに作るのを手伝う。MariaDB、conda の環境、bench で組み、一人がすべての画面と設定を触れる形にする。
---

# ERPNext を自分の PC で動かす

あなたは、この会社の人が ERP とは何かを知り、ERPNext を自分の PC で動かして触れるように
するのを手伝います。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- 秘密の値(パスワード)を、会話にも、リポジトリにも書きません。`.env` に会社の人が入れます
- ダウンロードの前に、名前、出どころ、大きさを伝えて許しを得ます(全部で 2GB ほど)
- `sudo` が要るコマンド(MariaDB と書体を入れる)は、会社の人が動かします
- 会社の取引のデータを AI への依頼に貼りません

## ERP とは何か

ERP は、会社の仕事(売る、買う、在庫、会計、人)を 1 つのデータベースで扱うソフトです。
ERPNext の説明書は「会社の中枢神経で、すべてを 1 か所に集める物」と書いています。

仕事ごとに別の表やソフトを使うと、同じことを何度も入力し、数が合わなくなります。ERP では、
1 つの出来事を 1 度だけ入れ、次の書類はそこから作ります。ERPNext の例です。

- 売る: 見積(Quotation)→ 受注(Sales Order)→ 納品(Delivery Note)→ 請求(Sales Invoice)。
  前の書類を開いて「作成」を押すと、次の書類が中身を引き継いでできます
- 書類には状態があります。下書き(Draft)は帳簿に何も起きません。確定(Submit)すると帳簿に
  記帳され、請求なら売掛金と売上と税の仕訳が自動でできます。取消(Cancel)すると、その記帳が
  打ち消されます。確定した書類は書き換えず、取り消して直した物(Amend)を作ります
- 買う、在庫、会計、人、プロジェクト、資産も、同じ形でつながっています

これを、動かした環境で実際に 1 件通して見るのが、いちばん早く分かります(手順 6)。

## 組み合わせ(2026-10-06 に動かして確かめた)

| 物 | 版 | ライセンス |
|---|---|---|
| Frappe Framework | v16.35.0 | MIT |
| ERPNext | v16.36.1 | GPL-3.0 |
| MariaDB(Ubuntu 24.04 の物) | 10.11.14 | GPL-2.0 |
| Python、Node.js、Redis、yarn(conda-forge) | 3.14、24、7.2.11、1.22.22 | PSF、MIT、BSD-3-Clause、BSD-2-Clause |
| frappe-bench(組んで動かす道具) | 5.31.0 | GPL-3.0 |
| wkhtmltopdf(PDF を作る) | 0.12.6.1-3 | LGPL-3.0 |
| erpnext_jp_core(有志の maihatch/erpnext-ja-starter、翻訳など) | コミット b494234 | MIT |
| [aiai_ja](aiai_ja/)(このリポジトリ、訳の追加と修正) | 0.1.0 | AGPL-3.0-or-later、訳は CC BY 4.0 |

Frappe v16 が受け付ける MariaDB は 10.6 から 11.8 です。Redis は、ライセンスが変わる前の 7.2 を
使います。

## 手順

1. MariaDB と書体を入れます。会社の人が動かします。MySQL が入っている PC では、`mariadb-server`
   と差し替わり、MySQL 8 のデータは MariaDB では読めないので、先に MySQL を外し、データを
   別の場所に写します

   ```
   sudo apt install mariadb-server mariadb-client fonts-noto-cjk
   ```

   `/etc/mysql/mariadb.conf.d/99-frappe.cnf` に、Frappe が求める文字コードを書き、MariaDB を
   動かし直します

   ```
   [mysqld]
   character-set-client-handshake = FALSE
   character-set-server = utf8mb4
   collation-server = utf8mb4_unicode_ci

   [mysql]
   default-character-set = utf8mb4
   ```

   PC のユーザーが、パスワードなし(OS のユーザーで確かめる unix_socket)でデータベースを
   作れるようにします(`ユーザー` は PC のユーザーの名前)

   ```
   sudo mariadb -e "CREATE USER 'ユーザー'@'localhost' IDENTIFIED VIA unix_socket; GRANT ALL PRIVILEGES ON *.* TO 'ユーザー'@'localhost' WITH GRANT OPTION;"
   ```

2. 部品を conda の環境に入れます。`sudo` は要りません

   ```
   conda create -n erpnext -c conda-forge python=3.14 nodejs=24 redis-server=7.2.11 yarn=1.22.22 pip pkg-config mariadb-connector-c
   conda run -n erpnext pip install frappe-bench==5.31.0
   ```

   wkhtmltopdf は、GitHub の wkhtmltopdf/packaging の `wkhtmltox_0.12.6.1-3.jammy_amd64.deb` を
   `dpkg-deb -x` で展開し、`wkhtmltopdf` を環境の `bin` に置きます
3. bench で組みます。MariaDB に話す部品(mysqlclient)は、conda の `lib/mariadb` を指して作ります

   ```
   conda activate erpnext
   export MYSQLCLIENT_CFLAGS="-I$CONDA_PREFIX/include/mariadb"
   export MYSQLCLIENT_LDFLAGS="-L$CONDA_PREFIX/lib/mariadb -Wl,-rpath,$CONDA_PREFIX/lib/mariadb -lmariadb"
   bench init frappe-bench --frappe-branch v16.35.0 --python $CONDA_PREFIX/bin/python3.14 --skip-redis-config-generation
   cd frappe-bench
   bench get-app erpnext https://github.com/frappe/erpnext --branch v16.36.1
   bench get-app erpnext_jp_core https://github.com/maihatch/erpnext-ja-starter
   ```

   スターターは、確かめたコミット(b494234)にそろえます。AI に `hooks.py`、`install.py`、
   `patches/` を読ませ、何が入るかを会社の人に伝えます。2026-09-29 に読んだときは、言語、国、
   時刻、通貨を日本にし、Company と Item に欄を 3 つ足すだけでした

   このリポジトリの [aiai_ja](aiai_ja/) を足します(git のリポジトリでないので、つないで入れます)

   ```
   ln -s /リポジトリの場所/erpnext/aiai_ja apps/aiai_ja
   env/bin/pip install -e apps/aiai_ja
   ```

   `sites/apps.txt` の終わりに `aiai_ja` の行を足します(前の行の後に改行があることを確かめます)
4. 動かす設定をして、動かします

   ```
   bench setup redis
   bench setup procfile
   bench set-config -g db_socket /run/mysqld/mysqld.sock
   bench set-config -g mariadb_root_login ユーザー
   bench start
   ```

   `bench start` は、止めるまで動き続けます(Ctrl+C で止まります)。Web(8000)とリアルタイムの
   通信(9000)は、すべての口で待ち受けるようプログラムで決まっているので、同じ LAN からも
   届きます。PC のファイアウォールで、外からの 8000 と 9000 を閉じます
5. サイトを作ります。別の端末で動かします。パスワードは `.env` に置き、会社の人が入れます

   ```
   bench new-site localhost --db-root-username ユーザー --db-root-password unix-socket --admin-password "$ADMIN_PASSWORD" --install-app erpnext --install-app erpnext_jp_core --install-app aiai_ja --set-default
   bench --site localhost set-config host_name http://localhost:8000
   ```

   `host_name` が無いと、PDF を作るときに画像を取りに行けず、止まります
6. 設定のウィザードを進め、1 件通して触ります。`http://localhost:8000` を開き、`Administrator`
   で入ります
   * 言語は「日本語」、国は「日本」、通貨は JPY にし、会社の名前と、自分の名前、メールアドレス、
     パスワードを入れます。ウィザードが作るこの利用者には、すべての役割と System Manager が
     付くので、一人で何でもできます。ふだんはこの利用者で入ります
   * ウィザードは、勘定科目をそのときの訳の名前で作ります。訳を直すなら、ウィザードの前に
     します(aiai_ja を入れておけば、売掛金、買掛金などの名前でできます)
   * お客さん、品目を 1 つずつ作り、見積 → 受注 → 納品 → 請求と進め、請求を確定して、仕訳が
     できたことを見ます。見積を PDF にして、日本語が出ることも見ます
7. 止める、戻すを覚えます。`bench start` の端末で Ctrl+C を押すと止まり、もう一度 `bench start`
   で動きます。バックアップは次のとおりで、`sites/localhost/private/backups/` にできます

   ```
   bench --site localhost backup --with-files
   ```

Docker で動かす見本(このフォルダーの [Dockerfile](Dockerfile)、[compose.yaml](compose.yaml))も
置いていますが、動かして確かめたのは上の手順です。

## 訳を足す、直す

訳は [aiai_ja/translations/ja.csv](aiai_ja/translations/ja.csv) に置きます。後から入れたアプリの
訳が優先されるので、スターターの訳を直すときも、ここに書きます。言葉は
[aiai_ja/yougo.csv](aiai_ja/yougo.csv)(用語集)にそろえます。会社の言葉に変えるときは、
用語集を直してから訳を直します。

```
env/bin/python /リポジトリの場所/erpnext/aiai_ja/yaku.py list . 訳の無い文/
env/bin/python /リポジトリの場所/erpnext/aiai_ja/yaku.py check /リポジトリの場所/erpnext/aiai_ja/translations/ja.csv
```

`list` は、訳の無い文を、使われている場所と一緒に書き出します。`check` は、`{0}` などの差し込みと
HTML の印が、訳で同じ数だけ残っているかを確かめます。直したら `bench --site localhost clear-cache`
で読み直します。

## 出典

- ERPNext の説明書「Introduction」(https://docs.frappe.io/erpnext/introduction)、
  「Sales Invoice」(https://docs.frappe.io/erpnext/sales-invoice)。2026-09-29 に読みました
- frappe/erpnext(https://github.com/frappe/erpnext)、GPL-3.0。frappe/frappe
  (https://github.com/frappe/frappe)、MIT。frappe/bench(https://github.com/frappe/bench)、GPL-3.0
- frappe の `setup_wizard.py`(言語の一覧は有効な Language だけ、最初の利用者の役割)と
  `translate.py`(後から入れたアプリの訳が優先)、`app.py`(Web は 0.0.0.0 で待ち受ける)。
  v16.35.0 のソースで 2026-10-06 に確かめました
- frappe の `setup_db.py`(MariaDB は 10.6 から 11.8)
  (https://github.com/frappe/frappe/blob/version-16/frappe/database/mariadb/setup_db.py)
- maihatch/erpnext-ja-starter(https://github.com/maihatch/erpnext-ja-starter)、MIT、
  コミット b4942347e73a821d2be4c988638944b41896ed43(2026-04-25)
- wkhtmltopdf/packaging(https://github.com/wkhtmltopdf/packaging/releases)0.12.6.1-3
- Ubuntu の mariadb(https://packages.ubuntu.com/noble/mariadb-server)

2026-10-06 に確かめました。
