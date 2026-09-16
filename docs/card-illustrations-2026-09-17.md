# 技術の姿と作業がわかる画像カード

2026-09-17。ユーザーが提示した Robot Project「技術ポートフォリオ」の画面を起点に、記号だけでは対象が伝わりにくいカードを見直した。

## 追加したページと理由

| ページ | カード数 | 画像で伝えること |
| --- | --- | --- |
| Robot / 技術ポートフォリオ | 5 | 床を走るAMR、固定アーム、四足歩行、倉庫の取り出し、天井搬送の違い。 |
| Supplier / 技術ソリューション探索 | 4 | 画像検査、ポンプ監視、搬送、空調が対象とする設備と作業。 |
| Robot / 現場の学び | 3 | 通路の置き場、トレイと治具、巡回する環境。数値だけでなく改善する場所を理解する。 |
| Supplier / 共創チャレンジ | 3 | 検査・巡回・空調という課題の現場を、提案者が具体的に思い描く。 |

計4ページ・15カード。全200ページと既存URL、絞り込み・検索・保存機能を維持した。プロンプト集のように文章そのものが主役のページは、今回の機械の画像を流用していない。

各カードの詳細画面には大きな画像に加え、「画像で見る場所」「対象になる仕事」「現場で確認する条件」と関連ページへの入口を追加。原寸画像を別タブで開ける。番号は絞り込んでも元の項目に対応する。既存の16ガイドに今回の4ページを加え、画像で見るガイドは20ページとなった。RobotとSupplierのホームにも入口を追加した。

## 画像の作成と保存

内蔵の **image_gen** で1画像ずつ、8点を新規生成した。APIキーやCLIの画像生成は使用していない。生成したPNGをワークスペースへコピーし、同じ寸法のWebPへ形式変換して通常表示に使用。トリミング、合成、描き替え、寸法変更はしていない。PNGは原寸表示用として保持。新規8枚のWebP合計は約1.22 MBで、PNG合計約16.59 MBから転送量を削減した。

| ID | 対象 | 原画像 | 通常表示 |
| --- | --- | --- | --- |
| amr | 保守部品を運ぶAMR | `public/images/technologies/amr.png` | 同名 `.webp` |
| cobot | テストトレイの受け渡し | `public/images/technologies/cobot.png` | 同名 `.webp` |
| quadruped | 計器前の四足歩行ロボット | `public/images/technologies/quadruped.png` | 同名 `.webp` |
| warehouse | 保守部品の自動保管・出庫 | `public/images/technologies/warehouse.png` | 同名 `.webp` |
| wafer-logistics | 天井搬送と装置ロードポート | `public/images/technologies/wafer-logistics.png` | 同名 `.webp` |
| wafer-inspection | ウェーハ・照明・検査カメラ | `public/images/technologies/wafer-inspection.png` | 同名 `.webp` |
| pump-monitoring | ポンプと振動センサー | `public/images/technologies/pump-monitoring.png` | 同名 `.webp` |
| cleanroom-air | クリーンルームの給気・還気 | `public/images/technologies/cleanroom-air.png` | 同名 `.webp` |

既存の `public/images/guides/egc-foup-comparison.png` も通路改善のカードで再利用した。詳細な最終プロンプト8件と画像ファイルの対応は [card-illustration-prompts.json](card-illustration-prompts.json) に全文保存。

## 表現の範囲

画像は対象を理解するための概念表現。実在製品の外観・設備仕様・工場の実績を示すものではない。特にSPOTのカードの画像は一般的な四足歩行ロボットであり、特定製品を再現していない。写真に近い表現のため、カード上に「概念図」、ページと詳細には「AI生成」と明示した。

機械の具体的な寸法、接続仕様、安全適合、性能・効果の裏付けには使わない。既存事例の数値は引き続き架空のデモとして扱う。
