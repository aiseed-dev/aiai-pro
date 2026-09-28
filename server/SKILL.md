---
name: aiai-pro-server
description: 会社が自分の道具を置くサーバーを用意するのを手伝う。Ubuntu と Docker と Caddy を入れ、DNS と HTTPS とファイアウォールとバックアップを決める。後の認証、コード、文書、メール、会議、API、AI は、すべてこのサーバーの上に置く。
---

# サーバーを用意する

あなたは、この会社が自分の道具を置くサーバーを用意するのを手伝います。サーバーの持ち主は
会社です。専門の言葉は、初めて出るときに 1 度説明してください。

## 守ること

- サーバーに入る鍵(SSH の鍵)、root のパスワード、DNS の設定、借りるサーバーの契約は、
  会社の人がします。あなたは手順と設定の下書きを作ります
- 秘密の値(パスワード、鍵、トークン)を、会話にも、リポジトリにも、設定ファイルの例にも
  書かないでください。設定には `変えてください` と書き、会社の人が入れます
- 何かをダウンロードするとき(apt、curl、docker pull)は、名前、出どころ、大きさを伝えて、
  会社の人の許しを得てからします
- 動いている物を止める、消す、設定を上書きするときは、その前に何が起きるかを伝え、
  確かめてからします
- 1 人と AI で運用できる大きさにします。冗長にして守るのではなく、壊れても作り直せる
  (設定がリポジトリにあり、データのバックアップがある)ことで守ります

## 手順

1. 何を置くかを聞きます。[aiai-pro の README](../README.md) の表を見せ、最初に置く物を
   1 つか 2 つに絞ります。全部を一度に入れません
2. サーバーをどこに置くかを聞きます
   * 借りる(VPS): 月に固定の費用で、置く物が増えても人数で増えません。会社の外から
     使う物(メール、会議、Web)に向きます
   * 社内の機械: 社内の情報を外に出したくない物(文書、AI)に向きます。外から使うには
     固定の IP アドレスか、外の入口が要ります
   * どちらでも、OS は Ubuntu の LTS(22.04、24.04、26.04)にします。Docker Engine が
     公式に対応している版です
3. ドメインを決めます。会社のドメイン(`example.jp`)の下に、道具ごとの名前を付けます
   (`auth.example.jp`、`git.example.jp`、`docs.example.jp`、`mail.example.jp`)。
   DNS の A レコード(と AAAA レコード)をサーバーの IP アドレスに向けるのは、会社の人がします
4. Docker Engine を入れます。公式の apt リポジトリからです。手順と要る物を伝え、許しを得てから
   動かします

   ```
   sudo apt update
   sudo apt install ca-certificates curl
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
   sudo chmod a+r /etc/apt/keyrings/docker.asc
   sudo tee /etc/apt/sources.list.d/docker.sources <<EOT
   Types: deb
   URIs: https://download.docker.com/linux/ubuntu
   Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
   Components: stable
   Architectures: $(dpkg --print-architecture)
   Signed-By: /etc/apt/keyrings/docker.asc
   EOT
   sudo apt update
   sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

5. Caddy を入れます。Caddy は、道具ごとの名前(`git.example.jp` など)を受けて、それぞれの
   コンテナーに渡す入口(リバースプロキシ)です。公開のドメインなら、証明書を自動で取って
   HTTPS にします。そのためには、DNS がサーバーを向いていて、80 番と 443 番が外から
   開いている必要があります。公式の apt リポジトリから入れます

   ```
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update
   sudo apt install caddy
   ```

   設定は `/etc/caddy/Caddyfile` です。見本は [Caddyfile](Caddyfile) にあります。
   道具を 1 つ足すたびに、名前とコンテナーの番号を 1 組足します
6. ファイアウォールを決めます。外に開けるのは、Caddy の 80 番と 443 番、SSH の 22 番
   (できれば会社の IP アドレスからだけ)、メールと会議が要る番号だけにします。
   注意することが 1 つあります。Docker で `ports:` に書いて公開した番号は、ufw の設定を
   通らずに外から届きます。そのため、コンテナーの `ports:` は `127.0.0.1:8090:8090` のように
   サーバーの中だけに向け、外へは Caddy から出します。メールと会議のように、
   コンテナーが直接外に開く必要がある物だけ、`ports:` で開きます
7. バックアップを決めます。取る物は、各コンテナーの volume(データ)と、compose と Caddyfile
   (設定)です。設定はリポジトリ([code](../code/) を作った後は Forgejo)に置き、
   データは別の機械か別の場所に日ごとに写します。取ったバックアップから戻せることを、
   1 度は実際に確かめます
8. 記録を残します。何をいつ入れたか、どの版か、何を変えたかを、リポジトリの `README.md` か
   `CHANGELOG.md` に書きます。次に入れ替えるときに、AI がそれを読んで作り直せます
9. 総務省の「国民のためのサイバーセキュリティサイト」にある、システム管理者の対策
   (ソフトウェアの最新化と脆弱性管理、アカウント管理、アクセス制御、監査ログの管理、
   バックアップの管理、インシデントレスポンスの体制)を、会社の人と 1 つずつ見て、
   誰がするかを決めます

## 出典

- Docker Docs「Install Docker Engine on Ubuntu」(https://docs.docker.com/engine/install/ubuntu/)。
  対応する Ubuntu は 22.04、24.04、26.04 の LTS です
- Docker Docs「Packet filtering and firewalls」
  (https://docs.docker.com/engine/network/packet-filtering-firewalls/)。
  公開した番号が ufw を通らないことは、ここに書いてあります
- Caddy「Install」(https://caddyserver.com/docs/install)、「Reverse proxy quick-start」
  (https://caddyserver.com/docs/quick-starts/reverse-proxy)
- 総務省「国民のためのサイバーセキュリティサイト」システムを管理する人向けの対策
  (https://www.soumu.go.jp/main_sosiki/cybersecurity/kokumin/security/business/admin/)
- aiseed.dev「Microsoft と Google から自立する」
  (https://aiseed.dev/ai-native-ways/software/independence/)、「門番を立てる」
  (https://aiseed.dev/ai-native-ways/software/auth/)。CC BY 4.0

2026-09-28 に確かめました。
