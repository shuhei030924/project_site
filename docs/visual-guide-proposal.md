# 画像で理解する16ページ — 実装済みの提案

2026年9月17日。9点の画像を新規生成し、5種類の見せ方で既存16ページを改訂。全200ページを維持し、ホーム5ページにも画像付きの入口を追加した。

左メニューの「画像で見るガイド」から、活動・見せ方で絞り込める。すべての画像は拡大可能。操作を急ぐ場合は「操作エリアへ」で既存の入力欄や演習へ移動できる。

## まず見てほしい5つ

| 提案 | 実装したページ | 画像に担わせた役割 |
| --- | --- | --- |
| 改善前後を対にする | [EGC / 再発防止](https://shuhei030924.github.io/project_site/#/egc/mistake-proofing) | FOUP置き場の乱れと区画化を同じ視点で比較。見える化と誤り防止の違い、例外条件を選んで考える。 |
| 現場画像に問いを置く | [Workflow Mapper / 現場観察](https://shuhei030924.github.io/project_site/#/workflow/observations) | 保全履歴・測定画面・判断メモを番号で選択。作業の裏にある判断を見つける。 |
| 3場面で手順を見せる | [Supplier / PoC](https://shuhei030924.github.io/project_site/#/supplier/poc) | 小さな実証、標準化する運用、別拠点での検証を一続きに理解する。 |
| 人の経験を特集する | [GAIN / 教え合い](https://shuhei030924.github.io/project_site/#/gain/peer-pairing) | AIに詳しい人と業務に詳しい人が支え合う場面を、発言例と確認ポイントで紹介。 |
| 対象作業を具体化する | [Robot / 導入適合性](https://shuhei030924.github.io/project_site/#/robot/readiness) | トレイ・把持・人の作業場所を選び、機体の仕様だけでは決められない条件を確かめる。 |

## 改訂した16ページ

| 活動 | ページ | 見せ方 | 使用画像 |
| --- | --- | --- | --- |
| GAIN | [ワークショップ](https://shuhei030924.github.io/project_site/#/gain/events) | 場面から学ぶ | gain-workshop |
| GAIN | [成功事例ギャラリー](https://shuhei030924.github.io/project_site/#/gain/stories) | 改善前後 | gain-report-comparison |
| GAIN | [教え合いの組み合わせ](https://shuhei030924.github.io/project_site/#/gain/peer-pairing) | 現場の知見 | gain-workshop |
| GAIN | [生成文の事実確認](https://shuhei030924.github.io/project_site/#/gain/claim-check) | 改善前後 | gain-report-comparison |
| Workflow Mapper | [現場観察ノート](https://shuhei030924.github.io/project_site/#/workflow/observations) | 画像上の注目点 | workflow-tacit |
| Workflow Mapper | [暗黙知インタビュー](https://shuhei030924.github.io/project_site/#/workflow/tacit) | 現場の知見 | workflow-tacit |
| Workflow Mapper | [To-Be設計](https://shuhei030924.github.io/project_site/#/workflow/future) | 改善前後 | workflow-handoff-comparison |
| EGC | [A3改善ストーリー](https://shuhei030924.github.io/project_site/#/egc/a3) | 改善前後 | egc-foup-comparison |
| EGC | [再発防止の仕組み](https://shuhei030924.github.io/project_site/#/egc/mistake-proofing) | 改善前後 | egc-foup-comparison |
| EGC | [横展開マッチング](https://shuhei030924.github.io/project_site/#/egc/replication) | 3段階の手順 | supplier-poc-scale |
| Supplier Engagement | [提案比較](https://shuhei030924.github.io/project_site/#/supplier/comparison) | 画像上の注目点 | supplier-benchmark |
| Supplier Engagement | [共同実証キャンバス](https://shuhei030924.github.io/project_site/#/supplier/poc) | 3段階の手順 | supplier-poc-scale |
| Supplier Engagement | [横展開準備](https://shuhei030924.github.io/project_site/#/supplier/scale) | 3段階の手順 | supplier-poc-scale |
| Robot Project | [復旧手順書](https://shuhei030924.github.io/project_site/#/robot/procedures) | 画像上の注目点 | robot-inspection |
| Robot Project | [導入適合性診断](https://shuhei030924.github.io/project_site/#/robot/readiness) | 画像上の注目点 | robot-cobot |
| Robot Project | [ミッション管理](https://shuhei030924.github.io/project_site/#/robot/missions) | 場面から学ぶ | robot-inspection |

同じ場面でも問いを変える。例えば現場観察では「どの証拠を記録するか」、暗黙知では「何を質問して経験則を検証するか」に焦点を分けた。

## 広げるときの提案

今回の実装を踏まえると、次はこの順が有効。

1. **例外・異常を探す演習**：入力に問題のある帳票、滞留した受け渡し、搬送経路の障害を画像から見つけ、判断演習へつなぐ。
2. **設備・作業の分解図**：搬送の受け渡し、段取り替え、倉庫から現場までの責任境界を、層を切り替えて説明する。
3. **一日のストーリー**：新人・熟練者・推進役が同じ課題をどう見ているかを、短い連続場面で描く。

数式・実績グラフ・厳密な工程図は、読める数値や編集できる図を優先する。画像が説明を担うページを選んで展開する。

## 画像の保存と位置づけ

画像は `public/images/guides/` に9点。すべて組込みimage_genツールで個別に生成した。[画像ファイルへのリンク・最終プロンプト一覧](visual-guide-image-prompts.md) を保存した。画面上にAI生成の説明用イメージと明示。実在の施設・人物・導入実績ではなく、改善後の場面も効果を確認済みとするものではない。

既存のフォーム、保存状態、計算、演習を維持。追加した選択操作は画像の観点を切り替えるもので、実際の判断や承認を代行しない。
