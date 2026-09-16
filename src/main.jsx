import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Menu,
  Layers,
  Sparkles,
  Bot,
  Handshake,
  Workflow,
  Lightbulb,
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarDays,
  ChartNoAxesCombined,
  GitBranch,
  SlidersHorizontal,
  FileText,
  ClipboardCheck,
  Calculator,
  MessageSquare,
  Target,
  Download,
  ExternalLink,
  Bookmark,
  Copy,
  RotateCcw,
  MoveUpRight,
  Compass,
  CheckCheck,
  Battery,
  MapPin,
  ShieldCheck,
  Info,
  Star,
  Send,
  Activity,
  Grip,
  PanelLeftClose,
} from "lucide-react";
import { sites, allPages, sources } from "./data";
import { useSaved, pageSnapshot, hasStorageError } from "./storage";
import { advancedComponents, advancedUsage, ResearchNote } from "./advanced";
import { frontierComponents, frontierUsage } from "./frontier";
import { ActivityMap, activityComponents, activityUsage } from "./activity";
import { KnowledgeEntrances, knowledgeComponents, knowledgeUsage } from "./knowledge";
import "./knowledge.css";
import { VisualGuide, VisualGuideShelf, VisualGuideGallery } from "./visual-guides";
import "./visual-guides.css";
import "./activity.css";
import "./style.css";
import "./advanced.css";
import "./frontier.css";

const icons = { Sparkles, Bot, Handshake, Workflow, Lightbulb };
const pageIcons = {
  dashboard: LayoutDashboard,
  learning: BookOpen,
  catalog: Layers,
  stories: FileText,
  people: Users,
  events: CalendarDays,
  booking: CalendarDays,
  assessment: SlidersHorizontal,
  analytics: ChartNoAxesCombined,
  checklist: ClipboardCheck,
  compare: Layers,
  feed: MessageSquare,
  matrix: Grip,
  calculator: Calculator,
  playbook: BookOpen,
  form: Plus,
  recognition: Star,
  report: FileText,
  fleet: Bot,
  board: GitBranch,
  flow: Workflow,
  experiment: Target,
  timeline: Clock,
  table: Layers,
  review: ShieldCheck,
  radar: Compass,
  raci: Users,
  handoff: ArrowUpRight,
  a3: FileText,
  editor: FileText,
  modelcalc: Calculator,
  benchmark: SlidersHorizontal,
  cohort: ChartNoAxesCombined,
  scenario: Target,
  quiz: ClipboardCheck,
  redaction: ShieldCheck,
  scheduler: Clock,
  risk: ShieldCheck,
  evidence: CheckCheck,
  weighted: SlidersHorizontal,
  logaudit: Search,
  variants: GitBranch,
  valuestream: Workflow,
  rules: GitBranch,
  control: Activity,
  ledger: Layers,
  chain: GitBranch,
  journey: MapPin,
  ladder: Layers,
  tree: GitBranch,
  spaced: CalendarDays,
  pairing: Users,
  claims: CheckCheck,
  editdiff: FileText,
  pathbuilder: BookOpen,
  calibration: Target,
  andon: Activity,
  zone: ShieldCheck,
  canary: GitBranch,
  hierarchy: Layers,
  replay: Clock,
  waterfall: ChartNoAxesCombined,
  queue: Activity,
  heatmap: Grip,
  envelope: Battery,
  yamazumi: ChartNoAxesCombined,
  premortem: Target,
  quadrant: Grip,
  triangulate: CheckCheck,
  concentration: ChartNoAxesCombined,
  split: SlidersHorizontal,
  bipartite: Workflow,
  brieflint: FileText,
  samplesize: Calculator,
  pricing: Calculator,
  milestonepay: Clock,
  sipoc: Layers,
  spaghetti: MapPin,
  heijunka: ChartNoAxesCombined,
  busfactor: Users,
  daylog: Clock,
  fieldaudit: ClipboardCheck,
  approvals: CheckCheck,
  conformance: Search,
  blueprint: Workflow,
  terms: MessageSquare,
  kano: SlidersHorizontal,
  flowlaw: Activity,
  pokayoke: ShieldCheck,
  catchball: MessageSquare,
  cd3: Calculator,
  changeload: CalendarDays,
  dedupe: Search,
  alignment: Users,
  issuetree: GitBranch,
  sla: Clock,
};
const href = (site, page = "overview") => `#/${site}/${page}`;
function getRoute() {
  const [, s, p] = location.hash.split("/");
  return {
    site: sites.find((x) => x.id === s) || sites[0],
    page: p || "overview",
  };
}
const number = (n) =>
  new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 }).format(n);
function download(name, text, type = "text/plain;charset=utf-8") {
  // BOMはExcel向けのCSV/テキストのみ。JSONに付けるとRFC 8259違反でパーサが拒否することがある。
  const bom = type.startsWith("application/json") ? "" : "\uFEFF";
  const u = URL.createObjectURL(new Blob([bom + text], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function Badge({ children, tone = "" }) {
  return <span className={"badge " + tone}>{children}</span>;
}
function Icon({ name, ...props }) {
  const I = icons[name] || Layers;
  return <I {...props} />;
}
function App() {
  const [route, setRoute] = useState(getRoute);
  const [menu, setMenu] = useState(false);
  const [siteMenu, setSiteMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    const handle = () => setStorageWarning(true);
    window.addEventListener("forward-storage-error", handle);
    if (hasStorageError()) handle();
    return () => window.removeEventListener("forward-storage-error", handle);
  }, []);
  const site = route.site,
    page = site.pages.find((p) => p.id === route.page) || site.pages[0];
  useEffect(() => {
    function change() {
      setRoute(getRoute());
      setMenu(false);
      setSiteMenu(false);
      setSearchOpen(false);
      setSearch("");
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = `${page.title} · ${site.name} | FORWARD`;
    const nav = document.querySelector(".sidebar nav"),
      active = nav?.querySelector('[aria-current="page"]');
    if (nav && active) {
      const n = nav.getBoundingClientRect(),
        r = active.getBoundingClientRect();
      if (r.top < n.top || r.bottom > n.bottom)
        nav.scrollTop += r.top - n.top - 18;
    }
  }, [site, page]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    function keys(e) {
      if (e.key === "Escape") {
        setModal(null);
        setSearchOpen(false);
        setSiteMenu(false);
        setMenu(false);
      }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);
  function notify(s) {
    setToast(s);
  }
  const matches = allPages.filter((p) =>
    (p.title + " " + p.description + " " + p.siteName)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div
      className="app"
      style={{ "--accent": site.color, "--soft": site.soft }}
    >
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main").focus();
          document.getElementById("main").scrollIntoView();
        }}
      >
        本文へ移動
      </a>
      {menu && (
        <button
          className="scrim"
          aria-label="メニューを閉じる"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <a className="brand" href={href("gain")}>
          <span className="brand-mark">
            F<span>↗</span>
          </span>
          <span>
            FORWARD<small>TRANSFORMATION WORKSPACE</small>
          </span>
        </a>
        <div className="switcher-wrap">
          <button
            className="site-switcher"
            onClick={() => setSiteMenu(!siteMenu)}
            aria-expanded={siteMenu}
          >
            <span className="site-symbol">
              <Icon name={site.icon} size={21} />
            </span>
            <span>
              <small>YOUR WORKSPACE</small>
              <strong>{site.name}</strong>
            </span>
            <ChevronDown size={16} />
          </button>
          {siteMenu && (
            <div className="site-dropdown">
              {sites.map((s) => (
                <a key={s.id} href={href(s.id)}>
                  <Icon name={s.icon} size={19} />
                  <span>{s.name}</span>
                  {s.id === site.id && <Check size={16} />}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="nav-heading">
          WORKSPACE <span>{site.pages.length} PAGES</span>
        </div>
        <nav aria-label={`${site.name}のページ`}>
          {site.pages.map((p) => {
            const I = pageIcons[p.type] || FileText;
            return (
              <React.Fragment key={p.id}>
                <a
                  className={"nav-item " + (page.id === p.id ? "active" : "")}
                  href={href(site.id, p.id)}
                  aria-current={page.id === p.id ? "page" : undefined}
                >
                  <I size={17} />
                  <span>{p.title}</span>
                  {page.id === p.id && <span className="nav-dot" />}
                </a>
              </React.Fragment>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setModal("visual-guides")}>
            <Layers size={17} />画像で見るガイド<span>16</span>
          </button>
          <button onClick={() => setModal("directory")}>
            <Compass size={17} />
            5つのワークスペース<span>{allPages.length}</span>
          </button>
          <button onClick={() => setModal("sources")}>
            <BookOpen size={17} />
            設計の参考・このデモについて
          </button>
          <div className="user">
            <span className="avatar">ST</span>
            <span>
              田中 翔太<small>Transformation Team</small>
            </span>
            <Badge>DEMO</Badge>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMenu(true)}
              aria-label="メニューを開く"
            >
              <Menu size={21} />
            </button>
            <span>ワークスペース</span>
            <ChevronRight size={14} />
            <strong>{site.name}</strong>
          </div>
          <div className="top-actions">
            <div className="search-wrap">
              <Search size={17} />
              <input
                aria-label={`${allPages.length}ページから検索`}
                placeholder="ページを検索…"
                value={search}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="search-hint">{allPages.length}</span>
              {searchOpen && (
                <div className="search-results">
                  <div className="search-result-heading">
                    {search
                      ? `${matches.length}件のページ`
                      : "ワークスペースを横断して検索"}
                  </div>
                  {(search ? matches : matches.slice(0, 20)).map((p) => (
                    <a key={p.siteId + p.id} href={href(p.siteId, p.id)}>
                      <span>
                        {p.title}
                        <small>{p.siteName}</small>
                      </span>
                      <ArrowUpRight size={16} />
                    </a>
                  ))}
                  {!matches.length && <p>一致するページがありません。</p>}
                  <button onClick={() => setSearchOpen(false)}>閉じる</button>
                </div>
              )}
            </div>
            <span className="demo-pill">
              <span />
              {page.type === "knowledge-news" ? "公式情報と活用仮説" : "サンプルデータ"}
            </span>
            <span className="avatar small-avatar">ST</span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {site.label}
                <span>
                  {" "}
                  / {String(site.pages.indexOf(page) + 1).padStart(2, "0")}
                </span>
              </div>
              <h1>{page.title}</h1>
              <p>{page.description}</p>
            </div>
            <div className="heading-actions">
              <span className="date-label">
                <CalendarDays size={15} />
                2026年9月17日
              </span>
              <button
                className="button secondary compact"
                onClick={() => {
                  try {
                    download(
                      `${site.id}-${page.id}.json`,
                      JSON.stringify(pageSnapshot(site, page), null, 2),
                      "application/json",
                    );
                    notify(
                      "初期データと保存済みの編集記録を書き出しました（未保存の入力は対象外）",
                    );
                  } catch {
                    notify(
                      "記録を読み出せませんでした。ブラウザの保存設定を確認してください。",
                    );
                  }
                }}
              >
                <Download size={15} />
                保存済み記録を書き出す
              </button>
            </div>
          </div>
          {storageWarning && (
            <div className="notice warning" role="alert">
              <Info size={20} />
              <span>
                ブラウザへの保存に失敗しました。現在の操作は画面に反映されますが、再読み込み後に残らない場合があります。保存容量・設定を確認してください。
              </span>
            </div>
          )}
          <Page
            key={site.id + "/" + page.id}
            site={site}
            page={page}
            notify={notify}
          />
          <footer>
            <span>
              <span className="footer-mark">F↗</span> FORWARD{" "}
              <span className="footer-sep">/</span> {site.name}
            </span>
            <span>{page.type === "knowledge-news" ? "ニュースは公式情報を参照 · 活用案は仮説 · 入力はブラウザ内保存" : "架空のデモデータ · 入力内容はこのブラウザにのみ保存"}</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal === "visual-guides" ? "画像で見る、16の業務ガイド" : modal === "directory"
              ? "5つのワークスペース"
              : "設計の参考・デモについて"
          }
          onClose={() => setModal(null)}
        >
          {modal === "visual-guides" ? <VisualGuideGallery onChoose={() => setModal(null)} /> : modal === "directory" ? (
            <>
              <p>
                人材・文化、業務理解、改善管理、外部技術、現場実装。
                必要な活動を組み合わせ、成果と学びを次の改善へ戻します。
              </p>
              <div className="directory-grid">
                {sites.map((s) => (
                  <a
                    href={href(s.id)}
                    key={s.id}
                    onClick={() => setModal(null)}
                    style={{ "--accent": s.color, "--soft": s.soft }}
                  >
                    <span className="site-symbol">
                      <Icon name={s.icon} />
                    </span>
                    <h3>{s.name}</h3>
                    <p>{s.short}</p>
                    <span>
                      {s.pages.length}ページ <ArrowRight size={15} />
                    </span>
                  </a>
                ))}
              </div>
              <h3>全{allPages.length}ページの一覧</h3>
              {sites.map((s) => (
                <details key={s.id}>
                  <summary>
                    {s.name} · {s.pages.length}ページ
                  </summary>
                  <div className="page-directory">
                    {s.pages.map((p) => (
                      <a
                        href={href(s.id, p.id)}
                        onClick={() => setModal(null)}
                        key={p.id}
                      >
                        {p.title}
                        <ArrowUpRight size={14} />
                      </a>
                    ))}
                  </div>
                </details>
              ))}
            </>
          ) : (
            <>
              <p>
                公開されている実践例と、提供された説明資料を参考にした業務用プロトタイプです。実在の社内システムを再現したものではありません。
              </p>
              <div className="notice">
                <Info size={20} />
                <div>
                  企業・人物・製品・数値はすべて架空の例です。AI生成、機体制御、メール送信、外部システム連携は実行しません。入力・予約・判定は、このブラウザ内のデモ記録として保存されます。
                </div>
              </div>
              {sources.map((s) => (
                <a
                  className="source"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  key={s.url}
                >
                  <div>
                    <h3>
                      {s.name}
                      <ExternalLink size={15} />
                    </h3>
                    <p>{s.use}</p>
                  </div>
                </a>
              ))}
              <p className="muted">
                参照日：2026年9月16日。掲載データは出典の実績値ではなく、画面用途を伝えるために独自に作成しています。添付画像の社内URL・実データは掲載していません。
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  const ref = React.useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current.showModal();
    return () => {
      prev?.focus?.();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="閉じる">
          <X />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
function Section({ title, aside, children, className = "" }) {
  return (
    <section className={"panel " + className}>
      <div className="section-header">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
function Progress({ value }) {
  return (
    <div className="progress">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
function Dashboard({ site, page }) {
  const suggestions = site.pages
    .filter((p) =>
      ["catalog", "flow", "form", "experiment", "calculator"].includes(p.type),
    )
    .slice(0, 3);
  const chart = {
    gain: [124, 155, 180, 214, 235, 260, 287, 310, 330, 365, 398, 428],
    robot: [88, 89, 90, 89.5, 91, 92, 91.4, 93, 92, 92.8, 93.5, 94.2],
    supplier: [18, 19, 20, 21, 23, 24, 25, 26, 27, 29, 30, 32],
    workflow: [6, 9, 12, 16, 18, 23, 27, 32, 36, 40, 44, 48],
    egc: [12, 16, 21, 24, 28, 32, 39, 44, 49, 55, 61, 68],
  }[site.id];
  const chartMax = {
    gain: 500,
    robot: 100,
    supplier: 40,
    workflow: 60,
    egc: 80,
  }[site.id];
  const labels = {
    gain: ["週次アクティブユーザー", "428", "人", "前月比 +9.7%"],
    robot: ["週間稼働率", "94.2", "%", "前週比 +1.4pt"],
    supplier: ["共創パートナーの広がり", "32", "社", "前四半期比 +5社"],
    workflow: ["業務可視化の進捗", "48", "業務", "今月 +8業務"],
    egc: ["累計の改善実行数", "68", "件", "今月 +9件"],
  }[site.id];
  const next =
    site.id === "workflow"
      ? {
          id: "validation",
          type: "events",
          items: [
            [
              "22",
              "SEP",
              "夜間ホールド処置フローの現場レビュー",
              "15:00–16:00 / プロセス技術チーム",
            ],
          ],
        }
      : site.pages.find((p) => p.type === "events" || p.type === "timeline");
  return (
    <>
      <div className="hero-grid">
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span /> BUILD WHAT'S NEXT
            </div>
            <h2>
              {page.headline.split("\n").map((l, i) => (
                <React.Fragment key={i}>
                  {l}
                  <br />
                </React.Fragment>
              ))}
            </h2>
            <p>{page.focus}</p>
            <a className="button hero-button" href={href(site.id, page.target)}>
              {page.cta}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="hero-graphic" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="graphic-core">
              <Icon name={site.icon} size={52} />
            </div>
            <span className="orbit-label label-one">LEARN</span>
            <span className="orbit-label label-two">CONNECT</span>
            <span className="orbit-label label-three">TRANSFORM</span>
            <span className="orbit-node node-one" />
            <span className="orbit-node node-two" />
            <span className="orbit-node node-three" />
          </div>
        </section>
        <section className="focus-card">
          <div className="focus-label">
            <span>YOUR NEXT STEP</span>
            <ArrowUpRight size={18} />
          </div>
          <span className="focus-count">
            01<span> / 03</span>
          </span>
          <h2>
            {site.id === "gain"
              ? "学びを、ひとつ先へ。"
              : site.id === "robot"
                ? "現場の準備を、確実に。"
                : site.id === "supplier"
                  ? "問いから、共創を。"
                  : site.id === "workflow"
                    ? "判断の理由を、見える形に。"
                    : "気づきを、実行につなぐ。"}
          </h2>
          <p>{suggestions[0].description}</p>
          <a href={href(site.id, suggestions[0].id)}>
            {suggestions[0].title}
            <ArrowRight size={18} />
          </a>
        </section>
      </div>
      <ActivityMap site={site} />
      <KnowledgeEntrances site={site} />
      <VisualGuideShelf site={site} />
      <div className="metrics">
        {site.metrics.map(([label, value, unit, note], i) => (
          <section className="metric" key={label}>
            <div className="metric-label">
              {label}
              <span>0{i + 1}</span>
            </div>
            <div className="metric-value">
              {value}
              <small>{unit}</small>
            </div>
            <div className="metric-note">
              <span className="metric-line" />
              {note}
            </div>
          </section>
        ))}
      </div>
      <section className="deep-dive-launch">
        <div>
          <span className="eyebrow">FIELD-TESTED METHODS</span>
          <h2>現場の型と数理を、手を動かして学ぶ。</h2>
          <p>
            リーン・品質工学・安全・ソフトウェア運用の定石を、この仕事に当てはめた10ページ。
          </p>
        </div>
        <div className="deep-dive-links">
          {site.pages
            .filter((p) => p.wave === 3)
            .map((p) => (
              <a key={p.id} href={href(site.id, p.id)}>
                {p.title}
                <ArrowUpRight size={14} />
              </a>
            ))}
        </div>
      </section>
      <section className="deep-dive-launch secondary">
        <div>
          <span className="eyebrow">DEEPER PERSPECTIVES</span>
          <h2>次の判断を、もう一段深く。</h2>
          <p>根拠・例外・実現条件まで確認する10のページ。</p>
        </div>
        <div className="deep-dive-links">
          {site.pages
            .filter((p) => p.wave === 2)
            .map((p) => (
              <a key={p.id} href={href(site.id, p.id)}>
                {p.title}
                <ArrowUpRight size={14} />
              </a>
            ))}
        </div>
      </section>
      <div className="dashboard-grid">
        <Section title={labels[0]} aside={<Badge>直近12週間</Badge>}>
          <div className="chart-stat">
            <strong>
              {labels[1]}
              <small>{labels[2]}</small>
            </strong>
            <span>
              <MoveUpRight size={15} />
              {labels[3]}
            </span>
          </div>
          <div
            className="chart"
            role="img"
            aria-label={`${labels[0]}。12週間の推移。最新${labels[1]}${labels[2]}`}
          >
            <div className="chart-y">
              <span>
                {chartMax}
                {site.id === "robot" ? "%" : ""}
              </span>
              <span>{chartMax / 2}</span>
              <span>0</span>
            </div>
            <div className="chart-plot">
              <div className="chart-lines">
                <i />
                <i />
                <i />
              </div>
              <svg viewBox="0 0 660 145" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--accent)"
                      stopOpacity=".18"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--accent)"
                      stopOpacity=".01"
                    />
                  </linearGradient>
                </defs>
                <path
                  d={`M0 145 ${chart.map((n, i) => `L${i * 60} ${145 - (n / chartMax) * 145}`).join(" ")} L660 145 Z`}
                  fill="url(#chartFill)"
                />
                <polyline
                  points={chart
                    .map((n, i) => `${i * 60},${145 - (n / chartMax) * 145}`)
                    .join(" ")}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
                {chart.map((n, i) => (
                  <circle
                    key={i}
                    cx={i * 60}
                    cy={145 - (n / chartMax) * 145}
                    r={i === 11 ? 5 : 0}
                    fill="var(--accent)"
                  />
                ))}
              </svg>
              <div className="chart-x">
                <span>6月29日</span>
                <span>7月27日</span>
                <span>8月24日</span>
                <span>9月14日</span>
              </div>
            </div>
          </div>
          <a
            className="text-link"
            href={href(
              site.id,
              site.pages.find(
                (p) => p.type === "analytics" || p.type === "radar",
              ).id,
            )}
          >
            詳しい分析を見る
            <ArrowRight size={15} />
          </a>
        </Section>
        <Section title="次の予定" aside={<CalendarDays size={18} />}>
          <div className="next-date">
            <strong>
              {next.type === "events"
                ? next.items[0][0]
                : next.items[0][0].replace("9/", "")}
            </strong>
            <span>
              SEP
              <br />
              2026
            </span>
          </div>
          <h3 className="next-title">
            {next.type === "events" ? next.items[0][2] : next.items[0][1]}
          </h3>
          <p className="muted">
            {next.type === "events" ? next.items[0][3] : next.items[0][2]}
          </p>
          <div className="avatar-stack">
            <span>AS</span>
            <span>KY</span>
            <span>MS</span>
            <small>チームで次の一歩を</small>
          </div>
          <a className="button secondary full" href={href(site.id, next.id)}>
            予定を確認
            <ArrowUpRight size={16} />
          </a>
        </Section>
      </div>
      <div className="section-title-row">
        <div>
          <div className="eyebrow">EXPLORE & TAKE ACTION</div>
          <h2>ここから、動き出す。</h2>
        </div>
        <a className="text-link" href={href(site.id, "impact")}>
          成果レポート
          <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="action-cards">
        {suggestions.map((p, i) => {
          const I = pageIcons[p.type];
          return (
            <a href={href(site.id, p.id)} key={p.id} className="action-card">
              <div className="action-icon">
                <I size={23} />
                <span>0{i + 1}</span>
              </div>
              <h3>
                {p.title}
                <ArrowUpRight size={19} />
              </h3>
              <p>{p.description}</p>
            </a>
          );
        })}
      </div>
      <Section
        title="ワークスペースの動き"
        className="activity-panel"
        aside={<Badge>今週</Badge>}
      >
        {page.activity.map((a, i) => (
          <div className="activity-row" key={a}>
            <span className="activity-icon">
              <CheckCircle2 size={17} />
            </span>
            <span>{a}</span>
            <small>{["今日 09:30", "昨日 16:20", "9/14 11:00"][i]}</small>
          </div>
        ))}
      </Section>
      <div className="connected">
        <div>
          <Workflow size={24} />
          <span>
            <strong>ひとつの変化を、次の取り組みへ。</strong>
            <small>
              5つのワークスペースが、業務変革のサイクルをつなぎます。
            </small>
          </span>
        </div>
        <div>
          {["gain", "workflow", "egc", "supplier", "robot"].map((id) => (
            <a
              key={id}
              href={href(id)}
              className={site.id === id ? "current" : ""}
            >
              {sites.find((s) => s.id === id).name}
              <ChevronRight size={13} />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

function Page({ site, page, notify }) {
  const key = `${site.id}/${page.id}`;
  if (page.type === "dashboard") return <Dashboard site={site} page={page} />;
  const props = { page, site, storageKey: key, notify };
  const Components = {
    ...advancedComponents,
    ...frontierComponents,
    ...activityComponents,
    ...knowledgeComponents,
    catalog: Catalog,
    stories: Stories,
    people: People,
    events: Events,
    booking: Booking,
    learning: Learning,
    editor: Editor,
    assessment: Assessment,
    checklist: Checklist,
    calculator: Calc,
    analytics: Analytics,
    table: DataTable,
    compare: Compare,
    matrix: Matrix,
    raci: Matrix,
    form: Form,
    handoff: Form,
    feed: Feed,
    recognition: Recognition,
    report: Report,
    fleet: Fleet,
    board: Board,
    flow: Flow,
    experiment: Experiment,
    timeline: Timeline,
    review: Review,
    radar: Radar,
    playbook: Playbook,
    a3: A3,
  };
  const Component = Components[page.type];
  return (
    <>
      <VisualGuide site={site} page={page} />
      <div className="usage" id="page-workbench" tabIndex={-1}>
        <span className="usage-icon">
          <Compass size={18} />
        </span>
        <span>
          <strong>このページで試す</strong>
          {
            {
              ...advancedUsage,
              ...frontierUsage,
              ...activityUsage,
              ...knowledgeUsage,
              catalog: "カードを開き、内容を確認して保存。",
              stories: "事例を開き、再現するときの条件を確認。",
              people: "担当者の専門を確認し、相談メモを保存。",
              events: "参加したい回を選び、デモ参加登録。",
              booking: "相談枠を選び、具体的な課題を添えて予約。",
              learning: "教材を開き、実践した内容を完了に。",
              editor: "指示を編集して保存。出力例と照らし合わせる。",
              assessment: "1〜5で評価して、チームの現在地を確認。",
              checklist: "確認できた項目にチェック。進捗は自動保存。",
              calculator: "数値を変えると、結果をその場で再計算。",
              analytics: "要因別の数値と内訳を確認し、データを出力。",
              table: "キーワードで絞り込み、一覧をCSVに保存。",
              compare: "列ごとの条件を比べ、候補を選択。",
              matrix: "セルを選び、評価を編集。",
              raci: "セルを選び、責任分担を変更。",
              form: "入力済みの例を書き換えて、ブラウザ内に保存。",
              handoff: "内容を確認して、EGCの提案へ引き継ぐ。",
              feed: "気づきを入力して、デモの会話に追加。",
              recognition: "貢献に拍手を送り、仲間の実践を称える。",
              report: "結果と次のアクションを確認し、レポートを保存。",
              fleet: "機体を選び、直近の状態と対応を確認。",
              board: "案件の移動先を選択して、次の段階へ進める。",
              flow: "各ステップを選び、条件と判断を確認。",
              experiment: "測定値を編集し、評価メモを記録。",
              timeline: "マイルストーンの完了を記録。",
              review: "根拠と未解決事項を確認して、判定を記録。",
              radar: "案件を選び、評価の理由を確認。",
              playbook: "手順を開き、実践済みのステップを記録。",
              a3: "各欄を編集し、改善の筋道を1枚にまとめる。",
            }[page.type]
          }
        </span>
      </div>
      {frontierComponents[page.type] ? (
        <div className="frontier">
          <Component {...props} />
        </div>
      ) : (
        <Component {...props} />
      )}
      {page.advanced && page.note && !advancedComponents[page.type] && !frontierComponents[page.type] && (
        <div className="notice">
          <Info size={18} />
          <span>{page.note}</span>
        </div>
      )}
      {page.advanced && <ResearchNote page={page} site={site} />}
    </>
  );
}

function Catalog({ page, storageKey, notify }) {
  const [filter, setFilter] = useState("すべて");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useSaved(storageKey + ":saved", []);
  const categories = ["すべて", ...new Set(page.items.map((i) => i[1]))];
  return (
    <>
      <div className="toolbar">
        <div className="tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={filter === c ? "selected" : ""}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <SearchBox value={query} onChange={setQuery} />
      </div>
      <div className="catalog-grid">
        {page.items
          .filter(
            (i) =>
              (filter === "すべて" || i[1] === filter) &&
              i.join(" ").includes(query),
          )
          .map((item, i) => (
            <button
              key={item[0]}
              className="catalog-card"
              onClick={() => setSelected(item)}
            >
              <div className="catalog-art">
                <span>{["Aa", "↗", "◎", "⌘"][i % 4]}</span>
                <div className="art-lines" />
                <span className="catalog-number">0{i + 1}</span>
              </div>
              <div className="catalog-body">
                <Badge>{item[1]}</Badge>
                {saved.includes(item[0]) && (
                  <Bookmark
                    className="saved-icon"
                    size={17}
                    fill="currentColor"
                  />
                )}
                <h2>{item[0]}</h2>
                <p>{item[2]}</p>
                <div className="card-bottom">
                  <span>{item[3]}</span>
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </button>
          ))}
      </div>
      {!page.items.some(
        (i) =>
          (filter === "すべて" || i[1] === filter) &&
          i.join(" ").includes(query),
      ) && <Empty />}
      {selected && (
        <Modal title={selected[0]} onClose={() => setSelected(null)}>
          <Badge>{selected[1]}</Badge>
          <p className="large-copy">{selected[2]}</p>
          <div className="notice">
            <Info size={20} />
            <span>
              利用前に対象業務の条件を確認し、小さな範囲で結果を検証してください。
              <br />
              {selected[3]}
            </span>
          </div>
          <div className="button-row">
            <button
              className="button"
              onClick={() => {
                setSaved(
                  saved.includes(selected[0])
                    ? saved.filter((s) => s !== selected[0])
                    : [...saved, selected[0]],
                );
                notify(
                  saved.includes(selected[0])
                    ? "保存を解除しました"
                    : "マイリストに保存しました",
                );
              }}
            >
              <Bookmark size={17} />
              {saved.includes(selected[0]) ? "保存を解除" : "保存する"}
            </button>
            <button
              className="button secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(selected[2]);
                  notify("本文をコピーしました");
                } catch {
                  notify(
                    "コピーできませんでした。本文を選択してコピーしてください",
                  );
                }
              }}
            >
              <Copy size={17} />
              本文をコピー
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function SearchBox({ value, onChange }) {
  return (
    <label className="inline-search">
      <Search size={17} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="キーワードで絞り込む"
        aria-label="一覧を絞り込む"
      />
    </label>
  );
}
function Empty() {
  return (
    <div className="empty">
      <Search size={28} />
      <h3>一致する項目がありません</h3>
      <p>検索語や絞り込み条件を変えてください。</p>
    </div>
  );
}
function Stories({ page, storageKey, notify }) {
  const [item, setItem] = useState(null);
  const [saved, setSaved] = useSaved(storageKey, []);
  return (
    <>
      <div className="story-grid">
        {page.items.map((r, i) => (
          <article key={r[0]} className="story">
            <div className="story-top">
              <span>FIELD NOTE / 0{i + 1}</span>
              <ArrowUpRight />
            </div>
            <div className="story-number">{r[2]}</div>
            <h2>{r[0]}</h2>
            <p>{r[3]}</p>
            <div className="story-footer">
              <span>{r[1]}</span>
              <button className="text-link" onClick={() => setItem(r)}>
                詳しく見る
                <ArrowRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {item && (
        <Modal title={item[0]} onClose={() => setItem(null)}>
          <div className="result-callout">{item[2]}</div>
          <h3>{page.storyHeading || "現場で実施したこと"}</h3>
          <p>{item[3]}</p>
          <h3>別のチームで試すなら</h3>
          <ol className="readable-list">
            {(
              page.guides?.[page.items.indexOf(item)] || [
                "対象の作業と測定する指標を揃える。",
                "例外条件を含めて小さく試す。",
                "改善前後の時間・品質を同じ条件で比較する。",
              ]
            ).map((guide) => (
              <li key={guide}>{guide}</li>
            ))}
          </ol>
          <p className="muted">{item[1]} · 架空の事例</p>
          <button
            className="button"
            onClick={() => {
              setSaved(
                saved.includes(item[0])
                  ? saved.filter((x) => x !== item[0])
                  : [...saved, item[0]],
              );
              notify("事例リストを更新しました");
            }}
          >
            <Bookmark size={17} />
            {saved.includes(item[0])
              ? "保存済み・解除する"
              : "あとで試すリストに保存"}
          </button>
        </Modal>
      )}
    </>
  );
}
function People({ page, storageKey, notify }) {
  const [person, setPerson] = useState(null);
  const [note, setNote] = useState(
    "実務で試すため、適用条件と最初の進め方を相談したい。",
  );
  const [requests, setRequests] = useSaved(storageKey, []);
  return (
    <>
      <div className="people-grid">
        {page.items.map((p, i) => (
          <article className="person panel" key={p[0]}>
            <span className={"person-avatar tone-" + i}>{p[4]}</span>
            <Badge>{p[1]}</Badge>
            <h2>{p[0]}</h2>
            <p>{p[2]}</p>
            <div className="person-time">
              <Clock size={15} />
              {p[3]}
            </div>
            <button
              className="button secondary full"
              onClick={() => setPerson(p)}
            >
              <MessageSquare size={16} />
              相談メモを作る
            </button>
          </article>
        ))}
      </div>
      {requests.length > 0 && (
        <Section title="保存した相談メモ">
          {requests.map((r, i) => (
            <div key={i} className="activity-row">
              <strong>{r.name}</strong>
              <span>{r.note}</span>
              <Badge>未送信</Badge>
            </div>
          ))}
        </Section>
      )}
      {person && (
        <Modal
          title={`${person[0]}への相談メモ`}
          onClose={() => setPerson(null)}
        >
          <label className="field">
            相談したいこと
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
            />
          </label>
          <p className="muted">
            ブラウザ内に保存します。相手への送信は行いません。
          </p>
          <button
            disabled={!note.trim()}
            className="button"
            onClick={() => {
              setRequests([...requests, { name: person[0], note }]);
              setPerson(null);
              notify("相談メモを保存しました（未送信）");
            }}
          >
            メモを保存
          </button>
        </Modal>
      )}
    </>
  );
}
function Events({ page, storageKey, notify }) {
  const [registered, setRegistered] = useSaved(storageKey, []);
  return (
    <div className="event-list">
      {page.items.map((r) => (
        <article key={r[2]} className="event panel">
          <div className="event-date">
            <small>{r[1]}</small>
            <strong>{r[0]}</strong>
          </div>
          <div className="event-detail">
            <Badge>参加型セッション</Badge>
            <h2>{r[2]}</h2>
            <p>
              <Clock size={16} />
              {r[3]}
            </p>
            <p>
              <Users size={16} />
              {r[4]}
              {registered.includes(r[2]) ? " + あなた" : ""}
            </p>
          </div>
          <button
            className={
              "button " + (registered.includes(r[2]) ? "secondary" : "")
            }
            onClick={() => {
              setRegistered(
                registered.includes(r[2])
                  ? registered.filter((x) => x !== r[2])
                  : [...registered, r[2]],
              );
              notify(
                registered.includes(r[2])
                  ? "デモ参加登録を取り消しました"
                  : "デモ参加登録を保存しました",
              );
            }}
          >
            {registered.includes(r[2]) ? (
              <>
                <Check size={17} />
                登録済み・取消
              </>
            ) : (
              <>
                参加登録
                <ArrowUpRight size={17} />
              </>
            )}
          </button>
        </article>
      ))}
    </div>
  );
}
function Booking({ page, storageKey, notify }) {
  const [saved, setSaved] = useSaved(storageKey, null);
  const [slot, setSlot] = useState(saved?.slot || page.slots[0]);
  const [subject, setSubject] = useState(saved?.subject || page.subject);
  const [detail, setDetail] = useState(saved?.detail || page.detail);
  return (
    <div className="two-column">
      <Section title="相談の内容">
        <label className="field">
          相談テーマ
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="field">
          準備状況・困っていること
          <textarea
            rows={5}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </label>
        <div className="notice">
          <Info size={18} />
          <span>
            個人情報や機密データを含めず、相談の概要を記載してください。
          </span>
        </div>
      </Section>
      <Section title="相談枠を選ぶ">
        <div className="person-inline">
          <span className="avatar">AS</span>
          <strong>{page.person}</strong>
        </div>
        <div className="slot-list">
          {page.slots.map((s) => (
            <button
              aria-pressed={slot === s}
              className={slot === s ? "selected" : ""}
              key={s}
              onClick={() => setSlot(s)}
            >
              <CalendarDays size={17} />
              {s}
              <span>30分</span>
              {slot === s && <Check size={17} />}
            </button>
          ))}
        </div>
        <button
          disabled={!subject.trim() || !detail.trim()}
          className="button full"
          onClick={() => {
            setSaved({ slot, subject, detail });
            notify("デモ予約を保存しました");
          }}
        >
          この内容でデモ予約
        </button>
        {saved && (
          <p className="success">
            <CheckCircle2 size={16} />
            {saved.slot} のデモ予約を保存済み
          </p>
        )}
      </Section>
    </div>
  );
}
function Learning({ page, storageKey, notify }) {
  const [done, setDone] = useSaved(storageKey, [0, 1]);
  const [active, setActive] = useState(2);
  return (
    <div className="two-column learning-layout">
      <Section title="4週間の学習パス">
        <div className="completion">
          <strong>
            {Math.round((done.length / page.items.length) * 100)}
            <small>%</small>
          </strong>
          <span>
            {done.length} / {page.items.length} レッスン完了
          </span>
        </div>
        <Progress value={(done.length / page.items.length) * 100} />
        <div className="lesson-list">
          {page.items.map((r, i) => (
            <button
              key={r[0]}
              onClick={() => setActive(i)}
              className={active === i ? "active" : ""}
            >
              <span
                className={"step-circle " + (done.includes(i) ? "done" : "")}
              >
                {done.includes(i) ? <Check size={17} /> : i + 1}
              </span>
              <span>
                <strong>{r[0]}</strong>
                <small>
                  {r[1]} · {done.includes(i) ? "完了" : "未完了"}
                </small>
              </span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
      </Section>
      <Section title={`LESSON 0${active + 1}`}>
        <div className="lesson-cover">
          <BookOpen size={54} />
          <span>LEARN → TRY → SHARE</span>
        </div>
        <h2>{page.items[active][0]}</h2>
        <p className="large-copy">{page.items[active][3]}</p>
        <h3>今日の実践</h3>
        <p>
          自分の仕事から例を1つ選び、実践した結果と気づいたことをメモしてください。
        </p>
        <LessonNote storageKey={storageKey + ":note:" + active} key={active} />
        <button
          className="button"
          onClick={() => {
            setDone(
              done.includes(active)
                ? done.filter((x) => x !== active)
                : [...done, active],
            );
            notify(
              done.includes(active)
                ? "未完了に戻しました"
                : "学習の完了を記録しました",
            );
          }}
        >
          <CheckCircle2 size={17} />
          {done.includes(active) ? "未完了に戻す" : "実践を完了する"}
        </button>
      </Section>
    </div>
  );
}
function LessonNote({ storageKey }) {
  const [note, setNote] = useSaved(storageKey, "");
  return (
    <label className="field">
      実践メモ
      <textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="例：工程名を先に定義すると、要約の表記が揃った。"
      />
    </label>
  );
}
function Editor({ page, storageKey, notify }) {
  const [text, setText] = useSaved(storageKey, page.input);
  const [show, setShow] = useState(false);
  return (
    <div className="two-column">
      <Section title="入力する指示" aside={<Badge>編集できます</Badge>}>
        <label className="field">
          プロンプト
          <textarea
            className="editor"
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <div className="button-row">
          <button className="button" onClick={() => setShow(true)}>
            用意された出力例を見る
            <ArrowRight size={17} />
          </button>
          <button
            className="button secondary"
            onClick={() => {
              download("prompt.txt", text);
              notify("プロンプトを保存しました");
            }}
          >
            <Download size={17} />
            保存
          </button>
        </div>
        <p className="muted">{page.note}</p>
      </Section>
      <Section title="比較・確認する">
        {show ? (
          <>
            <Badge>初期の入力に対応する出力例</Badge>
            <pre className="output-example">{page.output}</pre>
            <h3>確認ポイント</h3>
            <p>
              件数の合計は正しいか。事実と推測が分かれているか。次の行動が具体的か。
            </p>
            {text !== page.input && (
              <div className="notice">
                <Info size={18} />
                <span>
                  指示を編集しています。この出力例は初期の指示に対応する固定サンプルです。
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="empty">
            <Sparkles size={40} />
            <h3>結果を鵜呑みにせず、確かめる。</h3>
            <p>出力例を開いて、入力の数字と照合してください。</p>
          </div>
        )}
      </Section>
    </div>
  );
}
function Assessment({ page, storageKey }) {
  const [values, setValues] = useSaved(storageKey, page.values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return (
    <div className="two-column">
      <Section title="現在の状態を評価">
        <p className="muted">1：未着手 / 3：一部で実施 / 5：継続的に実施</p>
        {page.axes.map((a, i) => (
          <div className="assessment-row" key={a}>
            <label htmlFor={"axis" + i}>
              {a}
              <strong>
                {values[i]}
                <small> / 5</small>
              </strong>
            </label>
            <input
              id={"axis" + i}
              type="range"
              min="1"
              max="5"
              value={values[i]}
              onChange={(e) =>
                setValues(values.map((n, j) => (j === i ? +e.target.value : n)))
              }
            />
          </div>
        ))}
      </Section>
      <Section title="評価サマリー">
        <div className="score-ring" style={{ "--score": avg * 20 + "%" }}>
          <span>
            {avg.toFixed(1)}
            <small>/ 5.0</small>
          </span>
        </div>
        <h2 className="center">
          {avg >= 4
            ? "実践を広げる段階"
            : avg >= 3
              ? "実践を定着させる段階"
              : "土台を整える段階"}
        </h2>
        <p>{page.recommend}</p>
        <div className="notice">
          <Target size={20} />
          <div>
            <strong>次に取り組む項目</strong>
            <br />
            {page.axes[values.indexOf(Math.min(...values))]}
          </div>
        </div>
        <p className="muted">
          この評価は自己診断の目安です。実績値や客観的な成熟度認証ではありません。
        </p>
      </Section>
    </div>
  );
}
function Checklist({ page, storageKey }) {
  const [checked, setChecked] = useSaved(storageKey, page.checked);
  return (
    <div className="two-column">
      <Section
        title="確認項目"
        aside={
          <Badge>
            {checked.length} / {page.items.length} 完了
          </Badge>
        }
      >
        {page.items.map((r, i) => (
          <label
            className={"check-row " + (checked.includes(i) ? "checked" : "")}
            key={r}
          >
            <input
              type="checkbox"
              checked={checked.includes(i)}
              onChange={() =>
                setChecked(
                  checked.includes(i)
                    ? checked.filter((n) => n !== i)
                    : [...checked, i],
                )
              }
            />
            <span>
              <small>CHECK {String(i + 1).padStart(2, "0")}</small>
              {r}
            </span>
            <CheckCircle2 size={20} />
          </label>
        ))}
      </Section>
      <Section title="確認の進捗">
        <div className="completion big">
          <strong>
            {Math.round((checked.length / page.items.length) * 100)}
            <small>%</small>
          </strong>
        </div>
        <Progress value={(checked.length / page.items.length) * 100} />
        <h3>
          {checked.length === page.items.length
            ? "すべての確認を記録しました"
            : "残りの項目を確認しましょう"}
        </h3>
        <p>
          {checked.length === page.items.length
            ? "必要に応じて責任者へ結果を共有し、次の工程へ進んでください。"
            : `あと${page.items.length - checked.length}項目。未確認の条件を明確にして、担当者と確認してください。`}
        </p>
        <div className="notice">
          <ShieldCheck size={20} />
          <span>
            チェックはブラウザ内のデモ記録です。正式な審査や承認の記録にはなりません。
          </span>
        </div>
      </Section>
    </div>
  );
}
function Calc({ page, storageKey, notify }) {
  const [values, setValues] = useSaved(storageKey, page.values);
  const [a, b, c, d] = values.map(Number);
  const invalid = values.some(
    (v) => v === "" || !Number.isFinite(+v) || +v < 0,
  );
  let result = "",
    unit = "",
    sub = "",
    formula = "",
    secondary = [];
  if (page.calc === "hours") {
    const hours = ((a - b) * c * d) / 60;
    result = number(hours);
    unit = "時間 / 月";
    formula = "（改善前 − 改善後）× 月間回数 × 人数・チーム数 ÷ 60";
    sub =
      hours < 0
        ? "改善後の時間が増えています。工程全体で見直してください。"
        : "短縮できた時間を、確認や改善などの仕事へ。";
    secondary = [
      ["年間換算", number(hours * 12) + " 時間"],
      ["短縮率", a > 0 ? number(((a - b) / a) * 100) + "%" : "算出不可"],
    ];
  }
  if (page.calc === "roi") {
    const net = (b * c * 12) / 10000 - d;
    result = net > 0 ? number((a / net) * 12) : "—";
    unit = "か月で回収";
    formula =
      "初期投資 ÷（月間移管時間 × 時間単価 × 12 ÷ 10,000 − 年間運用費）× 12";
    sub =
      net > 0
        ? "運用費を差し引いた単純回収期間。移管時間の実現が前提です。"
        : "年間の純効果が0以下のため、回収期間は算出できません。";
    secondary = [
      ["年間効果（運用費控除後）", number(net) + " 万円"],
      ["年間作業移管", number(b * 12) + " 時間"],
    ];
  }
  if (page.calc === "budget") {
    const budget = Math.max(0, a - b);
    result = c + d > 0 ? number(Math.floor(budget / (c + d))) : "—";
    unit = "件の実証が可能";
    formula = "（総予算 − 予備費）÷（実証費 ＋ 現場支援費）の整数部分";
    sub =
      b > a
        ? "予備費が総予算を超えています。配分を見直してください。"
        : "同じ費用条件の案件を実施する場合の試算です。";
    secondary = [
      ["実証に使える予算", number(budget) + " 万円"],
      ["1件あたり合計費用", number(c + d) + " 万円"],
    ];
  }
  if (page.calc === "benefit") {
    const hours = (a * b) / 60,
      annual = (hours * c * 12) / 10000;
    result = number(annual);
    unit = "万円 / 年";
    formula = "短縮時間 × 月間件数 ÷ 60 × 時間単価 × 12 ÷ 10,000";
    sub = "時間の金額換算です。現金支出の削減を意味するものではありません。";
    secondary = [
      ["月間創出時間", number(hours) + " 時間"],
      ["初年度の差引効果", number(annual - d) + " 万円"],
    ];
  }
  return (
    <div className="two-column calculator-layout">
      <Section title="試算の条件" aside={<Badge>入力例</Badge>}>
        {page.labels.map((label, i) => (
          <label className="field" key={label}>
            {label}
            <input
              type="number"
              min="0"
              step="any"
              value={values[i]}
              onChange={(e) =>
                setValues(values.map((v, j) => (i === j ? e.target.value : v)))
              }
            />
          </label>
        ))}
        <button className="text-link" onClick={() => setValues(page.values)}>
          <RotateCcw size={15} />
          サンプル値に戻す
        </button>
      </Section>
      <section className="calc-result">
        <div className="eyebrow">ESTIMATED IMPACT</div>
        <span className="calc-value">{invalid ? "—" : result}</span>
        <h2>{unit}</h2>
        <p>{invalid ? "すべての条件に0以上の数値を入力してください。" : sub}</p>
        <div className="calc-secondary">
          {secondary.map(([l, v]) => (
            <div key={l}>
              <span>{l}</span>
              <strong>{invalid ? "—" : v}</strong>
            </div>
          ))}
        </div>
        <div className="formula">
          <h3>計算の考え方</h3>
          <p>{formula}</p>
        </div>
        <button
          disabled={invalid}
          className="button hero-button full"
          onClick={() => {
            download(
              `${page.id}-試算.txt`,
              `${page.title}\n${page.labels.map((l, i) => l + ": " + values[i]).join("\n")}\n結果：${result}${unit}\n${sub}\n計算式：${formula}`,
            );
            notify("試算結果を書き出しました");
          }}
        >
          <Download size={17} />
          この条件と結果を保存
        </button>
      </section>
    </div>
  );
}
function DataTable({ page }) {
  const [query, setQuery] = useState("");
  const filtered = page.rows.filter((r) =>
    r.join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Section title={page.title} aside={<Badge>{filtered.length}件</Badge>}>
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} />
        <button
          className="button secondary compact"
          onClick={() =>
            download(
              page.id + ".csv",
              [page.headers, ...filtered]
                .map((r) =>
                  r
                    .map((c) => '"' + String(c).replaceAll('"', '""') + '"')
                    .join(","),
                )
                .join("\r\n"),
              "text/csv;charset=utf-8",
            )
          }
        >
          <Download size={15} />
          CSV出力
        </button>
      </div>
      <Table headers={page.headers} rows={filtered} />
      {!filtered.length && <Empty />}
    </Section>
  );
}
function Table({ headers, rows, highlight = -1 }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={i === highlight ? "column-selected" : ""}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {c}
                  </th>
                ) : (
                  <td
                    key={j}
                    className={j === highlight ? "column-selected" : ""}
                  >
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Analytics({ page }) {
  const max = Math.max(...page.bars.map((x) => +x[1]));
  return (
    <>
      <div className="two-column">
        <Section title={page.unit}>
          <div className="bars">
            {page.bars.map(([name, n]) => (
              <div className="bar-row" key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{n}</span>
                </div>
                <div className="bar-track">
                  <span style={{ width: (+n / max) * 100 + "%" }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section title="数字から考える">
          <div className="insight-icon">
            <ChartNoAxesCombined size={36} />
          </div>
          <h2>{page.summary}</h2>
          <p>
            数値は同じ定義・期間で比較してください。平均の改善だけでなく、例外条件や品質への影響も確認します。
          </p>
          <div className="notice">
            <Info size={20} />
            <span>
              画面上の数値はすべて架空のサンプルです。実際の運用状況とは連動していません。
            </span>
          </div>
        </Section>
      </div>
      <DataTable page={page} />
    </>
  );
}
function Compare({ page, storageKey }) {
  const [chosen, setChosen] = useSaved(storageKey, "");
  return (
    <>
      <div className="compare-options">
        {page.columns.map((c, i) => (
          <button
            className={"compare-option " + (chosen === c ? "selected" : "")}
            key={c}
            onClick={() => setChosen(c)}
          >
            <small>OPTION 0{i + 1}</small>
            <h2>{c}</h2>
            <span>
              {chosen === c ? (
                <>
                  <CheckCircle2 size={17} />
                  選択中
                </>
              ) : (
                "この列を選ぶ"
              )}
            </span>
          </button>
        ))}
      </div>
      <Section title="同じ条件で比較">
        <Table
          headers={page.headers}
          rows={page.rows}
          highlight={chosen ? page.columns.indexOf(chosen) + 1 : -1}
        />
        <div className="notice">
          <Info size={20} />
          <span>
            {chosen
              ? `${chosen}を選択しています。数値の前提条件と、現場での適合を確認してください。`
              : "比較したい列を上から選択できます。製品の比較例では、数値と製品名は架空です。"}
          </span>
        </div>
      </Section>
    </>
  );
}
function Matrix({ page, storageKey }) {
  const [values, setValues] = useSaved(storageKey, page.values);
  return (
    <Section title={page.title} aside={<Badge>セルごとに編集</Badge>}>
      <p className="muted">{page.legend}</p>
      <div className="table-scroll">
        <table className="matrix">
          <thead>
            <tr>
              <th scope="col">評価対象</th>
              {page.x.map((x) => (
                <th key={x} scope="col">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.y.map((y, i) => (
              <tr key={y}>
                <th scope="row">{y}</th>
                {page.x.map((x, j) => (
                  <td key={x}>
                    <select
                      aria-label={`${y} ${x}`}
                      value={values[i][j]}
                      style={
                        page.type !== "raci"
                          ? {
                              background: `color-mix(in srgb,var(--accent) ${values[i][j] * 14}%,white)`,
                              color: values[i][j] >= 4 ? "white" : "var(--ink)",
                            }
                          : {}
                      }
                      onChange={(e) =>
                        setValues(
                          values.map((r, ri) =>
                            r.map((v, ci) =>
                              ri === i && ci === j
                                ? page.type === "raci"
                                  ? e.target.value
                                  : +e.target.value
                                : v,
                            ),
                          ),
                        )
                      }
                    >
                      {(page.type === "raci"
                        ? ["R", "A", "C", "I", "A/R", "—"]
                        : [1, 2, 3, 4, 5]
                      ).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">変更はこのブラウザに自動保存されます。</p>
    </Section>
  );
}
function Form({ page, site, storageKey, notify }) {
  const initial = page.fields.map((r) => r[1]);
  const [pending, setPending] = useState(() => {
    if (site.id !== "egc" || page.id !== "intake") return null;
    try {
      const value = JSON.parse(localStorage.getItem("forward:transfer"));
      return Array.isArray(value) && value.length === 5 ? value : null;
    } catch {
      return null;
    }
  });
  const [beforeImport, setBeforeImport] = useState(null);
  const [saved, setSaved] = useSaved(storageKey + ":form", null);
  const [values, setValues] = useState(saved?.values || initial);
  const [status, setStatus] = useState(saved ? "保存済み" : "編集できます");
  return (
    <div className="two-column form-layout">
      <Section
        title={page.type === "handoff" ? "引き継ぐ内容" : "具体的な内容を記録"}
        aside={<Badge>{status}</Badge>}
      >
        {pending && (
          <div className="transfer-preview">
            <span className="eyebrow">WORKFLOW MAPPERからの引き継ぎ</span>
            <h3>{pending[0]}</h3>
            <p>
              現在の下書きは保持しています。内容を反映してから保存するまで、保存済みの記録は変わりません。
            </p>
            <button
              className="button secondary"
              onClick={() => {
                setBeforeImport(values);
                setValues(pending);
                setPending(null);
                setStatus("未保存の引き継ぎ");
                try {
                  localStorage.removeItem("forward:transfer");
                } catch {}
              }}
            >
              引き継ぎ内容を反映
            </button>
          </div>
        )}
        {beforeImport && (
          <button
            className="text-link import-undo"
            onClick={() => {
              setValues(beforeImport);
              setBeforeImport(null);
              setStatus("未保存の変更");
            }}
          >
            <RotateCcw size={15} />
            反映前の編集内容に戻す
          </button>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (page.type === "handoff") {
              const payload = [
                values[0],
                "Workflow Mapperで分析済み：" + values[1],
                values[0] +
                  "\n人に残す判断：" +
                  values[2] +
                  "\n実証条件：" +
                  values[3],
                values[1],
                values[4],
              ];
              try {
                localStorage.setItem(
                  "forward:transfer",
                  JSON.stringify(payload),
                );
              } catch {
                notify(
                  "引き継ぎを保存できませんでした。ブラウザの保存設定を確認してください。",
                );
                return;
              }
              location.hash = href(page.target, page.targetPage);
              notify(
                "引き継ぐ内容を用意しました。EGCで確認して反映してください",
              );
              return;
            }
            setSaved({ values, date: new Date().toLocaleString("ja-JP") });
            setBeforeImport(null);
            setStatus("保存済み");
            notify("入力内容をこのブラウザに保存しました");
          }}
        >
          {page.fields.map(([label], i) => (
            <label className="field" key={label}>
              {label}
              <textarea
                rows={i === 0 ? 2 : 3}
                aria-label={label}
                required
                value={values[i]}
                onChange={(e) => {
                  setValues(
                    values.map((v, j) => (j === i ? e.target.value : v)),
                  );
                  setStatus("未保存の変更");
                }}
              />
            </label>
          ))}
          <button className="button" type="submit">
            {page.action}
            <ArrowRight size={17} />
          </button>
          {saved && <p className="muted">最終保存：{saved.date}</p>}
        </form>
      </Section>
      <Section title="伝わる記録のポイント">
        <div className="insight-icon">
          <FileText size={34} />
        </div>
        <h3>次の人が動ける情報に。</h3>
        <ol className="readable-list">
          <li>「誰が・何を・どれくらい」を具体的に書く。</li>
          <li>確認した事実と、期待・仮説を分ける。</li>
          <li>例外や制約も一緒に残す。</li>
          <li>効果の計算に使った前提を明記する。</li>
        </ol>
        <div className="notice">
          <Info size={18} />
          <span>
            保存先はこのブラウザです。実際の社内申請や外部送信は行われません。
          </span>
        </div>
      </Section>
    </div>
  );
}
function Feed({ page, storageKey, notify }) {
  const [items, setItems] = useSaved(storageKey, page.items);
  const [likes, setLikes] = useSaved(storageKey + ":likes", []);
  const [draft, setDraft] = useState("");
  return (
    <div className="feed-layout">
      <Section title="現場の気づきを追加">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            setItems([["田中 翔太", "たった今", draft.trim(), "0"], ...items]);
            setDraft("");
            notify("デモの会話に追加しました");
          }}
        >
          <label className="field">
            共有する内容
            <textarea
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="例：試したこと、確認できたこと、次に知りたいこと。"
              maxLength={1000}
              required
            />
          </label>
          <button className="button" disabled={!draft.trim()}>
            <Plus size={16} />
            デモに追加
          </button>
        </form>
      </Section>
      {items.map((r, i) => (
        <article className="feed-post panel" key={r[0] + r[2] + i}>
          <div className="feed-person">
            <span className="avatar">{r[0].slice(0, 2)}</span>
            <strong>{r[0]}</strong>
            <small>{r[1]}</small>
          </div>
          <p>{r[2]}</p>
          <button
            className={"like " + (likes.includes(r[2]) ? "selected" : "")}
            onClick={() =>
              setLikes(
                likes.includes(r[2])
                  ? likes.filter((x) => x !== r[2])
                  : [...likes, r[2]],
              )
            }
          >
            <Star
              size={17}
              fill={likes.includes(r[2]) ? "currentColor" : "none"}
            />
            参考になった{" "}
            <strong>{+r[3] + (likes.includes(r[2]) ? 1 : 0)}</strong>
          </button>
        </article>
      ))}
    </div>
  );
}
function Recognition({ page, storageKey }) {
  const [claps, setClaps] = useSaved(storageKey, []);
  return (
    <div className="recognition-grid">
      {page.items.map((r, i) => (
        <article className="recognition panel" key={r[0]}>
          <div className="award">
            <Star size={40} />
            <span>0{i + 1}</span>
          </div>
          <div className="eyebrow">THANK YOU FOR MAKING A DIFFERENCE</div>
          <h2>{r[0]}</h2>
          <Badge>{r[1]}</Badge>
          <p>{r[2]}</p>
          <button
            className={"button " + (claps.includes(i) ? "secondary" : "")}
            onClick={() =>
              setClaps(
                claps.includes(i)
                  ? claps.filter((x) => x !== i)
                  : [...claps, i],
              )
            }
          >
            <Star size={17} />
            {claps.includes(i) ? "拍手しました・取り消す" : "貢献に拍手を送る"}
          </button>
        </article>
      ))}
    </div>
  );
}
function Report({ page, site, notify }) {
  return (
    <article className="report">
      <div className="report-mast">
        <span>FORWARD / {site.name}</span>
        <Badge>DEMO REPORT · 2026.09</Badge>
      </div>
      <div className="report-intro">
        <div className="eyebrow">FROM ACTIVITY TO IMPACT</div>
        <h2>{page.lead}</h2>
        <p>{page.description}</p>
      </div>
      <div className="report-findings">
        {page.findings.map((f, i) => (
          <div key={f}>
            <span>0{i + 1}</span>
            <p>{f}</p>
          </div>
        ))}
      </div>
      <div className="report-next">
        <div className="eyebrow">WHAT'S NEXT</div>
        <h3>次に取り組むこと</h3>
        <p>{page.next}</p>
      </div>
      <div className="report-footer">
        <p>
          このレポートは画面用途を示す架空の例です。記載の成果は実績ではありません。
        </p>
        <button
          className="button"
          onClick={() => {
            download(
              `${site.id}-report.md`,
              `# ${site.name} ${page.title}\n\n${page.description}\n\n${page.lead}\n\n${page.findings.map((f) => "- " + f).join("\n")}\n\n## 次に取り組むこと\n${page.next}\n\n※すべて架空のデモデータです。`,
            );
            notify("レポートを保存しました");
          }}
        >
          <Download size={17} />
          レポートを保存
        </button>
      </div>
    </article>
  );
}
function Fleet({ page }) {
  const [selected, setSelected] = useState(page.items[0]);
  return (
    <div className="fleet-layout">
      <div className="fleet-grid">
        {page.items.map((r) => (
          <button
            key={r[0]}
            className={
              "fleet-card panel " + (selected[0] === r[0] ? "selected" : "")
            }
            onClick={() => setSelected(r)}
          >
            <div className="fleet-top">
              <Bot size={26} />
              <Badge tone={r[3] === "点検待ち" ? "warning" : ""}>{r[3]}</Badge>
            </div>
            <h2>{r[0]}</h2>
            <p>
              {r[1]} / {r[2]}
            </p>
            <div className="battery">
              <Battery size={18} />
              <Progress value={+r[4]} />
              <span>{r[4]}%</span>
            </div>
            <div className="fleet-count">
              <strong>{r[5]}</strong>
              <span>本日の完了回数</span>
            </div>
          </button>
        ))}
      </div>
      <Section title={`${selected[0]} の状態`}>
        <div className="machine-icon">
          <Bot size={76} />
        </div>
        <h3>{selected[3]}</h3>
        <p>
          <MapPin size={16} /> {selected[2]}
        </p>
        <div className="detail-stat">
          <span>バッテリー残量</span>
          <strong>{selected[4]}%</strong>
        </div>
        <div className="detail-stat">
          <span>本日の作業完了</span>
          <strong>{selected[5]}回</strong>
        </div>
        <div className="notice">
          <Info size={20} />
          <span>
            {selected[3] === "点検待ち"
              ? "点検記録を確認し、現場責任者の判断後に運用へ戻します。"
              : selected[3] === "充電中"
                ? "残量80%を目安に次のミッションへ割り当てます。"
                : "稼働状態と現場の状況を合わせて確認します。"}
            <br />
            固定のデモ表示です。実機とは接続していません。
          </span>
        </div>
      </Section>
    </div>
  );
}
function Board({ page, storageKey, notify }) {
  const [items, setItems] = useSaved(storageKey, page.items);
  return (
    <div className="board">
      {page.stages.map((stage, i) => (
        <section className="board-column" key={stage}>
          <div className="board-heading">
            <span className={"stage-dot stage-" + i} />
            <h2>{stage}</h2>
            <span>{items.filter((r) => +r[2] === i).length}</span>
          </div>
          <div className="board-items">
            {items.map(
              (r, j) =>
                +r[2] === i && (
                  <article className="board-card" key={r[0]}>
                    <span className="board-card-label">
                      {i === 0
                        ? "NEXT UP"
                        : i === 3
                          ? "DELIVERED"
                          : "IN PROGRESS"}
                    </span>
                    <h3>{r[0]}</h3>
                    <p>
                      <Clock size={14} />
                      {r[1]}
                    </p>
                    <label>
                      移動先
                      <select
                        value={r[2]}
                        onChange={(e) => {
                          setItems(
                            items.map((x, k) =>
                              k === j ? [x[0], x[1], e.target.value] : x,
                            ),
                          );
                          notify(
                            `${r[0]}を${page.stages[+e.target.value]}へ移動しました`,
                          );
                        }}
                      >
                        {page.stages.map((s, k) => (
                          <option value={k} key={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ),
            )}
            {!items.some((r) => +r[2] === i) && (
              <p className="board-empty">この段階の案件はありません</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
function Flow({ page }) {
  const [active, setActive] = useState(0);
  return (
    <>
      <div className="flow-summary">
        <Workflow size={22} />
        {page.summary}
      </div>
      <div className="flow-canvas">
        <div className="canvas-label">
          <span />
          PROCESS MAP <span className="canvas-scale">各工程を選択して確認</span>
        </div>
        <div className="flow-nodes">
          {page.nodes.map((r, i) => (
            <React.Fragment key={r[0]}>
              <button
                className={"flow-node " + (active === i ? "selected" : "")}
                onClick={() => setActive(i)}
              >
                <span>STEP 0{i + 1}</span>
                <h2>{r[0]}</h2>
                <p>{r[1]}</p>
                <span className="node-bottom">
                  {active === i ? "詳細を表示中" : "詳細を見る"}
                  <ArrowUpRight size={15} />
                </span>
              </button>
              {i < page.nodes.length - 1 && (
                <ArrowRight className="flow-arrow" size={24} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="two-column">
        <Section title={`STEP 0${active + 1} / ${page.nodes[active][0]}`}>
          <p className="large-copy">{page.nodes[active][1]}</p>
          <div className="detail-stat">
            <span>前の工程</span>
            <strong>{page.nodes[active - 1]?.[0] || "開始"}</strong>
          </div>
          <div className="detail-stat">
            <span>次の工程</span>
            <strong>{page.nodes[active + 1]?.[0] || "完了・結果の確認"}</strong>
          </div>
        </Section>
        <Section title="この工程で確認すること">
          <ul className="readable-list">
            <li>入力される情報や物の条件は揃っているか。</li>
            <li>次の工程へ渡す前に、誰が何を判断するか。</li>
            <li>通常と違う状況では、どこに戻るか。</li>
          </ul>
          <Badge>{page.levels.join(" / ")}</Badge>
        </Section>
      </div>
    </>
  );
}
function Experiment({ page, storageKey, notify }) {
  const [values, setValues] = useSaved(
    storageKey,
    page.criteria.map((r) => r[2]),
  );
  const [statuses, setStatuses] = useSaved(
    storageKey + ":statuses",
    page.criteria.map((r) => r[3]),
  );
  const [note, setNote] = useSaved(storageKey + ":note", page.next);
  return (
    <>
      <div className="experiment-hypothesis">
        <span className="eyebrow">HYPOTHESIS / 検証したい仮説</span>
        <h2>{page.hypothesis}</h2>
      </div>
      <Section title="成功条件と測定結果" aside={<Badge>実測値の入力例</Badge>}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>評価指標</th>
                <th>成功条件</th>
                <th>測定結果</th>
                <th>判定</th>
              </tr>
            </thead>
            <tbody>
              {page.criteria.map((r, i) => (
                <tr key={r[0]}>
                  <th>{r[0]}</th>
                  <td>{r[1]}</td>
                  <td>
                    <input
                      aria-label={r[0] + "の測定結果"}
                      value={values[i]}
                      onChange={(e) => {
                        setValues(
                          values.map((v, j) => (i === j ? e.target.value : v)),
                        );
                        setStatuses(
                          statuses.map((v, j) => (i === j ? "要再判定" : v)),
                        );
                      }}
                    />
                  </td>
                  <td>
                    <select
                      aria-label={r[0] + "の判定"}
                      value={statuses[i]}
                      onChange={(e) =>
                        setStatuses(
                          statuses.map((v, j) =>
                            i === j ? e.target.value : v,
                          ),
                        )
                      }
                    >
                      {["達成", "未達", "要再判定"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">
          判定は担当者が確認して記録します。測定値を変更すると「要再判定」に戻ります。
        </p>
      </Section>
      <Section title="学びと次のアクション">
        <label className="field">
          次に確認すること
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <button
          className="button"
          onClick={() => {
            download(
              `${page.id}-検証記録.txt`,
              `${page.hypothesis}\n${page.criteria.map((r, i) => `${r[0]}：目標${r[1]} / 結果${values[i]} / ${statuses[i]}`).join("\n")}\n次のアクション：${note}`,
            );
            notify("検証記録を保存しました");
          }}
        >
          <Download size={17} />
          検証記録を保存
        </button>
      </Section>
    </>
  );
}
function Timeline({ page, storageKey }) {
  const [done, setDone] = useSaved(storageKey, []);
  return (
    <Section
      title="マイルストーン"
      aside={
        <Badge>
          {done.length} / {page.items.length} 完了
        </Badge>
      }
    >
      <div className="timeline">
        {page.items.map((r, i) => (
          <div
            className={"timeline-row " + (done.includes(i) ? "done" : "")}
            key={r[0]}
          >
            <div className="timeline-date">{r[0]}</div>
            <div className="timeline-marker">
              {done.includes(i) ? <Check size={16} /> : <span />}
            </div>
            <div className="timeline-content">
              <h2>{r[1]}</h2>
              <p>{r[2]}</p>
            </div>
            <button
              className={
                "button compact " + (done.includes(i) ? "secondary" : "")
              }
              onClick={() =>
                setDone(
                  done.includes(i) ? done.filter((x) => x !== i) : [...done, i],
                )
              }
            >
              {done.includes(i) ? "完了・戻す" : "完了にする"}
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}
function Review({ page, storageKey, notify }) {
  const [checked, setChecked] = useSaved(storageKey + ":checked", []);
  const [resolved, setResolved] = useSaved(storageKey + ":resolved", false);
  const [decision, setDecision] = useSaved(storageKey, null);
  const [reason, setReason] = useSaved(storageKey + ":reason", "");
  const [history, setHistory] = useSaved(storageKey + ":history", []);
  function record(result) {
    const entry = {
      result,
      reason,
      date: new Date().toLocaleString("ja-JP"),
      evidence: checked.map((i) => page.evidence[i]),
      resolved,
      issue: page.issue,
    };
    setDecision(entry);
    setHistory([entry, ...history].slice(0, 20));
    notify("判断時の根拠・理由・日時を記録しました");
  }
  return (
    <div className="two-column">
      <Section title={page.subject}>
        <h3>確認する根拠</h3>
        {page.evidence.map((r, i) => (
          <label className="check-row" key={r}>
            <input
              type="checkbox"
              checked={checked.includes(i)}
              onChange={() =>
                setChecked(
                  checked.includes(i)
                    ? checked.filter((x) => x !== i)
                    : [...checked, i],
                )
              }
            />
            <span>{r}</span>
          </label>
        ))}
        <div className="notice warning">
          <Info size={20} />
          <div>
            <strong>未解決事項</strong>
            <p>{page.issue}</p>
          </div>
        </div>
        <label className="check-row">
          <input
            type="checkbox"
            checked={resolved}
            onChange={(e) => setResolved(e.target.checked)}
          />
          <span>未解決事項への対応を確認した（デモ）</span>
        </label>
      </Section>
      <Section title="判定を記録">
        <label className="field">
          判定理由
          <textarea
            rows={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="確認した根拠、残る条件、次の確認日を記録。"
          />
        </label>
        <div className="button-row">
          <button
            className="button"
            disabled={
              checked.length !== page.evidence.length ||
              !resolved ||
              !reason.trim()
            }
            onClick={() => {
              record("次の段階へ");
            }}
          >
            <Check size={17} />
            次の段階へ
          </button>
          <button
            disabled={!reason.trim()}
            className="button secondary"
            onClick={() => {
              record("保留・追加確認");
            }}
          >
            保留・追加確認
          </button>
        </div>
        <p className="muted">
          進行判定にはすべての根拠・未解決事項の確認と、理由の記入が必要です。
        </p>
        {decision && (
          <div className="decision-record">
            <Badge>{decision.result}</Badge>
            <h3>保存した判定理由</h3>
            <p>{decision.reason}</p>
            {decision.date && (
              <p className="muted">
                記録日時：{decision.date} / 確認した根拠：
                {decision.evidence?.length || 0}件
              </p>
            )}
          </div>
        )}
        {history.length > 0 && (
          <details>
            <summary>判定の履歴（最新20件まで）</summary>
            {history.map((entry, i) => (
              <div className="decision-record" key={i}>
                <Badge>{entry.result}</Badge>
                <p>{entry.reason}</p>
                <small>
                  {entry.date} · 未解決事項の確認：
                  {entry.resolved ? "済" : "未了"}
                </small>
                <ul>
                  {entry.evidence.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        )}
      </Section>
    </div>
  );
}
function Radar({ page }) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="two-column radar-layout">
      <Section title="機会のポジション">
        <div className="radar-chart">
          <span className="radar-axis-y">{page.axes[1]} →</span>
          <span className="radar-axis-x">{page.axes[0]} →</span>
          <span className="quadrant top-left">小さく始める</span>
          <span className="quadrant top-right">優先して検証</span>
          <span className="quadrant bottom-left">情報を集める</span>
          <span className="quadrant bottom-right">条件を整える</span>
          {page.items.map((r, i) => (
            <button
              key={r[0]}
              aria-label={r[0]}
              style={{ left: r[2] + "%", bottom: r[3] + "%" }}
              className={"radar-point " + (selected === i ? "selected" : "")}
              onClick={() => setSelected(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="radar-legend">
          {page.items.map((r, i) => (
            <button
              className={selected === i ? "selected" : ""}
              key={r[0]}
              onClick={() => setSelected(i)}
            >
              <span>{i + 1}</span>
              {r[0]}
            </button>
          ))}
        </div>
      </Section>
      <Section title={page.items[selected][0]}>
        <Badge>{page.items[selected][1]}</Badge>
        {page.axes.map((a, i) => (
          <div className="radar-score" key={a}>
            <div>
              <span>{a}</span>
              <strong>
                {page.items[selected][i + 2]}
                <small> / 100</small>
              </strong>
            </div>
            <Progress value={+page.items[selected][i + 2]} />
          </div>
        ))}
        <h3>次の検討</h3>
        <p>
          {+page.items[selected][3] >= 70
            ? "現場の担当者と適用範囲を絞り、小規模な検証計画を作成します。"
            : "期待効果を確認しながら、データ・責任分担・運用制約などの不足条件を整理します。"}
        </p>
        <p className="muted">
          スコアは架空の評価例です。順位や採用を自動決定するものではありません。
        </p>
      </Section>
    </div>
  );
}
function Playbook({ page, storageKey }) {
  const [done, setDone] = useSaved(storageKey, []);
  return (
    <Section
      title="実践のステップ"
      aside={
        <Badge>
          {done.length} / {page.items.length} 実践済み
        </Badge>
      }
    >
      <div className="playbook">
        {page.items.map((r, i) => (
          <details key={r[0]} open={i === 0 ? true : undefined}>
            <summary>
              <span className="step-circle">
                {done.includes(i) ? <Check size={17} /> : r[0]}
              </span>
              <strong>{r[1]}</strong>
              <ChevronDown size={18} />
            </summary>
            <div className="playbook-content">
              <p>{r[2]}</p>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={done.includes(i)}
                  onChange={() =>
                    setDone(
                      done.includes(i)
                        ? done.filter((x) => x !== i)
                        : [...done, i],
                    )
                  }
                />
                <span>このステップを実践した</span>
              </label>
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
function A3({ page, storageKey, notify }) {
  const [values, setValues] = useSaved(
    storageKey,
    page.items.map((r) => r[1]),
  );
  return (
    <>
      <div className="a3-sheet">
        <div className="a3-header">
          <span>A3</span>
          <div>
            <h2>ホールドロット処置の転記・照合時間を減らす</h2>
            <p>担当：鈴木 美咲 / EGC-024 / プロセス技術</p>
          </div>
          <Badge>改善ストーリー</Badge>
        </div>
        <div className="a3-grid">
          {page.items.map(([title], i) => (
            <label key={title}>
              <span>
                <b>0{i + 1}</b>
                {title}
              </span>
              <textarea
                rows={5}
                aria-label={title}
                value={values[i]}
                onChange={(e) =>
                  setValues(
                    values.map((v, j) => (j === i ? e.target.value : v)),
                  )
                }
              />
            </label>
          ))}
        </div>
      </div>
      <button
        className="button"
        onClick={() => {
          download(
            "A3-EGC-024.txt",
            page.items.map((r, i) => r[0] + "\n" + values[i]).join("\n\n"),
          );
          notify("A3ストーリーを書き出しました");
        }}
      >
        <Download size={17} />
        A3の内容を保存
      </button>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
