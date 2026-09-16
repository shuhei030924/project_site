# FORWARD — Transformation Workspace

GAIN、Robot、Supplier Engagement、Workflow Mapper、EGC の5サイト、**各20ページ・合計100ページ**を収録した、日本語の操作可能なプロトタイプです。

**公開サイト:** https://shuhei030924.github.io/project_site/

## ワークスペース

| サイト | 目的 | 入口 |
| --- | --- | --- |
| GAIN | AIを使う人と文化を育てる | [コミュニティホーム](https://shuhei030924.github.io/project_site/#/gain/overview) |
| Robot | ロボットの導入・運用・効果を管理する | [オペレーションホーム](https://shuhei030924.github.io/project_site/#/robot/overview) |
| Supplier Engagement | 外部の知恵から技術を評価・実証・展開する | [共創ホーム](https://shuhei030924.github.io/project_site/#/supplier/overview) |
| Workflow Mapper | 業務・判断点・暗黙知を可視化し、改善候補を見つける | [分析ホーム](https://shuhei030924.github.io/project_site/#/workflow/overview) |
| EGC | 提案から実行、効果確認、標準化まで管理する | [改善ホーム](https://shuhei030924.github.io/project_site/#/egc/overview) |

左上のサイト切り替え、左下の全100ページ一覧、上部の横断検索で移動できます。各ページには、利用シーンに合わせた具体的な入力例と「このページで試す」を表示しています。

## 試せる操作

- 学習の完了記録、プロンプトの編集・コピー・保存、事例のブックマーク。
- イベントのデモ参加登録・取消、相談メモとデモ予約。
- スキル評価、チェックリスト、評価マトリクス・責任分担の変更。
- 工数削減、投資回収、実証予算、年間効果の再計算・書き出し。
- キーワード検索、表のCSV出力、候補比較。
- 案件の段階移動、工程詳細、機体状態、実証の測定値と判定の編集。
- 証拠と未解決事項の確認を前提にしたゲートレビュー。
- **Workflow Mapper「改善案をEGCへ」から、編集内容をEGCの提案フォームへ引き継ぎ。**
- A3改善ストーリーの編集、マイルストーン完了、レポートのダウンロード。

## デモの境界

すべての人物、企業、製品、数値は**架空のデモデータ**です。提供画像の文章は要件理解の参考に使用し、画像や社内URLをリポジトリへ追加していません。

このサイトはバックエンド・認証・実AIへの接続を持ちません。機体制御、社外送信、正式承認、実際の予約は行いません。編集内容は `localStorage` でブラウザ単位に保存され、他ユーザーや端末とは共有されません。プライベートブラウズやストレージ制限下では保存が継続しない場合があります。実データ・秘密情報は入力しないでください。

上部の「データを書き出す」は当該ページの**初期サンプルデータ**をJSONで出力します。試算、レポート、表、プロンプト等のページ内の保存ボタンは、各操作で表示している内容を出力します。

## 設計の参考

公式の公開資料から、考え方・業務の進め方を参考にしました。デザインや本文を複製したものではありません。参照日は2026年9月16日です。

| 出典 | 取り入れた考え方 | 反映先 |
| --- | --- | --- |
| [Microsoft Adoption — Copilot](https://adoption.microsoft.com/en-us/Copilot/) | 学習・コミュニティ・成果共有・相談支援を組み合わせる | GAINの学習、事例、相談会、定着分析 |
| [Microsoft Learn — Champions](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/champions) | 現場の推進役による支援 | GAINのチャンピオン一覧、相談予約 |
| [Lean Enterprise Institute — Value Stream Mapping](https://www.lean.org/lexicon-terms/value-stream-mapping/) | 現状と将来像、作業と待ち時間を区別する | Workflow Mapperのネットワーク、ボトルネック、To-Be設計 |
| [Universal Robots — ROI & Payback](https://www.universal-robots.com/blog/calculating-roi-and-payback-period-for-your-robotic-investment/) | 投資回収を稼働・運用条件と一緒に考える | Robotの回収試算、実証、稼働ロス分析 |
| [HYPE — Innovation Management](https://www.hypeinnovation.com/platform/innovation-management) | アイデア・技術・担当・評価ゲート・成果をつなげる | Supplier Engagementの探索〜実証、EGCの提案〜効果確認 |

参考資料から採用した設計判断はアプリ内「設計の参考」でも確認できます。

## 起動と確認

Node.js 22.12以上を推奨。

```sh
npm ci
npm run dev
npm run check
npm run build
```

- React + Vite。各ページの内容は `src/data.js`、画面と操作は `src/main.jsx`、見た目は `src/style.css`。
- ハッシュルーティングを採用し、GitHub Pages上で100ページの直リンク・再読み込みが可能です。
- `npm run check` はサイト数、各サイトのページ数、ID・タイトルの重複、リンク、表・マトリクス・カンバンデータを検証します。
- `main` へのpushで `.github/workflows/pages.yml` が検証・ビルド・GitHub Pages公開を行います。
- Google Fontsを利用しています。読み込めない場合はシステムフォントへフォールバックします。

ページ一覧は [PAGES.md](PAGES.md) に収録しています。
