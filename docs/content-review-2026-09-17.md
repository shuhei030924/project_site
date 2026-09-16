# 活動説明に基づくページ見直し

基準：[ユーザー提供の活動説明全文](activity-brief-2026-09-17.md)。2026年9月17日。

## 全体方針

5領域・200ページの目的と説明を確認。半導体業務の実例と、ユーザーが既に編集していた機能を維持しつつ、中心的な活動が読み取れるよう5つのホームと各領域の入口を修正した。個別の学習・計算・運用ページは実践を支える詳細として残す。

- GAINの成果を「人材と文化」と明示。ツール利用や研修参加だけをゴールにしない。
- Workflow Mapperを4階層の業務理解と再設計の入口へ。全判断を評価する思想と、4つの人・AIの役割を明記。
- EGCは投稿後の妥当性確認・担当組織確認・実施可否判断・実行・効果確認に焦点を置く。
- Supplier Engagementは外部技術探索として、Strategy / Solution List / Benchmark / Scoring / QBRを接続。
- Robot Projectは機体稼働だけでなく、複数技術の適用・実証・ROI・横展開のポートフォリオとして説明。
- 5つの活動の関係図を全ホームに配置。代表的な流れに加え、直接提案・外部からの技術発見・成果の学習還流を示す。全案件が全活動を直列に通るという意味にはしない。
- 知的作業はAI支援やソフトウェア自動化へ、物理作業はRobot Projectへ進む。組み合わせも図解。

## 差し替えた5ページ

| 領域 | 旧ページ | 新ページ | 判断理由 |
| --- | --- | --- | --- |
| GAIN | ツール選びガイド | AI定着の障壁と支援 | ツール比較より、用途・仲間・成功例・相談先という組織要因への支援を優先。4つの障壁選択と支援メモを実装。 |
| Workflow Mapper | 分析テンプレート | 業務デジタルツインの4階層 | 汎用の質問集から、同じ半導体業務を4階層で読み解く図解へ。各階層の既存詳細ページとEGCへの引継ぎを接続。 |
| EGC | 改善の担い手 | 案件の担当と次の行動 | 貢献の紹介はGAINにもあるため、案件が忘れられる原因である担当・行動・期限の抜けに対応。独立した検討用台帳であることを明示。 |
| Supplier Engagement | 共創セッション | 技術探索戦略とQBR | イベント一覧から、共通言語・根拠確認・判断理由・担当・次回確認日の記録へ。正式判定やPoC設計へ接続。 |
| Robot Project | 交換部品在庫 | 工場の自動化領域マップ | 部品補充は既存の「交換部品の補充点」で扱うため、足りなかった5技術領域の具体像へ置換。 |

既存リンク・ブックマークを壊さないため、差し替えたページのルートIDを維持。新フォームの保存キーは別名にし、過去のデータと混同しない。

## 図と画像

5活動の関係、業務の4階層、人・AIの4役割、技術探索の5段階は日本語を正確に読めるHTML/CSSの図として作成。ロボットが工場内の何を変えるかは生成イラストと選択可能な5つの番号で表現した。

画像：[semiconductor-automation.png](../public/images/semiconductor-automation.png)。組込みimage_genツールで生成。実在工場の写真・社内設備・導入実績ではなく、説明用の概念イラスト。特定製品を再現していない。SPOTという名称はユーザー説明中の技術例としてのみ扱う。

### 生成時の最終プロンプト

```text
Use case: scientific-educational
Asset type: explanatory illustration for a Japanese semiconductor company transformation website.
Primary request: A clear, beautiful isometric cutaway illustration showing five distinct physical automation applications in a fictional semiconductor manufacturing facility, with spacious legible separation.
Scene: front left a low autonomous mobile robot carrying a sealed FOUP wafer container along a teal floor route; front right a collaborative robot arm handling a semiconductor test tray at a test workbench; rear left a yellow generic quadruped inspection robot observing gauges and pipes in a utility corridor; rear center a small automated parts warehouse with racks and shuttle; rear right overhead rail transport carrying sealed wafer containers between semiconductor processing tools.
Style: refined editorial architectural illustration, believable industrial forms, soft shadows, ivory background, muted teal and slate with restrained ochre accents. Wide landscape composition, no text and no labels. Each task must be visually distinguishable. All five zones fully visible.
Constraints: conceptual fictional facility, not an engineering layout; no logos, no company identity, no exposed wafers, no floating holograms, no decorative charts. Include two small appropriately clothed cleanroom technicians separated from robot operating areas for scale.
```

## 記録の境界

ユーザー説明を活動の基準として扱う。旧版の画像文字起こしはPROJECT_CONTEXT.mdに履歴として保持する。原資料の独立確認や実データ連携は行っていない。新しい編集機能も既存仕様と同じくブラウザ内のデモ保存であり、正式承認・共有システム・実機制御は実行しない。
