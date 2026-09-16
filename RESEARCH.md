# 追加調査と設計判断

## 第3期（各10ページ・計50ページ）— 現場の型と数理

2026年9月16日。前回までの150ページが「業務を記録・評価・比較する」画面に寄っていたため、第3期ではリーン生産・品質工学・安全工学・ソフトウェア運用で長く使われている**手法そのもの**を一次資料から読み、この5つの取り組みに当てはめました。50ページはすべて別々の操作部品で、同じ部品の見出し違いはありません（`npm run check` で部品の重複を禁止）。

### 参照した資料と採用した視点

| 参照資料 | 読み取った視点 | 独自に設計した機能 |
| --- | --- | --- |
| [Kirkpatrick Partners — The Kirkpatrick Model](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/) | 反応→学習→行動→成果の4段階は「つながり」として確かめる | GAIN：根拠が切れた段階以降を「主張のみ」と表示する4段階トレース |
| [NN/g — Journey Mapping 101](https://www.nngroup.com/articles/journey-mapping-101/) | 行為・考え・感情を段階ごとに並べ、感情の谷から機会を見つける | GAIN：感情スライダーで曲線が動く一日のジャーニー |
| [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)（継続） | 出力を評価・検証し、判断責任を明確にする | GAIN：観察・解釈・結論のはしご、判定木、文単位の事実確認、語差分、自信の較正（Brier） |
| [Microsoft Learn — Champions](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/champions)（継続） | 現場の推進役と継続的な学び | GAIN：間隔反復の再現予定、教え合いの組み合わせ、役割別パス |
| [LEI — Andon](https://www.lean.org/lexicon-terms/andon/) | 異常を知らせ、決めた位置で止め、応答者を呼ぶ | Robot：呼び出し・経過時間・応答のはしご |
| [OSHA OTM — Industrial Robot System Safety](https://www.osha.gov/otm/section-4-safety-hazards/chapter-4) | 速度・離隔監視、管理手段の階層、危険源の分類 | Robot：離隔距離の概念図、危険源×管理手段のピラミッド、可搬範囲の判定 |
| [Google SRE Workbook — Canarying Releases](https://sre.google/workbook/canarying-releases/) | 一部にだけ適用し比較群と見比べ、予算内で進退を決める | Robot：走行設定の段階展開（8→25→50→100%） |
| [LEI — Standardized Work](https://www.lean.org/lexicon-terms/standardized-work/)（継続） | タクト・作業順序・稼働の損失 | Robot：OEEの滝グラフ、稼働率と待ち時間の曲線（Kingman近似）、ヤマヅミ表 |
| [ASQ — FMEA](https://asq.org/quality-resources/fmea)（継続） | 検知・判断・復旧を分けて対策する | Robot：復旧タイムラインの再生、停止の場所ヒートマップ |
| [HBR — Performing a Project Premortem](https://hbr.org/2007/09/performing-a-project-premortem) | 「すでに失敗した」として理由を集める | Supplier：失敗の見出し、理由と予兆、12週の確認カレンダー |
| [HBR — Purchasing Must Become Supply Management](https://hbr.org/1983/09/purchasing-must-become-supply-management) | 供給リスク×事業影響の4象限 | Supplier：技術領域の調達ポートフォリオ、依存集中（HHI） |
| [NASA — TRL](https://www.nasa.gov/aeronautics/technology-readiness-levels-demystified/)（継続） | 主張ではなく環境と根拠で確かめる | Supplier：三者の説明の照合、実証に必要な件数 |
| [Innovate UK — Innovation Exchange](https://iuk-business-connect.org.uk/programme/innovation-exchange/)（継続） | 課題文の質と協業条件 | Supplier：課題文の点検、費用と成果の分担、技術と企業のつながり図、マイルストーン連動支払い |
| [ASQ — SIPOC+CM](https://asq.org/quality-resources/sipoc) | 供給者・入力・工程・出力・顧客＋制約・測定 | Workflow：7欄のボードと抜けの点検 |
| [LEI — Spaghetti Chart](https://www.lean.org/lexicon-terms/spaghetti-chart/) | 移動経路の距離と交差 | Workflow：格子上の経路図、順番と配置の変更 |
| [LEI — Heijunka](https://www.lean.org/lexicon-terms/heijunka/) | 量と種類の平準化と必要な緩衝 | Workflow：曜日の依頼件数の平準化 |
| [Bus factor](https://en.wikipedia.org/wiki/Bus_factor) | 何人抜けると止まるか | Workflow：作業×担当者の係数と訓練予定 |
| [Celonis — Event Logs](https://docs.celonis.com/en/event-logs--file-upload-)（継続） | 記録と標準の照合 | Workflow：標準手順との適合検査（LCSによる飛ばし・追加の検出）、帳票項目の利用状況 |
| [ASQ — Kano Model](https://asq.org/quality-resources/kano-model) | 当たり前・一元的・魅力的の分類 | EGC：二問からの分類と分布 |
| [Little's Law](https://en.wikipedia.org/wiki/Little%27s_law) | L ＝ λW | EGC：仕掛かり・処理速度・受付から滞留とリードタイムを試算 |
| [ASQ — Mistake Proofing](https://asq.org/quality-resources/mistake-proofing) | 排除・置換・容易化・検出と検査の位置 | EGC：間違いごとの対策選択 |
| [LEI — Hoshin Kanri](https://www.lean.org/lexicon-terms/hoshin-kanri/) | 方針の受け渡しと懸念の戻し | EGC：キャッチボール、関係者の合意状況 |
| [LEI — Leader Standard Work](https://www.lean.org/lexicon-terms/leader-standard-work/)（継続） | 現場の負荷と返答の遅れを見る | EGC：変更負荷、問題の分解ツリー、返答時間の90パーセンタイル |

### 解釈と限界（第3期）

- 離隔距離は S ＝（人の速度＋機体の速度）×（反応時間＋停止時間）＋余裕という**概念理解のための簡略式**。規格に基づく安全距離の算定・審査を代替しません。
- 待ち時間はKingmanの近似式、必要件数は正規近似（有意水準5%・検出力80%・両群同数）の簡略式。実際の設計では前提の確認が必要です。
- リトルの法則は到着と完了が安定した期間の平均にのみ成り立ちます。4週後の見込みは単純な線形外挿です。
- 類似度は二文字連鎖のJaccard係数で、意味の近さは判定しません。課題文の点検は語の有無による簡易ルールです。
- Kirkpatrickの段階名、狩野モデルの分類表、Kraljicの象限名は一般的な整理を参照し、判定基準・数値・人物・企業はすべて独自の架空例です。
- アンドン、段階展開、可搬範囲は実機・信号灯・フリート管理に接続していません。

### 今回修正した既存の甘さ

0. **業務例を半導体製造に統一**：見積比較・購買申請・経費精算・部品組立など一般製造業の例を、ホールドロットの処置（SPC値・装置履歴・前ロットの照合→解除/リワーク/スクラップ→MES登録）、ウェーハ外観検査（パーティクル・線幅ずれ・CMPパッド摩耗）、FOUP搬送（ベイ・ストッカー・ロードポート）、サブファブ巡回（真空ポンプ・ガスキャビネット）、装置PM、レシピ変更申請、後工程のトレイ供給・テスト・テープ&リール梱包へ置き換え。部門名も 品質保証・プロセス技術・装置保全・製造・生産管理 に揃えた。数値（月120件・35分→14分、21分短縮など）は変えていないため、試算と検査の期待値は従来どおり。
1. **JSON書き出しのBOM**：すべてのダウンロードに先頭BOMを付けていたため、JSONがRFC 8259に反しパーサによっては読めなかった。JSONではBOMを付けず、CSV・テキストのみExcel向けに残す。
2. **サイドバーの区切りが固定値**：ページ数が変わると区切り位置が崩れる作りだったため、区切りを配列で定義し、第3期の区切り（31ページ目）を追加。
3. **ホームの入口**：第2期・第3期の20ページが一つの一覧に混ざらないよう、`wave` で分けて2つの入口を表示。
4. **アイコンの欠落**：第2期16種と第3期50種の部品にサイドバー用アイコンがなく、すべて同じ文書アイコンになっていた。
5. **7列レイアウトの横はみ出し**：格子列を `minmax(0, 1fr)` にし、1440px幅で全200ページのはみ出しを0に。

## 第2期（各10ページ・計50ページ）

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
