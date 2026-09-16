// 公式発表と設計上の仮説を分離。社内事例はすべてデモ。
export const checkedDate = "2026-09-17";
export const knowledgeSources = [
  {
    name: "KCS v6 — Summary",
    url: "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/041",
    use: "相談の解決時に知見を残し、再利用時に更新する設計。",
  },
  {
    name: "IHMC — Linking Words",
    url: "https://cmap.ihmc.us/docs/linkingwords.php",
    use: "マップの線に関係を示す言葉を付け、知識間の意味を表す。",
  },
  {
    name: "NASA — Lessons Learned",
    url: "https://www.nasa.gov/learning-resources/for-professionals/appel-lessons-learned/",
    use: "教訓に適用先の手順と確認担当を持たせる。",
  },
  {
    name: "Agile Alliance — Architecture Decision Records",
    url: "https://agilealliance.org/resources/experience-reports/distribute-design-authority-with-architecture-decision-records/",
    use: "判断・背景・代替案・影響の記録を業務設計へ応用。",
  },
  {
    name: "Thoughtworks — Technology Radar FAQ",
    url: "https://www.thoughtworks.com/radar/faq",
    use: "技術の評判と現場の検証を区別し、次の検証を管理。区分は本サイト独自。",
  },
  {
    name: "The Kanban Guide — May 2025",
    url: "https://kanbanguides.org/the-kanban-guide/",
    use: "着手・完了条件、仕掛かり数、滞留を可視化する設計。",
  },
];
export const newsItems = [
  {
    id: "copilot-20260902",
    date: "2026-09-02",
    provider: "Microsoft",
    category: "業務エージェント",
    title: "Copilot Studio：複数工程を扱うエージェントの基盤を拡張",
    url: "https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-github-copilot-harness-agent-skills-and-richer-context/",
    fact: "GitHub Copilot harnessの一般提供を発表。再利用できるskillsやツール連携を説明している。memoryなど一部機能はプレビュー。",
    hypothesis:
      "設備PMの記録検索から、必要情報の確認・例外の引き継ぎまでを一連の業務として試せるか。",
    next: "匿名化したPM記録で、根拠の追跡と例外時の人への引き継ぎを評価する。",
    caution:
      "利用可能な機能、権限、契約条件を自社環境で確認。一般提供とプレビューを分ける。",
    group: "workflow",
    route: "#/workflow/versions",
  },
  {
    id: "notebook-20260828",
    date: "2026-08-28",
    provider: "Google",
    category: "知識活用",
    title: "Gemini Notebook：利用枠を計算量に応じて管理",
    url: "https://blog.google/innovation-and-ai/products/gemini-notebook/new-flexible-usage-limits/",
    fact: "計算量に応じた利用枠と5時間ごとの更新を発表。9月2日から個人向けアカウントに順次導入すると説明。",
    hypothesis:
      "資料の量や出力形式によって、勉強会用の教材作成に必要な利用枠が変わる可能性がある。",
    next: "公開資料だけで教材を試作し、資料数・出力形式・待ち時間を記録する。",
    caution:
      "個人向けの発表。企業向け契約や社内利用への適用は、この発表だけでは判断できない。",
    group: "gain",
    route: "#/gain/events",
  },
  {
    id: "physical-20260316",
    date: "2026-03-16",
    provider: "NVIDIA",
    category: "Physical AI",
    title: "Physical AI：ロボット企業との連携とシミュレーション基盤",
    url: "https://nvidianews.nvidia.com/news/nvidia-and-global-robotics-leaders-take-physical-ai-to-the-real-world",
    fact: "ロボット各社との連携に加え、Cosmos、Isaac、GR00T関連のモデル・フレームワークを発表。",
    hypothesis:
      "搬送や着脱の実証前に、現場の例外をシミュレーションで洗い出す検討材料になる。",
    next: "対象作業を1つ選び、再現したい停止・受け渡し・復旧条件をサプライヤーと整理する。",
    caution:
      "背景資料として掲載。発表は半導体工場での適合性や導入成果を保証するものではない。",
    group: "robot",
    route: "#/supplier/knowledge",
  },
];
export const knowledgeGroups = [
  { id: "gain", name: "GAIN", verb: "学びを実践へ", color: "#337761" },
  {
    id: "workflow",
    name: "Workflow Mapper",
    verb: "判断を言葉へ",
    color: "#3d6987",
  },
  { id: "egc", name: "EGC", verb: "気づきを改善へ", color: "#a06434" },
  {
    id: "supplier",
    name: "Supplier Engagement",
    verb: "外の知識を検証へ",
    color: "#7a6396",
  },
  {
    id: "robot",
    name: "Robot Project",
    verb: "現場の経験を次へ",
    color: "#377f88",
  },
];
const node = (id, group, title, relation, detail, route, related = []) => ({
  id,
  group,
  title,
  relation,
  detail,
  route,
  related,
  owner: "活動推進担当（デモ）",
  review: "2026-10-01",
  status: "仮説・デモ",
  evidence: "説明用サンプル。実績を示す記録ではありません。",
});
export const initialKnowledge = [
  node(
    "ask",
    "gain",
    "質問できる相手がいない",
    "障壁を見つける",
    "相談先を見つけられない時は、未解決の問いとして見える場所に残す。",
    "#/gain/challenge",
    ["tacit"],
  ),
  node(
    "teach",
    "gain",
    "小さな実践を教材にする",
    "実践から学ぶ",
    "試した業務、入力条件、人が確認した点を共有する。",
    "#/gain/events",
    ["monthend"],
  ),
  node(
    "news",
    "gain",
    "AIニュースを業務で読み解く",
    "変化を取り込む",
    "発表事実、活用仮説、次の検証を分けて読む。",
    "#/gain/recognition",
    ["watch"],
  ),
  node(
    "tacit",
    "workflow",
    "熟練者の例外判断",
    "判断を掘り下げる",
    "通常手順と異なる時に、何を見て判断しているかを聞く。",
    "#/workflow/tacit",
    ["decision"],
  ),
  node(
    "decision",
    "workflow",
    "なぜ人の判断を残したか",
    "理由を残す",
    "採用しなかった案と、再検討する条件まで記録する。",
    "#/workflow/versions",
    ["inspect"],
  ),
  node(
    "layers",
    "workflow",
    "4階層の業務デジタルツイン",
    "業務を理解する",
    "全体・工程・チーム・個人の判断をつなげる。",
    "#/workflow/templates",
    ["wip"],
  ),
  node(
    "monthend",
    "egc",
    "月末だけ集計が止まる",
    "失敗から学ぶ",
    "平常日のデータだけで検証しない。月末の追加列を試験条件に含める。",
    "#/egc/retrospective",
    ["decision"],
  ),
  node(
    "wip",
    "egc",
    "始めすぎて進まない",
    "滞留を減らす",
    "着手済み案件を数え、担当と次の行動を先に決める。",
    "#/egc/pipeline",
    ["watch"],
  ),
  node(
    "reuse",
    "egc",
    "教訓を手順に戻す",
    "知見を適用する",
    "共有だけで終わらせず、更新する手順と確認者を指定する。",
    "#/egc/retrospective",
    ["teach"],
  ),
  node(
    "watch",
    "supplier",
    "発表と現場の証拠を分ける",
    "外部技術を調べる",
    "技術の新しさと、対象業務での適合性は別々に確認する。",
    "#/supplier/knowledge",
    ["inspect"],
  ),
  node(
    "poc",
    "supplier",
    "PoCの終了条件を揃える",
    "検証を設計する",
    "良い結果だけでなく、除外条件と復旧の条件も決める。",
    "#/supplier/poc",
    ["transfer"],
  ),
  node(
    "scale",
    "supplier",
    "展開先の違いを洗い出す",
    "条件を比較する",
    "設備、通路、運用、支援体制の違いを確認して展開する。",
    "#/supplier/scale",
    ["cobot"],
  ),
  node(
    "inspect",
    "robot",
    "計器の反射で読み取れない",
    "適用限界を知る",
    "照明・角度・計器形式を変えて読み取り条件を確認する。",
    "#/robot/comparison",
    ["tacit"],
  ),
  node(
    "transfer",
    "robot",
    "搬送の最後の受け渡し",
    "境界を確認する",
    "走行だけでなく、相手設備との受け渡しと復旧を含めて試す。",
    "#/robot/comparison",
    ["poc"],
  ),
  node(
    "cobot",
    "robot",
    "段取り替えを含めた自動化",
    "実作業で確かめる",
    "繰り返し動作に加え、品種変更時の治具交換や確認作業を評価する。",
    "#/robot/comparison",
    ["scale"],
  ),
];
export const replacementPages = [
  [
    "gain",
    "recognition",
    "AIニュースと業務への影響",
    "knowledge-news",
    "公式発表を、業務で試す仮説と次の行動へ。公開日・確認日・出典付き。",
  ],
  [
    "gain",
    "community",
    "つながるナレッジマップ",
    "knowledge-map",
    "5つの活動を横断して、知見・問い・判断理由のつながりをたどる。",
  ],
  [
    "gain",
    "challenge",
    "未解決の問い・相談募集",
    "knowledge-questions",
    "質問を担当・検証・答えへつなぎ、解決した知見をマップに残す。",
  ],
  [
    "workflow",
    "versions",
    "判断の理由と見直し条件",
    "knowledge-decisions",
    "採用案・代替案・判断の背景と、見直す条件を記録する。",
  ],
  [
    "supplier",
    "knowledge",
    "技術ウォッチと検証待ち",
    "knowledge-watch",
    "外部発表から足りない証拠を見つけ、次の実証と担当を決める。",
  ],
  [
    "robot",
    "comparison",
    "適用条件・現場知見ライブラリ",
    "knowledge-field",
    "搬送・点検・着脱の知見を、適用できる条件とできない条件で探す。",
  ],
  [
    "egc",
    "retrospective",
    "失敗から再利用する知見",
    "knowledge-lessons",
    "発生条件・教訓・反映先の手順・確認者を結び、次の現場に生かす。",
  ],
  [
    "egc",
    "pipeline",
    "改善案件の滞留と次の行動",
    "knowledge-pipeline",
    "仕掛かり数・止まった理由・担当・期限を見ながら案件を前へ進める。",
  ],
];
export function applyKnowledgeReview(sites) {
  for (const [siteId, id, title, type, description] of replacementPages) {
    const site = sites.find((s) => s.id === siteId);
    site.pages[site.pages.findIndex((p) => p.id === id)] = {
      id,
      title,
      type,
      description,
    };
  }
}
export const fieldCases = [
  {
    id: "inspection",
    task: "点検",
    title: "計器の反射で読めなくなる",
    image: "robot-inspection",
    condition: "同じ計器でも、照明・撮影角度・表面の汚れで入力が変わる。",
    works: "対象計器と照明条件を固定し、読めない画像を人に返す手順を定義する。",
    fails: "昼間の鮮明な画像だけで検証して夜間巡回へ展開する。",
    test: "照明と撮影角度を変えた画像を集め、誤読と読み取り不能を分けて評価する。",
    link: "#/robot/pilot",
    related: "inspect",
  },
  {
    id: "transfer",
    task: "搬送",
    title: "走れることと、渡せることは違う",
    image: "egc-foup-comparison",
    condition:
      "相手設備の準備、位置決め、扉、通路の混雑が搬送の終了を左右する。",
    works: "受け渡しの完了信号と、待機・中断・人への引き継ぎを先に決める。",
    fails: "空の通路での移動時間だけで搬送能力を見積もる。",
    test: "受け取り不可、通信断、荷物ありの状態からの復旧を実証計画に含める。",
    link: "#/robot/integration-boundary",
    related: "transfer",
  },
  {
    id: "cobot",
    task: "着脱",
    title: "品種変更後に同じようにつかめるか",
    image: "robot-cobot",
    condition: "対象物の形状、治具、設置位置、品種変更の頻度が変わる。",
    works: "対象品種を限定し、段取りと確認を含めた作業全体を評価する。",
    fails: "代表品種の繰り返し動作だけで全品種の省力化を見積もる。",
    test: "品種ごとの段取り時間と把持失敗時の対応を記録する。",
    link: "#/robot/readiness",
    related: "cobot",
  },
];
export const pipelineStages = ["受付", "評価", "実行", "効果確認", "完了"];
export const initialPipeline = [
  {
    id: "EGC-027",
    title: "装置PM記録の検索",
    owner: "山本（デモ）",
    due: "2026-09-25",
    stage: 0,
    entered: "2026-09-10",
    next: "対象記録を匿名化する",
    blocker: "",
    evidence: "",
  },
  {
    id: "EGC-026",
    title: "空FOUP回収改善",
    owner: "高橋（デモ）",
    due: "2026-09-22",
    stage: 1,
    entered: "2026-09-08",
    next: "夜間の待ち時間を測る",
    blocker: "測定時間の調整待ち",
    evidence: "",
  },
  {
    id: "EGC-024",
    title: "ホールドロット処置支援",
    owner: "鈴木（デモ）",
    due: "2026-09-30",
    stage: 2,
    entered: "2026-09-09",
    next: "例外3件を品質担当と確認",
    blocker: "",
    evidence: "",
  },
  {
    id: "EGC-023",
    title: "ホールド申請フォーム統一",
    owner: "佐藤（デモ）",
    due: "2026-09-16",
    stage: 2,
    entered: "2026-09-01",
    next: "承認者へ改訂版を提示",
    blocker: "",
    evidence: "",
  },
  {
    id: "EGC-018",
    title: "日次ロット集計自動化",
    owner: "田中（デモ）",
    due: "2026-09-20",
    stage: 3,
    entered: "2026-09-12",
    next: "月末条件を追加して再測定",
    blocker: "",
    evidence: "通常日だけの結果。月末未評価。",
  },
];
export function pipelineGate(items, item, target, limit) {
  if (target === item.stage) return "";
  if (target > item.stage + 1)
    return "順に段階を進め、各段階で内容を確認してください。";
  if (target > item.stage && item.blocker.trim())
    return "止まった理由を解消してから次へ進めてください。";
  if (target > 0 && (!item.owner.trim() || !item.next.trim() || !item.due))
    return "担当・次の行動・期限を入力してください。";
  const count = items.filter(
    (i) => i.stage > 0 && i.stage < 4 && i.id !== item.id,
  ).length;
  if (
    target > 0 &&
    target < 4 &&
    (item.stage === 0 || item.stage === 4) &&
    count >= limit
  )
    return "仕掛かり上限です。着手済み案件を先に進めてください。";
  if (target === 4 && (!item.evidence.trim() || !item.effectVerified))
    return "効果確認の記録を入力し、確認済みにしてから完了にしてください。";
  return "";
}
