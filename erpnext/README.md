# ERPNext

ERPNext(frappe/erpnext)を日本の会社で使える形にするスキルです。AI に [SKILL.md](SKILL.md) を
読ませると、AI が会社の人に聞きながら、試す、日本語にする、帳票を作る、いまの ERP と
つなぐ、日本の決まりを足す、の順に進めます。

## ライセンス

ERPNext は GPL-3.0、Frappe Framework は MIT です(それぞれのリポジトリの license.txt と
LICENSE。2026-09-28 に確かめました)。ERPNext を元に作った物を人に渡すとき、GPL で
決まっていることは次のとおりです。出典は、GNU の「GPL に関してよく聞かれる質問」
(https://www.gnu.org/licenses/gpl-faq.ja.html)と、GPL-3.0 の本文(このリポジトリの [COPYING](../COPYING)、
第 10 条)です。2026-09-28 に確かめました。

- 売ることはできます。「GPLは、誰もが販売することを許可しています」(#DoesTheGPLAllowMoney)
- 公開する義務はありません。「GPLでは、あなたが改変した版をリリースすることは要求してはいません」
  (#GPLRequireSourcePostedPublic)。社内で使うだけなら、渡す相手がいないので、何の義務もありません
- ただし、渡した相手は、自由に再配布できます。「もし誰かがあなたに料金を払って複製を
  手に入れたならば、GPLはその人が公衆にその複製を、料金のありでもなしでも、リリースする自由を
  与えています」(#DoesTheGPLRequireAvailabilityToPublic)
- 渡すときに、再配布を禁じることはできません。「あなたには、著作物の配布に関して、より厳しい
  制限をかけることは、認められません」(#DoesTheGPLAllowNDA)。GPL-3.0 の第 10 条にも
  「You may not impose any further restrictions on the exercise of the rights granted or
  affirmed under this License」とあります
- 何が GPL の及ぶ物かは、場合によります。ERPNext 本体を直した物と、ERPNext と一体になって
  動く物は GPL です。ERPNext とは別の作品(たとえば、MIT の Frappe Framework だけを使い、
  ERPNext に依らないアプリ、文書、テストのデータ、設定)は、別のライセンスにできます
  (#GPLAndPlugins)。どちらかは、その物ごとに見る必要があります

### 「ソースパッケージは自社利用限定」について

ERPNext.JP(合同会社 MY HATCH)は、実務で使ってきた ERPNext のソースと環境を売る
「ソースパッケージ」を出しており、そのページに「このソースパッケージは自社利用限定です。
購入いただいたソースを他社に転売すること、あるいはそのソースを使って SIer として他社に
ERP を導入する——こうした利用はお断りしています」とあります
(https://www.erpnext.jp/knowledge/implementation/source-package-launchpad、
2026-09-28 に確かめました)。ページには、パッケージがどのライセンスで渡されるか、
中身のどれが ERPNext を直した物で、どれが別のアプリかは、書いてありません。

上の決まりに照らすと、次のように分けて考えられます。

- パッケージのうち、ERPNext 本体を直した物と、ERPNext と一体で動く物は GPL です。
  受け取った会社は、GPL によって再配布できます。売る側が契約でそれを禁じることは、
  GPL の第 10 条が認めていません。売ること自体と、公開しないことは、GPL に反しません
- パッケージのうち、別の作品(ERPNext に依らないアプリ、文書、テストのデータ、伴走の支援)は、
  売る側が条件を付けられます。「自社利用限定」は、その部分には付けられます
- どこまでが GPL の及ぶ物かは、ソースを見ないと分かりません。買う前に、どのファイルが
  どのライセンスかを書面で確かめることを勧めます

このリポジトリは法律の助言をする物ではありません。GPL の決まりと、そのページに書いて
あることを並べて書いただけです。ERPNext・Frappe は Frappe Technologies Pvt. Ltd. の商標で、
ERPNext.JP はそのページの記載どおり、同社と資本関係のない独立の事業者です。
