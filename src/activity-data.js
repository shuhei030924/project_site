// 基準：docs/activity-brief-2026-09-17.md。案件・数値・担当は架空のデモ。
export const activityOrder = ["gain", "workflow", "egc", "supplier", "robot"];
export const activityRoles = {
  gain: { name: "GAIN", verb: "人と文化を育てる", output: "日常業務でAIを使う人材と、支え合う文化", description: "学ぶ機会、質問できる仲間、再利用できる成功事例をつなぎ、AIが当たり前に使われる組織をつくります。", entry: "tool-guide", link: "定着を阻む壁を見つける", headline: "AIが当たり前に使われる、\n組織をつくる。" },
  workflow: { name: "Workflow Mapper", verb: "業務と判断を理解する", output: "判断の根拠と、人・AIの役割を備えた改善候補", description: "全体の流れから個人の判断ロジックまで4階層で掘り下げ、業務のデジタルツインとして再設計に使います。", entry: "templates", link: "4階層で業務を掘り下げる", headline: "仕事を理解し、\n次の業務を設計する。" },
  egc: { name: "EGC", verb: "改善を実行までつなぐ", output: "担当・次の行動・効果確認まで追える改善案件", description: "現場の気づきや分析で見つけた改善案を案件化し、妥当性確認、担当組織確認、実施可否判断、実行、効果確認まで管理します。", entry: "recognition", link: "案件の担当と次の行動を確認", headline: "良いアイデアを、\n実行と成果まで。" },
  supplier: { name: "Supplier Engagement", verb: "外部の技術を取り込む", output: "比較・評価の根拠を持つ技術候補と実証計画", description: "パートナーのAI・自動化・ロボット技術を探索し、比較、評価、PoC、標準化、横展開へつなげます。", entry: "meetings", link: "探索戦略とQBRをつなぐ", headline: "外の知識を、\n現場の生産性へ。" },
  robot: { name: "Robot Project", verb: "物理作業を変える", output: "現場で検証された自動化と、他拠点に広げる知見", description: "巡回・点検・保守準備・部品搬送・材料搬送を対象に、複数技術のロードマップ、ROI、実証、拠点展開を管理します。", entry: "parts", link: "工場の自動化領域を見る", headline: "現場の作業から、\n自動化の価値を描く。" },
};

export const workflowLayers = [
  { title: "業務全体の流れ", subject: "ホールドロットの処置", detail: "製造の異常検知 → 品質保証の評価 → プロセス技術の調査 → 処置・記録。情報と責任が部門間をどう動くかを捉える。", question: "どこで待つか。誰へ、何を渡すか。", output: "部門・入出力・待ち時間", target: "network" },
  { title: "工程の判断ポイント", subject: "追加検査が必要か", detail: "測定結果と基準、類似不良、対象ロットの影響範囲を照合。通常経路と追加調査へ進む条件を分ける。", question: "何を根拠に分岐し、誰が責任を持つか。", output: "条件・根拠・判断者・例外経路", target: "decisions" },
  { title: "チームの手順", subject: "評価に必要な証拠を揃える", detail: "担当チームが測定履歴を取得し、装置履歴と照合、欠損を確認してレビュー資料を作る。順序と受け渡し条件を明らかにする。", question: "どの順序で、何を確認して完了とするか。", output: "作業順序・担当・完了条件", target: "procedure" },
  { title: "個人の判断ロジック", subject: "経験から例外を見抜く", detail: "熟練者が気づく「装置PM直後だけの傾向」などを、確認すべき仮説として記録。経験則を検証済みの基準と混同しない。", question: "何に違和感を持つか。どんな場合に判断を保留するか。", output: "経験則・例外・確信度・確認方法", target: "tacit" },
];
export const roleModes = ["人のみ", "人＋AI", "AI主体", "完全自動化"];
export const robotDomains = [
  { name: "AMR", jp: "自律搬送ロボット", position: "左手前", point: [29, 73], work: "部品・材料を必要な場所へ運ぶ", example: "保守部品の補充やFOUP搬送候補。人・扉・装置との受け渡しを含めて評価。", check: "搬送時間、停止、積載物、クリーン適合性", route: "route" },
  { name: "CoBot", jp: "協働ロボット", position: "右手前", point: [76, 58], work: "繰り返しの着脱・準備作業を支援", example: "テストトレイの着脱や保守準備。人に残す作業との分担を設計。", check: "把持品質、段取り時間、作業者との接触リスク", route: "readiness" },
  { name: "SPOT / 四足歩行", jp: "設備巡回・点検", position: "左奥", point: [17, 37], work: "設備を巡回し、計器・熱画像を記録", example: "サブファブの巡回や異常監視。SPOTはユーザー説明に含まれる技術例。図は特定製品を再現していない。", check: "読み取り品質、巡回範囲、通信断時の対応", route: "pilot" },
  { name: "Warehouse Automation", jp: "倉庫自動化", position: "中央奥", point: [44, 25], work: "保守部品の保管・取り出し・供給を支援", example: "保守準備に必要な部品を揃える。倉庫内作業と現場への搬送の境界を設計。", check: "出庫精度、供給時間、在庫連携、復旧手順", route: "integration-boundary" },
  { name: "Wafer Logistics", jp: "ウェーハ搬送", position: "右上", point: [78, 19], work: "密閉容器を工程・設備間で搬送", example: "図は天井搬送の概念例。AMRを含む他方式との役割分担も検討する。", check: "設備接続、搬送能力、汚染・振動、追跡性", route: "line-capacity" },
];

export function applyActivityBrief(sites) {
  const replacements = {
    gain: { id: "tool-guide", title: "AI定着の障壁と支援", type: "adoption-support", description: "何に使うか、誰に聞くか。組織の4つの壁から支援を選ぶ。" },
    workflow: { id: "templates", title: "業務デジタルツインの4階層", type: "workflow-layers", description: "ひとつの業務を全体・判断・チーム・個人へ掘り下げ、人とAIの分担を考える。" },
    egc: { id: "recognition", title: "案件の担当と次の行動", type: "execution-tracker", description: "妥当性・担当組織・実施可否・実行・効果確認を、次の行動と一緒に追う。" },
    supplier: { id: "meetings", title: "技術探索戦略とQBR", type: "technology-qbr", description: "Strategy・Solution List・Benchmark・Scoringを、四半期レビューと実証判断へつなぐ。" },
    robot: { id: "parts", title: "工場の自動化領域マップ", type: "automation-atlas", description: "AMR・CoBot・四足歩行・倉庫自動化・ウェーハ搬送を、現場の作業から理解する。" },
  };
  for (const site of sites) {
    const role = activityRoles[site.id];
    site.name = role.name;
    site.short = role.verb;
    const overview = site.pages.find(p => p.id === "overview");
    Object.assign(overview, { title: `${role.verb}ホーム`, description: role.description, headline: role.headline, focus: role.description, target: role.entry, cta: role.link });
    const replacement = replacements[site.id];
    site.pages[site.pages.findIndex(p => p.id === replacement.id)] = replacement;
  }
  const robot = sites.find(s => s.id === "robot");
  robot.pages.find(p => p.id === "portfolio").items = robotDomains.map(d => [d.name, d.jp, d.example, "適用候補 / デモ"]);
  const workflow = sites.find(s => s.id === "workflow");
  workflow.pages.find(p => p.id === "ai-fit").description = "すべての判断でAI化の可能性を評価する。4つの役割区分は「業務デジタルツインの4階層」で試せます。";
}
