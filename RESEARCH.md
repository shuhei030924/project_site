# 追加50ページの調査と設計判断

2026年9月16日。公開された一次資料を読み、前回の100ページに足りなかった「根拠・条件差・継続運用・例外・効果の検証」を補いました。以下の画面は出典の製品画面や本文のコピーではなく、考え方を業務シーンに応用した独自設計です。

## 参照した資料と採用した視点

| 参照資料 | 読み取った視点 | 独自に設計した機能 |
| --- | --- | --- |
| [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) | AIを評価・検証し、利用上の責任を明確にする | 出力品質の人による採点、条件別の回帰評価、判断を人に戻す条件、匿名化練習 |
| [Microsoft Learn — Champions](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/champions) | 現場での支援と知識共有を定着につなげる | 学習後の同一受講者追跡、推進役の対応余力、利用障壁の聞き取り、事例再利用履歴 |
| [Lean Enterprise Institute — Standardized Work](https://www.lean.org/lexicon-terms/standardized-work/) | タクト・作業順序・必要な仕掛量を一緒に考える | 搬送能力、作業と待ち時間、需要と担当余力、業務廃止の確認 |
| [Lean Enterprise Institute — Leader Standard Work](https://www.lean.org/lexicon-terms/leader-standard-work/) | 管理者による観察・振り返り・問題解決支援を日々の活動にする | 巡回での問い、30/90日の定着確認、PDCA、継続・修正・中止の演習 |
| [MassRobotics — AMR Interoperability](https://www.massrobotics.org/what-is-the-massrobotics-amr-interoperability-standard/) | 機体の状態共有と制御の責任範囲を区別する | 接続境界の台帳と充電枠の競合確認。規格を実装した交通制御ではない |
| [NASA — Technology Readiness Levels](https://www.nasa.gov/aeronautics/technology-readiness-levels-demystified/) | 実証した環境と根拠を段階的に考える | 成熟度の証拠台帳、条件別の適合評価。NASAの正式TRL番号は自動付与しない |
| [Innovate UK — Innovation Exchange](https://iuk-business-connect.org.uk/programme/innovation-exchange/) | 課題と異業種の知識をつなぐ | 共創方法の選択、共同開発の役割、中止条件、情報・成果物の確認論点 |
| [Celonis — Event Logs](https://docs.celonis.com/en/event-logs--file-upload-) | 業務ログはケースID・活動・時刻から構成される | 欠落・重複・記録順の検査、経路ごとの所要時間の加重平均 |
| [ASQ — FMEA](https://asq.org/quality-resources/fmea) | 故障の起こり方と影響を系統的に考える | 影響・発生・検出の簡易評価。重大な影響を積の点数だけで埋もれさせない表示 |
| [NIST — Control Charts](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc31.htm) | 基準の変動と、特別な原因の兆候を区別する | 固定した基準期間との比較図。目標と参考限界を分離する |
| [Universal Robots — ROI & Payback](https://www.universal-robots.com/blog/calculating-roi-and-payback-period-for-your-robotic-investment/) | 投資と運用の前提を含めて効果を考える | 5年保有費用、稼働・復旧、利用割合と追加負担を反映する効果試算 |

## 追加した10ページずつの役割

- **GAIN**：出力の品質レビュー、受講後の実践定着、仕事とAIの適合判断、推進役の余力、利用障壁の聞き取り、判断トレーニング、匿名化練習、プロンプト変更の回帰評価、定着施策の比較実験、再利用履歴。
- **Robot**：タクトと搬送能力、充電競合、接続と制御の境界、停止時の判断、5年保有費用、故障と復旧、運用担当の理解確認、故障モード分析、部品補充点、再配置・終了計画。
- **Supplier Engagement**：成熟度の証拠、重み付き比較、共同開発の役割、成果物と持込情報、条件別実証、中止・撤収、データ受渡し、共創リスク、案件群の移行率、協業の進め方。
- **Workflow Mapper**：ログ検査、標準・例外経路、作業・待ち時間、例外の判断、ルール試行、自動化後の責任分担、変更影響、担当余力、暗黙知の裏付け、やめる仕事の確認。
- **EGC**：PDCAログ、改善による副作用、効果の安定性、二重計上チェック、処理量補正、多面的優先度、30/90日定着、現場巡回、継続・中止判断、実現効果。

すべての追加ページに具体例、操作、参照資料、次の行き先を配置。単なる見出し違いの一覧にせず、16種類の追加の操作画面を用意しました。

## 解釈と限界

- 数値、しきい値、人物、会社、製品は独自の架空例。出典組織の実績ではありません。
- 比較実験の差の差は、非ランダムな2群では因果効果を保証しません。
- 簡易の時系列図は10点の標本標準偏差を使う参考図。正式な管理図や工程能力判定の代替ではありません。
- RPNの積による並べ替えは演習用です。影響9以上を優先表示しますが、それ自体が正式な安全評価ではありません。
- 費用試算は税・割引率・資金調達を含みません。時間の価値換算は現金支出の削減と分けて表示します。
- 知識・成果物の台帳は担当部署へ確認する質問の整理です。権利帰属や契約内容を判定していません。
- 接続境界、充電計画、停止演習は実機に接続しておらず、ロボットを動かしません。

## 前回の100ページで修正した点

1. **下書きの保護**：Workflow Mapper→EGCで既存の提案下書きを削除しない。反映前に確認でき、保存前なら元の編集内容に戻せる。
2. **引き継ぎ情報の補完**：「人に残す判断」と「実証条件」も提案へ渡す。
3. **保存済み記録の出力**：初期データに加え、該当ページの保存済み状態をJSONへ含める。未保存入力は含まない旨を表示。
4. **レビューの根拠**：確認項目、解決状態、理由、日時を判定時点のスナップショットとして履歴へ残す。
5. **比較の視認性**：候補を選ぶと対応する表の列も強調される。
6. **事例の具体化**：9事例について、一般的な注意書きを対象業務・計測条件に合う手順へ変更。
7. **保存失敗の通知**：容量・設定の問題で保存できない場合、画面に継続して知らせる。
8. **発見しやすさ**：ホームに追加10ページへの入口を配置。ページ数は実データから表示し、検索は一致した全件を表示する。
