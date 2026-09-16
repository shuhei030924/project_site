# FORWARD — Transformation Workspace

GAIN、Robot、Supplier Engagement、Workflow Mapper、EGC の5サイト、**各40ページ・合計200ページ**を収録した、日本語の操作可能なプロトタイプです。初版の各20ページを改善し、第2期で根拠・例外・実現条件を深掘りする各10ページを、第3期でリーン・品質工学・安全・ソフトウェア運用の定石を当てはめた各10ページを拡張しました。

**公開サイト:** https://shuhei030924.github.io/project_site/

## 技術を姿と仕事で理解する画像カード

**8点を新規生成し、4ページ・15カードに画像を追加**しました。[技術ポートフォリオ](https://shuhei030924.github.io/project_site/#/robot/portfolio)のAMR・CoBot・四足歩行・倉庫自動化・ウェーハ搬送を、それぞれの作業場面で見比べられます。[技術ソリューション探索](https://shuhei030924.github.io/project_site/#/supplier/solutions)、[現場の学び](https://shuhei030924.github.io/project_site/#/robot/lessons)、[共創チャレンジ](https://shuhei030924.github.io/project_site/#/supplier/challenges)にも追加しました。

カードの詳細では大きな画像、見る場所、対象作業、確認条件、次に検討するページを案内します。原寸画像も開けます。左メニューの画像ガイドは**20ページ**へ拡張。通常表示は軽量なWebPを使い、生成PNGも保持しています。[画像一覧・追加理由](docs/card-illustrations-2026-09-17.md)と[最終プロンプト全文](docs/card-illustration-prompts.json)を保存しました。

## AIニュース・ナレッジ共有を中心に8ページを再設計

全200ページの用途を見直し、重複する投稿・表彰・比較などを、日々の問いと知見が循環するページへ置き換えました。既存URLとページ数は維持しています。

- [AIニュースと業務への影響](https://shuhei030924.github.io/project_site/#/gain/recognition)：公式発表3件を、事実・活用仮説・次の検証に分けて読む。2026-09-17確認の編集版。
- [つながるナレッジマップ](https://shuhei030924.github.io/project_site/#/gain/community)：5活動・初期15知見。関係の探索、知見追加・編集、期限確認、JSON出力。
- [未解決の問い](https://shuhei030924.github.io/project_site/#/gain/challenge)、[判断理由](https://shuhei030924.github.io/project_site/#/workflow/versions)、[技術ウォッチ](https://shuhei030924.github.io/project_site/#/supplier/knowledge)、[教訓](https://shuhei030924.github.io/project_site/#/egc/retrospective)をマップへ残す。
- [現場知見ライブラリ](https://shuhei030924.github.io/project_site/#/robot/comparison)：生成画像3点を使って適用条件を比較。
- [EGCの滞留と次の行動](https://shuhei030924.github.io/project_site/#/egc/pipeline)：仕掛かり上限、停止理由、期限、完了条件を確認。

[差し替え理由・参考手法・ニュース出典・保存仕様](docs/knowledge-review-2026-09-17.md)。ニュースの自動更新や組織内共有は未実装で、操作内容はブラウザ内に保存されます。

## 画像で理解する業務ガイド

**9点の画像を新規生成し、既存16ページへ5種類のビジュアルガイドを追加**しました。前回の工場マップと合わせて生成画像は10点です。画像付きガイドの入口を5つのホームにも配置しています。

左メニュー「画像で見るガイド」では活動・見せ方からページを選べます。画像の拡大、注目点の番号選択、改善前後の比較、手順の切り替え、操作エリアへの移動に対応しています。

- [FOUP置き場の改善前後](https://shuhei030924.github.io/project_site/#/egc/mistake-proofing)
- [熟練者が見ている証拠](https://shuhei030924.github.io/project_site/#/workflow/observations)
- [PoCから標準化・展開まで](https://shuhei030924.github.io/project_site/#/supplier/poc)
- [教え合いの場面と問い](https://shuhei030924.github.io/project_site/#/gain/peer-pairing)
- [協働ロボットの対象作業](https://shuhei030924.github.io/project_site/#/robot/readiness)

[16ページの提案・設計意図](docs/visual-guide-proposal.md) と [画像・生成プロンプト一覧](docs/visual-guide-image-prompts.md) を保存しました。画像と発言例は架空の説明用で、実績・実在の人物や設備を示しません。既存の演習・入力・保存機能を残しています。

## 2026年9月17日の活動説明を反映

[ユーザー提供の説明全文](docs/activity-brief-2026-09-17.md) を最新の基準資料として保存しました。5つのホームに活動の関係と成果物を明示し、以下の5ページを活動目的に合わせて差し替えています。既存のURLを維持し、合計200ページです。

- GAIN：[AI定着の障壁と支援](https://shuhei030924.github.io/project_site/#/gain/tool-guide)
- Workflow Mapper：[業務デジタルツインの4階層](https://shuhei030924.github.io/project_site/#/workflow/templates)
- EGC：[案件の担当と次の行動](https://shuhei030924.github.io/project_site/#/egc/recognition)
- Supplier Engagement：[技術探索戦略とQBR](https://shuhei030924.github.io/project_site/#/supplier/meetings)
- Robot Project：[工場の自動化領域マップ](https://shuhei030924.github.io/project_site/#/robot/parts)

ロボットの適用領域は、生成した工場の概念イラストと選択できる5つの番号で説明しています。活動の関係・業務の4階層・人とAIの役割・探索からQBRまでの流れも図解しました。[見直し理由・画像の生成プロンプト](docs/content-review-2026-09-17.md) を保存しています。新しい説明と画面は `src/activity-data.js` / `src/activity.jsx` / `src/activity.css` にまとめています。

## ワークスペース

| サイト | 目的 | 入口 |
| --- | --- | --- |
| GAIN | AIを使う人と文化を育てる | [コミュニティホーム](https://shuhei030924.github.io/project_site/#/gain/overview) |
| Robot | ロボットの導入・運用・効果を管理する | [オペレーションホーム](https://shuhei030924.github.io/project_site/#/robot/overview) |
| Supplier Engagement | 外部の知恵から技術を評価・実証・展開する | [共創ホーム](https://shuhei030924.github.io/project_site/#/supplier/overview) |
| Workflow Mapper | 業務・判断点・暗黙知を可視化し、改善候補を見つける | [分析ホーム](https://shuhei030924.github.io/project_site/#/workflow/overview) |
| EGC | 提案から実行、効果確認、標準化まで管理する | [改善ホーム](https://shuhei030924.github.io/project_site/#/egc/overview) |

左上のサイト切り替え、左下の全200ページ一覧、上部の横断検索で移動できます。ホームの「現場の型と数理を、手を動かして学ぶ」から第3期の10ページへ、「次の判断を、もう一段深く」から第2期の10ページへ移動できます。各ページには、利用シーンに合わせた具体的な入力例と「このページで試す」を表示しています。

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
- **第3期：**アンドンの呼び出しと応答のはしご、離隔距離の概念図、段階展開の進退判断、ヤマヅミ表での作業移動、スパゲッティチャートの順番・配置変更、SIPOCの欄編集と抜け点検、バス係数の訓練予定、狩野モデルの二問分類、リトルの法則での滞留試算、プレモーテムの予兆カレンダー、Kirkpatrickの根拠連鎖、自信と正答の較正、判定木、文単位の事実確認、語差分など。

## デモの境界

デモの舞台は架空の**半導体メーカー**（広島：前工程ファブ、仙台：後工程・テスト、東京：本社・技術センター）です。ホールドロットの処置、ウェーハ外観検査、FOUP搬送、サブファブ巡回、装置PM、レシピ変更申請などを例にしています。社内の人物、案件、実績、評価値は**架空のデモデータ**です。AIニュースの企業・製品・発表はリンクした公式情報に基づき、社内での導入を示しません。提供画像の文章は要件理解の参考に使用し、画像や社内URLをリポジトリへ追加していません。

このサイトはバックエンド・認証・実AIへの接続を持ちません。機体制御、社外送信、正式承認、実際の予約は行いません。編集内容は `localStorage` でブラウザ単位に保存され、他ユーザーや端末とは共有されません。プライベートブラウズやストレージ制限下では保存が継続しない場合があります。実データ・秘密情報は入力しないでください。

上部の「保存済み記録を書き出す」は当該ページの**初期サンプルデータと保存済みの編集状態**をJSONで出力します（BOMなし）。フォームの未保存入力は含みません。試算、レポート、表、プロンプト等のページ内の保存ボタンは、それぞれ表示している内容を出力します（CSV・テキストはExcelで開けるようBOM付き）。

第2期の50ページでは、品質評価、選択式の演習、ログ不備検査、充電競合、加重平均、条件付きルール、効果の二重計上防止などを操作できます。第3期の50ページはすべて別々の操作部品でできており、同じ部品の見出し違いはありません。[追加調査と修正内容](RESEARCH.md) に出典・設計判断・計算の限界をまとめています。

## 設計の参考

公式の公開資料から、考え方・業務の進め方を参考にしました。デザインや本文を複製したものではありません。参照日は2026年9月16日です。

| 出典 | 取り入れた考え方 | 反映先 |
| --- | --- | --- |
| [Microsoft Adoption — Copilot](https://adoption.microsoft.com/en-us/Copilot/) | 学習・コミュニティ・成果共有・相談支援を組み合わせる | GAINの学習、事例、相談会、定着分析 |
| [Microsoft Learn — Champions](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/champions) | 現場の推進役による支援 | GAINのチャンピオン一覧、相談予約 |
| [Lean Enterprise Institute — Value Stream Mapping](https://www.lean.org/lexicon-terms/value-stream-mapping/) | 現状と将来像、作業と待ち時間を区別する | Workflow Mapperのネットワーク、ボトルネック、To-Be設計 |
| [Universal Robots — ROI & Payback](https://www.universal-robots.com/blog/calculating-roi-and-payback-period-for-your-robotic-investment/) | 投資回収を稼働・運用条件と一緒に考える | Robotの回収試算、実証、稼働ロス分析 |
| [HYPE — Innovation Management](https://www.hypeinnovation.com/platform/innovation-management) | アイデア・技術・担当・評価ゲート・成果をつなげる | Supplier Engagementの探索〜実証、EGCの提案〜効果確認 |
| [ASQ — SIPOC / Kano / Mistake Proofing](https://asq.org/quality-resources/sipoc) | 境界定義、要求の性質、間違いを起こせない仕組み | Workflow MapperのSIPOC、EGCの狩野分類・再発防止 |
| [OSHA Technical Manual — Robot System Safety](https://www.osha.gov/otm/section-4-safety-hazards/chapter-4) | 速度・離隔監視と管理手段の階層 | Robotの離隔距離、管理手段、可搬範囲 |
| [Google SRE Workbook — Canarying Releases](https://sre.google/workbook/canarying-releases/) | 一部への適用と比較群による進退判断 | Robotの設定変更の段階展開 |
| [HBR — Premortem / Kraljic](https://hbr.org/2007/09/performing-a-project-premortem) | 失敗を先に想定する、供給リスクと事業影響で分ける | Supplier Engagementのプレモーテム、調達ポートフォリオ |
| [Kirkpatrick Partners / NN∕g Journey Mapping](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/) | 学習効果の4段階、行為・考え・感情の地図 | GAINの根拠トレース、一日のジャーニー |

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
- 第2期の内容は `src/advanced-data.js`と `src/advanced.jsx`。第3期の内容は `src/frontier-data.js`、操作画面はサイト別の `src/frontier-{gain,robot,supplier,workflow,egc}.jsx`（`src/frontier.jsx` で集約）、スタイルは `src/frontier.css`。計算・検査処理は `src/models.js`、出典は `src/research.js` に分離しています。
- ハッシュルーティングを採用し、GitHub Pages上で200ページの直リンク・再読み込みが可能です。
- `npm run check` はページ数、ID・タイトル、リンク、各種データに加え、10種類の計算例と不正値、ログ検査、充電時間の境界条件、第3期の20種の計算（狩野分類表、リトルの法則、離隔距離、経路の交差、HHI、パーセンタイル、必要件数、平準化の緩衝、OEE、Brier、可搬範囲、段階展開の判定など）を検証します。第3期の50ページがすべて別の部品であることも検査します。
- `main` へのpushで `.github/workflows/pages.yml` が検証・ビルド・GitHub Pages公開を行います。
- Google Fontsを利用しています。読み込めない場合はシステムフォントへフォールバックします。

ページ一覧は [PAGES.md](PAGES.md) に収録しています。
