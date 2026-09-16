import React, { useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useSaved } from "./storage";
import { activityOrder, activityRoles, workflowLayers, roleModes, robotDomains } from "./activity-data";

const link = (site, page = "overview") => `#/${site}/${page}`;
const Go = ({ site, page, children }) => <a className="text-link" href={link(site, page)}>{children}<ArrowUpRight size={15} /></a>;
const Panel = ({ title, children, className = "" }) => <section className={`panel activity-panel ${className}`}><h2>{title}</h2>{children}</section>;

export function ActivityMap({ site }) {
  const role = activityRoles[site.id];
  return <section className="activity-map" aria-label="5つの活動の関係">
    <div className="activity-map-heading"><div><span className="eyebrow">ONE TRANSFORMATION PLATFORM</span><h2>人・業務・技術をつなぎ、改善を日常へ。</h2></div><span className="activity-label">半導体製造の業務変革</span></div>
    <div className="activity-cycle">{activityOrder.map((id, i) => <a key={id} href={link(id)} className={id === site.id ? "selected" : ""} aria-current={id === site.id ? "location" : undefined}><span className="activity-step">0{i + 1}</span><strong>{activityRoles[id].name}</strong><span>{activityRoles[id].verb}</span>{i < 4 && <ArrowRight className="cycle-arrow" size={18} />}</a>)}</div>
    <div className="activity-feedback"><span>現場の気づき → EGCへ直接提案</span><span>外部技術の発見 → 業務の再設計へ</span><span>実装で得た学び → GAINで共有 ↺</span></div>
    <div className="activity-output"><div><small>{role.name} が生み出すもの</small><strong>{role.output}</strong></div><Go site={site.id} page={role.entry}>{role.link}</Go></div>
    <p className="activity-caption">矢印は代表的なつながりです。案件に応じて必要な活動を組み合わせます。知的作業はAI支援・ソフトウェア自動化へ、物理作業はRobot Projectへ進み、両方を組み合わせる場合もあります。</p>
  </section>;
}

const barriers = [
  { title: "何に使えばよいかわからない", scene: "品質保証の担当者が、報告作成のどこにAIを使えるか想像できない。", action: "自分の報告書の匿名化サンプルを持ち寄り、15分の要約実践会を開く。", evidence: "参加人数に加えて、翌週に自分の業務で再利用した人を確認する。", target: "events", destination: "ワークショップ" },
  { title: "周囲に利用者がいない", scene: "装置保全チームでひとりだけ試しており、続けるきっかけがない。", action: "同じ業務の仲間とペアになり、週1回、使えた場面と失敗を共有する。", evidence: "教え合いが続いたか、支援を受けた人が次の人を支援できたかを見る。", target: "peer-pairing", destination: "教え合いの組み合わせ" },
  { title: "成功例が見えない", scene: "効果が伝わらず、従来の手順を変える理由を持てない。", action: "半導体業務の事例に、入力の準備・人の確認・適用できない条件も添える。", evidence: "閲覧件数だけでなく、別チームでの再利用と実際の変化を追う。", target: "stories", destination: "成功事例ギャラリー" },
  { title: "質問できる相手がいない", scene: "出力の確かめ方でつまずいても、誰に聞けばよいかわからない。", action: "業務を理解するチャンピオンと相談枠を結び、質問を次の教材に反映する。", evidence: "質問が解消し、相談した人が自分で実践を再開できたかを確認する。", target: "office-hours", destination: "相談予約" },
];
function AdoptionSupport({ storageKey }) {
  const [selected, setSelected] = useState(0);
  const [memo, setMemo] = useSaved(`${storageKey}:support-v1`, "品質保証チームで報告要約を試し、翌週に再利用できたかを聞く。");
  const b = barriers[selected];
  return <div className="activity-content"><Panel title="ツールの導入から、使い続けられる環境へ。"><p>GAINの成果物は、AIを日々の業務に使える人材と文化。学習・実践・共有・相談を組み合わせて支えます。</p><div className="barrier-grid">{barriers.map((x, i) => <button key={x.title} className={selected === i ? "selected" : ""} aria-pressed={selected === i} onClick={() => setSelected(i)}><small>障壁 0{i + 1}</small><strong>{x.title}</strong></button>)}</div></Panel>
    <Panel title={b.title}><div className="activity-three"><div><small>現場の場面</small><p>{b.scene}</p></div><div><small>支援の設計</small><p>{b.action}</p></div><div><small>変化を確かめる</small><p>{b.evidence}</p></div></div><Go site="gain" page={b.target}>{b.destination}へ</Go></Panel>
    <Panel title="自分のチームで試す支援"><label className="activity-field">対象のチーム・支援内容・確認するタイミング<textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} /></label><p className="activity-caption">編集内容はこのブラウザに自動保存されます。</p><Go site="gain" page="adoption">部門別の定着状況を確認</Go></Panel></div>;
}

function WorkflowLayers({ storageKey }) {
  const [level, setLevel] = useState(0);
  const [roles, setRoles] = useSaved(`${storageKey}:roles-v1`, ["完全自動化", "人＋AI", "AI主体", "人のみ"]);
  const tasks = [
    ["形式が決まった測定値の転記", "確定ルールで照合し、欠損・不一致は停止。"],
    ["異常原因の仮説づくり", "AIが候補と根拠を提示し、担当者が評価。"],
    ["根拠付きの評価資料の下書き", "AIが作成し、例外を人へ渡す。適用前に品質を検証。"],
    ["ホールド解除の最終承認", "責任者が品質と影響を判断し、承認責任を持つ。"],
  ];
  const l = workflowLayers[level];
  return <div className="activity-content"><Panel title="同じ業務を、4つの深さで見る。"><p>例：ホールドロット処置。業務の地図に、判断・手順・暗黙知を重ね、AI化の可能性を評価します。</p><div className="layer-layout"><div className="layer-stack" aria-label="分析の階層">{workflowLayers.map((x, i) => <button key={x.title} onClick={() => setLevel(i)} aria-pressed={level === i} className={level === i ? "selected" : ""}><span>L{i + 1}</span><strong>{x.title}</strong></button>)}</div><div className="layer-detail"><small>LEVEL {level + 1} / 4</small><h3>{l.subject}</h3><p>{l.detail}</p><blockquote>{l.question}</blockquote><p><b>残す情報：</b>{l.output}</p><Go site="workflow" page={l.target}>この階層を詳しく分析</Go></div></div></Panel>
    <Panel title="すべての判断でAI化の可能性を評価する"><p>評価することと、AIに任せることは別の判断です。根拠・例外・人の責任を確認して役割を選びます。</p><div className="role-legend">{[["人のみ", "人が判断・実行"], ["人＋AI", "AIが支援し、人が判断"], ["AI主体", "AIが進め、人が監督・例外対応"], ["完全自動化", "定義した範囲を自動実行"]].map(([a, b]) => <div key={a}><strong>{a}</strong><small>{b}</small></div>)}</div><div className="role-assignments">{tasks.map(([task, reason], i) => <label key={task}><div><strong>{task}</strong><small>{reason}</small></div><select aria-label={`${task}の役割`} value={roles[i]} onChange={e => setRoles(roles.map((r, j) => j === i ? e.target.value : r))}>{roleModes.map(r => <option key={r}>{r}</option>)}</select></label>)}</div><p className="activity-caption">選択は検討例として自動保存。実運用の可否判定ではありません。「完全自動化」にも適用範囲と停止・復旧条件が必要です。</p><Go site="workflow" page="export">改善候補をまとめてEGCへ</Go></Panel></div>;
}

const stages = ["妥当性確認", "担当組織確認", "実施可否判断", "実行", "効果確認"];
const initialCases = [
  { id: "EGC-024", name: "ホールドロット処置の判断支援", origin: "Workflow Mapper", route: "知的作業 / AI支援", stage: "実行", owner: "品質保証・佐藤", next: "同じ評価資料10件で確認工数と誤記を比較", due: "2026-09-30" },
  { id: "EGC-026", name: "空FOUP回収の自動化", origin: "現場からの直接提案", route: "物理作業 / Robot Project", stage: "担当組織確認", owner: "", next: "製造と物流で実行責任を決める", due: "2026-09-22" },
  { id: "EGC-027", name: "設備巡回と異常記録の連携", origin: "Supplier Engagement", route: "知的＋物理 / 統合", stage: "妥当性確認", owner: "装置保全・山本", next: "巡回の記録と異常判断を分けて棚卸し", due: "2026-09-25" },
];
function ExecutionTracker({ storageKey }) {
  const [cases, setCases] = useSaved(`${storageKey}:execution-v1`, initialCases);
  const [active, setActive] = useState(0);
  const item = cases[active];
  const update = (key, value) => setCases(cases.map((c, i) => i === active ? { ...c, [key]: value } : c));
  const incomplete = cases.filter(c => !c.owner.trim() || !c.next.trim() || !c.due).length;
  return <div className="activity-content"><Panel title="提案を忘れず、次の一歩を持たせる"><div className="activity-feedback"><span>受付：現場・業務分析・外部技術から</span>{stages.map(s => <span key={s}>{s}</span>)}</div><p>AI支援・ロボット・通常の業務改善を同じ入口で受け付けます。実行手段を選び、効果を確かめて標準化へ。</p><p className="tracker-status" role="status">{incomplete ? `担当・次の行動・期限に未設定がある案件：${incomplete}件` : "全案件に担当・次の行動・期限が設定されています"}</p><div className="case-tabs">{cases.map((c, i) => <button key={c.id} aria-pressed={active === i} className={active === i ? "selected" : ""} onClick={() => setActive(i)}><small>{c.id} · {c.stage}</small><strong>{c.name}</strong><span>{c.owner || "担当未設定"}</span></button>)}</div></Panel>
    <Panel title={`${item.id} — ${item.name}`}><p>{item.origin} → EGC → {item.route}</p><div className="activity-form-grid"><label className="activity-field">現在の段階<select value={item.stage} onChange={e => update("stage", e.target.value)}>{stages.map(s => <option key={s}>{s}</option>)}</select></label><label className="activity-field">担当組織・責任者<input value={item.owner} placeholder="担当を設定" onChange={e => update("owner", e.target.value)} /></label><label className="activity-field">次の確認期限<input type="date" value={item.due} onChange={e => update("due", e.target.value)} /></label><label className="activity-field wide">次の行動<textarea rows={2} value={item.next} onChange={e => update("next", e.target.value)} /></label></div><p className="activity-caption">このページのサンプル案件は独立した検討用台帳です。編集は自動保存されます。段階の選択は正式承認や他ページの案件更新を行いません。</p><div className="activity-feedback"><Go site="egc" page="approval">実施可否の根拠を確認</Go><Go site="egc" page="measurement">改善前後を測定</Go><Go site="supplier" page="solutions">外部技術を探索</Go><Go site="robot" page="portfolio">物理作業の実装候補</Go></div></Panel></div>;
}

const qbrSteps = [
  ["Strategy", "重点課題", "サブファブ巡回の記録負荷を減らす", "challenges"],
  ["Solution List", "技術の収集", "巡回・画像読取・異常検知の候補を整理", "solutions"],
  ["Benchmark", "同じ条件で比較", "暗所・反射・通信断を含む共通条件", "comparison"],
  ["Scoring", "根拠を添えて評価", "性能・接続性・運用性・展開性で評価", "weighted-selection"],
  ["QBR", "四半期の判断", "不足する根拠と、次の実証・担当を合意", "meetings"],
];
function TechnologyQbr({ storageKey }) {
  const [state, setState] = useSaved(`${storageKey}:qbr-v1`, { decision: "追加検証", owner: "装置保全・山本", due: "2026-10-01", evidence: "暗所での計器読み取り結果が不足。共通の画像セットで追加比較する。", checked: [true, true, false, false] });
  const update = (key, value) => setState({ ...state, [key]: value });
  const evidenceItems = ["重点課題と対象業務が一致", "候補を同じ条件で比較", "評価点の根拠を確認", "PoCの成功条件と担当を合意"];
  const ready = state.checked.every(Boolean);
  return <div className="activity-content"><Panel title="外部の知識を、実証できる仮説に変える"><p>パートナーと生産性向上を共創するために、探索から展開までの共通言語を揃えます。QBRは四半期ごとに成果・課題・次の行動を見直す場です。</p><div className="qbr-chain">{qbrSteps.map(([en, jp, example, target]) => <a href={link("supplier", target)} key={en}><small>{en}</small><strong>{jp}</strong><span>{example}</span><ArrowUpRight size={15} /></a>)}</div></Panel>
    <Panel title="QBR 検討メモ：設備巡回の省力化"><div className="activity-form-grid"><div className="qbr-checks">{evidenceItems.map((x, i) => <label key={x}><input type="checkbox" checked={state.checked[i]} onChange={e => update("checked", state.checked.map((v, j) => i === j ? e.target.checked : v))} />{x}</label>)}</div><div><label className="activity-field">次の方針<select value={state.decision} onChange={e => update("decision", e.target.value)}>{["追加検証", "PoCへ進む", "保留", "終了"].map(x => <option key={x}>{x}</option>)}</select></label><p role="status" className="tracker-status">{ready ? "確認項目が揃いました。検討理由と次の担当を記録してください。" : "未確認の根拠があります。次の検証内容を明確にしてください。"}</p></div><label className="activity-field">次の担当<input value={state.owner} onChange={e => update("owner", e.target.value)} /></label><label className="activity-field">次回確認日<input type="date" value={state.due} onChange={e => update("due", e.target.value)} /></label><label className="activity-field wide">判断理由・次に集める根拠<textarea rows={3} value={state.evidence} onChange={e => update("evidence", e.target.value)} /></label></div><p className="activity-caption">ブラウザに自動保存する検討メモです。正式な採用判定は、実証の根拠を確認する段階で行います。</p><div className="activity-feedback"><Go site="supplier" page="poc">PoCを設計</Go><Go site="supplier" page="decision">採用判定の根拠を確認</Go><Go site="supplier" page="scale">標準化・横展開を準備</Go></div></Panel></div>;
}

function AutomationAtlas() {
  const [active, setActive] = useState(0);
  const domain = robotDomains[active];
  return <div className="activity-content"><Panel title="どの作業を、どの技術で変えるか。"><p>単一の機体導入にとどまらず、技術ごとの適用範囲・実証・ROI・ロードマップを揃えて判断します。図中の番号、または下の領域を選べます。</p><figure className="automation-figure"><div className="automation-image"><img src={`${import.meta.env.BASE_URL}images/semiconductor-automation.png`} alt="半導体工場の概念イラスト。左手前にFOUPを運ぶAMR、右手前にトレイを扱う協働ロボット、左奥に四足歩行の巡回機、中央奥に自動倉庫、右上に天井搬送。" width="1536" height="1024" />{robotDomains.map((d, i) => <button key={d.name} style={{ left: `${d.point[0]}%`, top: `${d.point[1]}%` }} className={`map-pin ${active === i ? "selected" : ""}`} aria-label={`${i + 1} ${d.name}を表示`} aria-pressed={active === i} onClick={() => setActive(i)}>{i + 1}</button>)}</div><figcaption>AI生成の概念イラスト。実在の工場・導入実績・設備配置を示すものではありません。</figcaption></figure><div className="domain-tabs">{robotDomains.map((d, i) => <button key={d.name} className={active === i ? "selected" : ""} aria-pressed={active === i} onClick={() => setActive(i)}><small>0{i + 1} · {d.position}</small><strong>{d.name}</strong><span>{d.jp}</span></button>)}</div></Panel>
    <Panel title={`${domain.name} — ${domain.work}`}><div className="activity-three"><div><small>現場での適用例</small><p>{domain.example}</p></div><div><small>実証で見ること</small><p>{domain.check}</p></div><div><small>次の検討</small><Go site="robot" page={domain.route}>具体的な条件を検討</Go><br /><Go site="robot" page="roi">投資回収を試算</Go></div></div></Panel>
    <Panel title="判断支援と物理作業を、ひとつの業務へ。"><div className="intelligence-bridge"><div><small>知的作業 / Agentic AI・Copilot</small><h3>記録を読み、異常候補を整理</h3><p>根拠を添えて担当者の判断を支援する。</p><Go site="workflow" page="templates">Workflow Mapperで役割を評価</Go></div><span className="bridge-plus">＋</span><div><small>物理作業 / Robot Project</small><h3>巡回し、計器や熱画像を収集</h3><p>移動・撮影・搬送を実行し、現場負荷を減らす。</p><Go site="robot" page="rollout">実証から拠点展開へ</Go></div></div><p className="activity-caption">組み合わせ例：ロボットが記録 → AIが異常候補を整理 → 保全担当が判断 → 対応結果を次の改善に活用。ロボット制御やAIの実行機能はこのデモにはありません。</p></Panel></div>;
}

export const activityComponents = { "adoption-support": AdoptionSupport, "workflow-layers": WorkflowLayers, "execution-tracker": ExecutionTracker, "technology-qbr": TechnologyQbr, "automation-atlas": AutomationAtlas };
export const activityUsage = { "adoption-support": "4つの障壁を選び、支援策と確認方法を見て、チームの支援メモを残す。", "workflow-layers": "階層を切り替えて業務の深さを確認。4つの役割区分を選んで検討する。", "execution-tracker": "案件を選び、担当・段階・次の行動・期限を編集。未設定を見つける。", "technology-qbr": "根拠の確認状態と次の方針を選び、担当・確認日・検討理由を残す。", "automation-atlas": "図の番号を選び、対象作業・実証の観点・次の検討先を確認する。" };
