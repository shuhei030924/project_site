import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  GitBranch,
  Lightbulb,
  Newspaper,
  Plus,
  Search,
} from "lucide-react";
import { useSaved } from "./storage";
import {
  checkedDate,
  knowledgeSources,
  newsItems,
  knowledgeGroups,
  initialKnowledge,
  replacementPages,
  fieldCases,
  initialPipeline,
  pipelineStages,
  pipelineGate,
} from "./knowledge-data";

const today = () => new Date().toLocaleDateString("sv-SE");
const newId = () => globalThis.crypto.randomUUID();
const localNote =
  "入力・共有はこのブラウザ内のデモです。他の利用者への配信や組織の承認は行われません。";
const safeUrl = (value) =>
  /^https:\/\//i.test(value || "") ||
  /^#\/(gain|workflow|egc|supplier|robot)\/[a-z0-9-]+$/.test(value || "");
const External = ({ url, children }) =>
  safeUrl(url) ? (
    <a
      href={url}
      target={url.startsWith("https:") ? "_blank" : undefined}
      rel="noreferrer"
    >
      {children}
      <ArrowUpRight size={14} />
    </a>
  ) : (
    <span>{children}</span>
  );
const Source = ({ indexes }) => (
  <aside className="kn-source">
    <strong>このページの設計の参考</strong>
    {indexes.map((i) => (
      <External key={i} url={knowledgeSources[i].url}>
        {knowledgeSources[i].name}
      </External>
    ))}
    <small>公開手法をこの業務に合わせて応用した設計です。</small>
  </aside>
);
const Head = ({ eyebrow, title, children }) => (
  <div className="kn-head">
    <span>{eyebrow}</span>
    <h2>{title}</h2>
    <p>{children}</p>
  </div>
);
const exportJson = (name, value) => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function useKnowledge() {
  const [nodes, setNodes] = useSaved(
    "gain/community:knowledge-v1",
    initialKnowledge,
  );
  const share = (record) =>
    setNodes((list) =>
      list.some((n) => n.id === record.id)
        ? list.map((n) => (n.id === record.id ? { ...n, ...record } : n))
        : [...list, { related: [], ...record }],
    );
  return { nodes, setNodes, share };
}
export function KnowledgeEntrances({ site }) {
  const local = replacementPages
    .filter((p) => p[0] === site.id && p[1] !== "community")
    .slice(0, 2);
  return (
    <section className="kn-entrances" aria-label="日々の更新と知見の共有">
      <div>
        <span className="eyebrow">LEARN · CONNECT · APPLY</span>
        <h2>今日の気づきを、次の仕事へ。</h2>
      </div>
      <div className="kn-entry-links">
        <a href="#/gain/community">
          <GitBranch size={22} />
          <strong>つながるナレッジマップ</strong>
          <span>5つの活動を横断して探す</span>
        </a>
        {local.map((p) => (
          <a key={p[1]} href={`#/${p[0]}/${p[1]}`}>
            <ArrowUpRight size={22} />
            <strong>{p[2]}</strong>
            <span>{p[4]}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
function News({ storageKey, notify }) {
  const [state, setState] = useSaved(storageKey + ":news-v1", {});
  const { nodes, share } = useKnowledge();
  const [filter, setFilter] = useState("すべて");
  const [query, setQuery] = useState("");
  const update = (id, value) =>
    setState((s) => ({ ...s, [id]: { ...s[id], ...value } }));
  const list = newsItems.filter(
    (n) =>
      (filter === "すべて" ||
        (filter === "保存した記事"
          ? state[n.id]?.saved
          : n.category === filter)) &&
      `${n.title} ${n.fact} ${n.hypothesis}`.includes(query),
  );
  return (
    <div className="knowledge">
      <Head
        eyebrow="SIGNAL → QUESTION → EXPERIMENT"
        title="新しい発表を、自分たちの問いに変える。"
      >
        公式情報の編集版 · 確認日 {checkedDate} ·
        自動更新ではありません。最新の提供条件は出典で確認してください。
      </Head>
      <div className="kn-tools">
        <div className="kn-filters">
          {[
            "すべて",
            ...new Set(newsItems.map((n) => n.category)),
            "保存した記事",
          ].map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="kn-search">
          <Search size={16} />
          <input
            aria-label="ニュース検索"
            placeholder="業務やキーワードで探す"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="kn-muted" role="status">
        {list.length}件 ·
        公開日の新しい順。古い記事は背景資料として残しています。
      </p>
      <div className="kn-news-grid">
        {list.map((n) => {
          const s = state[n.id] || {};
          return (
            <article className="kn-news" key={n.id}>
              <div className="kn-news-top">
                <Newspaper size={23} />
                <span>
                  {n.provider} / {n.category}
                </span>
                <time>{n.date}</time>
              </div>
              <h3>{n.title}</h3>
              <div className="kn-fact">
                <span>01 / 発表された事実</span>
                <p>{n.fact}</p>
                <External url={n.url}>公式発表を読む</External>
              </div>
              <div>
                <span className="kn-overline">02 / 業務への活用仮説</span>
                <p>{n.hypothesis}</p>
              </div>
              <div>
                <span className="kn-overline">03 / 小さく試すなら</span>
                <p>{n.next}</p>
              </div>
              <p className="kn-caveat">適用前の確認：{n.caution}</p>
              <label className="kn-field">
                自分の業務で確認したいこと
                <textarea
                  value={s.note || ""}
                  onChange={(e) => update(n.id, { note: e.target.value })}
                  placeholder="対象業務・確かめたい条件を記録"
                />
              </label>
              <div className="kn-actions">
                <button
                  aria-pressed={!!s.saved}
                  onClick={() => update(n.id, { saved: !s.saved })}
                >
                  <Bookmark size={15} />
                  {s.saved ? "保存済み" : "記事を保存"}
                </button>
                <button
                  aria-pressed={!!s.read}
                  onClick={() => update(n.id, { read: !s.read })}
                >
                  <Check size={15} />
                  {s.read ? "既読" : "既読にする"}
                </button>
                <button
                  onClick={() => {
                    share({
                      id: "news-" + n.id,
                      group: n.group,
                      title: n.title,
                      relation: "発表から問いを作る",
                      detail: s.note?.trim() || n.hypothesis,
                      evidence: `${n.provider} ${n.date}。${n.fact}`,
                      route: n.url,
                      owner: "未設定",
                      review: "",
                      status: "活用仮説",
                    });
                    notify("ナレッジマップに保存しました（ブラウザ内）");
                  }}
                >
                  {nodes.some((x) => x.id === "news-" + n.id)
                    ? "マップの知見を更新"
                    : "マップに残す"}
                </button>
              </div>
              <External url={n.route}>次の検討へ</External>
            </article>
          );
        })}
      </div>
      {!list.length && (
        <div className="kn-empty">
          一致する記事はありません。検索や絞り込みを変更してください。
        </div>
      )}
      <p className="kn-muted">{localNote}</p>
    </div>
  );
}
function KnowledgeDetailsEditor({ node, save }) {
  return (
    <details className="kn-add" key={node.id}>
      <summary>選択した知見の内容・担当・期限を編集</summary>
      <form
        className="kn-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(e.currentTarget));
          if ([f.title, f.detail, f.relation, f.owner].some((v) => !v.trim()))
            return;
          save({ ...node, ...f });
        }}
      >
        <label>
          タイトル
          <input name="title" defaultValue={node.title} required />
        </label>
        <label>
          つながりの意味
          <input name="relation" defaultValue={node.relation} required />
        </label>
        <label className="wide">
          知見・適用条件
          <textarea name="detail" defaultValue={node.detail} required />
        </label>
        <label className="wide">
          根拠
          <textarea name="evidence" defaultValue={node.evidence} />
        </label>
        <label>
          見直す人
          <input name="owner" defaultValue={node.owner} required />
        </label>
        <label>
          見直し期限
          <input
            name="review"
            type="date"
            defaultValue={node.review}
            required
          />
        </label>
        <button type="submit">選択した知見を保存</button>
      </form>
    </details>
  );
}
function KnowledgeMap({ notify }) {
  const { nodes, setNodes } = useKnowledge();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [selected, setSelected] = useState("monthend");
  const [closed, setClosed] = useState([]);
  const [view, setView] = useState("map");
  const [reviewOnly, setReviewOnly] = useState(false);
  const selectedNode = nodes.find((n) => n.id === selected);
  const visible = nodes.filter(
    (n) =>
      (group === "all" || n.group === group) &&
      (!reviewOnly || !n.review || n.review < today()) &&
      `${n.title} ${n.detail} ${n.owner} ${n.relation}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function add(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (!f.title.trim() || !f.detail.trim() || !f.relation.trim()) return;
    if (f.route && !safeUrl(f.route)) {
      notify("出典には https:// から始まるURLを入力してください。");
      return;
    }
    const record = {
      ...f,
      id: newId(),
      related: selectedNode ? [selectedNode.id] : [],
      status: "未レビュー",
    };
    setNodes((list) => [...list, record]);
    setSelected(record.id);
    setQuery("");
    setGroup("all");
    setReviewOnly(false);
    setClosed([]);
    e.currentTarget.reset();
    notify("知見を追加しました");
  }
  function focusNode(id) {
    setSelected(id);
    setQuery("");
    setGroup("all");
    setReviewOnly(false);
    setClosed([]);
  }
  return (
    <div className="knowledge">
      <Head
        eyebrow="KNOWLEDGE GARDEN"
        title="点だった知識を、使えるつながりへ。"
      >
        枝を開くと知見、知見を選ぶと根拠と関連する仕事が見つかります。初期の15件は説明用の仮説です。
      </Head>
      <div className="kn-tools">
        <label className="kn-search">
          <Search size={16} />
          <input
            aria-label="知見を検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="月末・判断・搬送・相談…"
          />
        </label>
        <select
          aria-label="活動を絞る"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value="all">すべての活動</option>
          {knowledgeGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          aria-pressed={reviewOnly}
          onClick={() => setReviewOnly(!reviewOnly)}
        >
          見直し期限超過・未設定
        </button>
        <button onClick={() => setView(view === "map" ? "list" : "map")}>
          {view === "map" ? "一覧で読む" : "マップで見る"}
        </button>
        <button
          onClick={() =>
            exportJson("knowledge-map.json", {
              exportedAt: new Date().toISOString(),
              nodes,
            })
          }
        >
          マップを書き出す
        </button>
      </div>
      <p className="kn-muted" role="status">
        {visible.length} / {nodes.length}件 ·
        関係の言葉を添えて、知見と知見をつなぎます。
      </p>
      <div className="kn-map-layout">
        <div
          className={`kn-map ${view === "list" ? "is-list" : ""}`}
          aria-label="活動と知見のマインドマップ"
        >
          <div className="kn-root">
            <GitBranch size={28} />
            <strong>AI × Automation</strong>
            <span>現場の知識を育てる</span>
          </div>
          <div className="kn-branches">
            {knowledgeGroups
              .filter((g) => group === "all" || g.id === group)
              .map((g) => {
                const children = visible.filter((n) => n.group === g.id);
                return (
                  <section
                    className="kn-branch"
                    key={g.id}
                    style={{ "--branch": g.color }}
                  >
                    <button
                      className="kn-branch-title"
                      aria-expanded={!closed.includes(g.id) || !!query}
                      onClick={() =>
                        setClosed((c) =>
                          c.includes(g.id)
                            ? c.filter((x) => x !== g.id)
                            : [...c, g.id],
                        )
                      }
                    >
                      <strong>{g.name}</strong>
                      <span>
                        {g.verb} · {children.length}件
                      </span>
                    </button>
                    {(!closed.includes(g.id) || !!query) && (
                      <div className="kn-leaves">
                        {children.map((n) => (
                          <button
                            key={n.id}
                            className={`kn-leaf ${selected === n.id ? "active" : ""}`}
                            aria-pressed={selected === n.id}
                            onClick={() => setSelected(n.id)}
                          >
                            <span>{n.relation}</span>
                            <strong>{n.title}</strong>
                          </button>
                        ))}
                        {!children.length && (
                          <p className="kn-muted">条件に合う知見はありません</p>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
          </div>
        </div>
        <aside className="kn-detail" aria-label="選択した知見">
          {selectedNode && (
            <>
              <span className="kn-overline">
                選択した知見 / {selectedNode.status}
              </span>
              <h3>{selectedNode.title}</h3>
              <p>{selectedNode.detail}</p>
              <dl>
                <dt>根拠・適用範囲</dt>
                <dd>{selectedNode.evidence || "未記入"}</dd>
                <dt>見直す人</dt>
                <dd>{selectedNode.owner || "未設定"}</dd>
                <dt>見直し期限</dt>
                <dd>{selectedNode.review || "未設定"}</dd>
              </dl>
              {selectedNode.route && (
                <External url={selectedNode.route}>
                  元の情報・関連ページへ
                </External>
              )}
              <h4>つながっている知見</h4>
              <div className="kn-related">
                {nodes
                  .filter(
                    (n) =>
                      (selectedNode.related || []).includes(n.id) ||
                      (n.related || []).includes(selectedNode.id),
                  )
                  .map((n) => (
                    <button key={n.id} onClick={() => focusNode(n.id)}>
                      {n.title}
                      <ArrowRight size={13} />
                    </button>
                  ))}
              </div>
              <button
                onClick={() => {
                  setNodes((list) =>
                    list.map((n) =>
                      n.id === selected
                        ? {
                            ...n,
                            reviewedAt: today(),
                            status: "内容を確認済み",
                            review: new Date(
                              Date.now() + 30 * 86400000,
                            ).toLocaleDateString("sv-SE"),
                          }
                        : n,
                    ),
                  );
                  notify(
                    "内容の確認を記録し、見直し期限を30日後にしました。事実の検証とは別の記録です。",
                  );
                }}
              >
                内容を確認・30日後に見直す
              </button>
              <small>
                内容の確認済みは、仮説が実証されたことを意味しません。
              </small>
            </>
          )}
        </aside>
      </div>
      {selectedNode && (
        <KnowledgeDetailsEditor
          key={selectedNode.id + (selectedNode.reviewedAt || "")}
          node={selectedNode}
          save={(record) => {
            setNodes((list) =>
              list.map((n) => (n.id === record.id ? record : n)),
            );
            notify("知見を更新しました");
          }}
        />
      )}
      <details className="kn-add">
        <summary>
          <Plus size={16} />
          関連する知見を追加
        </summary>
        <form onSubmit={add} className="kn-form">
          <p>選択中の「{selectedNode?.title}」とつなげます。</p>
          <label>
            タイトル
            <input name="title" required maxLength={100} />
          </label>
          <label>
            活動
            <select name="group" defaultValue="gain">
              {knowledgeGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            つながりの意味
            <input
              name="relation"
              required
              placeholder="例：この失敗を防ぐ"
              maxLength={60}
            />
          </label>
          <label className="wide">
            知見・適用条件
            <textarea name="detail" required />
          </label>
          <label>
            根拠
            <textarea name="evidence" placeholder="どの記録や試験に基づくか" />
          </label>
          <label>
            出典URL（任意）
            <input name="route" type="url" placeholder="https://" />
          </label>
          <label>
            見直す人
            <input name="owner" required />
          </label>
          <label>
            見直し期限
            <input name="review" type="date" required />
          </label>
          <button type="submit">知見を追加する</button>
        </form>
      </details>
      <p className="kn-muted">
        {localNote} JSONにはこのマップの知見とつながりが含まれます。
      </p>
      <Source indexes={[0, 1]} />
    </div>
  );
}

const deskConfigs = {
  "knowledge-questions": {
    group: "gain",
    source: [0],
    eyebrow: "ASK → EXPLORE → CAPTURE",
    headline: "答えがないことも、大切な知識。",
    intro:
      "誰かの疑問を、担当のある検証に変える。解決したら、答えと使える条件を残します。",
    steps: ["問いを置く", "担当と検証を決める", "答えを知見に残す"],
    statuses: ["相談募集中", "検証中", "解決"],
    publish: "解決内容をマップへ",
    fields: [
      ["context", "困っている場面"],
      ["attempt", "試したこと・わかったこと"],
      ["next", "次に確かめること"],
      ["answer", "答えと適用できる条件"],
    ],
    required: ["context", "next"],
    seeds: [
      {
        id: "q-month",
        title: "月末の追加列で集計が止まるのはなぜ？",
        status: "検証中",
        owner: "田中（デモ）",
        review: "2026-09-25",
        context: "月末だけ帳票に補足列が増え、日次集計が止まる。",
        attempt: "通常日の帳票では再現しない。月末の列名が固定かは未確認。",
        next: "月末3回分の匿名化帳票を比べる。",
        answer: "",
      },
      {
        id: "q-expert",
        title: "AIの回答をどこまで確認すればよい？",
        status: "相談募集中",
        owner: "GAIN推進担当（デモ）",
        review: "2026-09-23",
        context: "設備PMの手順を調べる際に、回答の根拠が見つからない。",
        attempt: "出典の表示と原文の照合を試す予定。",
        next: "安全・品質に関係する判断と、文書検索を切り分ける。",
        answer: "",
      },
    ],
  },
  "knowledge-decisions": {
    group: "workflow",
    source: [3],
    eyebrow: "CONTEXT → CHOICE → REVISIT",
    headline: "結論よりも、判断した理由を残す。",
    intro:
      "後任者が同じ議論をやり直さずに済むように。背景が変わったら、決定も見直せるように。",
    steps: ["背景と選択肢", "選んだ理由と影響", "見直しのきっかけ"],
    statuses: ["検討中", "採用", "見直し中", "廃止"],
    publish: "判断理由をマップへ",
    fields: [
      ["context", "背景・制約"],
      ["alternatives", "代替案と採用しなかった理由"],
      ["decision", "決定とその理由"],
      ["consequence", "影響・残る不利な点"],
      ["trigger", "見直す条件"],
    ],
    required: ["context", "alternatives", "decision", "trigger"],
    seeds: [
      {
        id: "d-human",
        title: "ホールド解除の最終判断は人が行う",
        status: "採用",
        owner: "品質保証担当（デモ）",
        review: "2026-10-01",
        context: "例外の判断根拠が文書だけでは揃わない。",
        alternatives:
          "完全自動の処置判定案：例外データと責任分担が未整備のため採用しない。",
        decision:
          "AIは関連記録の収集と要約を支援し、処置判断は品質担当が行う。",
        consequence: "確認時間は残る。根拠を追える形で情報を渡す必要がある。",
        trigger:
          "例外の判断基準と検証データが揃った時、または誤った要約が見つかった時。",
      },
    ],
  },
  "knowledge-watch": {
    group: "supplier",
    source: [4],
    eyebrow: "SIGNAL → EVIDENCE → NEXT TEST",
    headline: "話題の技術を、現場で確かめる技術へ。",
    intro:
      "外部の発表だけで採用を決めず、足りない証拠と次に確かめる条件を明らかにします。段階は本サイト独自の検討区分です。",
    steps: ["情報収集", "限定した条件で検証", "適用範囲を決める"],
    statuses: ["情報収集", "検証待ち", "検証中", "適用判断済", "保留"],
    publish: "検証メモをマップへ",
    fields: [
      ["context", "対象業務・解きたい課題"],
      ["signal", "外部で確認した事実"],
      ["evidence", "自社条件で得た証拠"],
      ["gap", "未確認の条件"],
      ["next", "次の検証・判断条件"],
      ["url", "情報源URL（任意）"],
    ],
    required: ["context", "signal", "gap", "next"],
    seeds: [
      {
        id: "w-agent",
        title: "複数工程をまたぐ業務エージェント",
        status: "検証待ち",
        owner: "業務改革担当（デモ）",
        review: "2026-10-02",
        context: "PM記録の検索から、不足情報の確認と引き継ぎまで。",
        signal: newsItems[0].fact,
        evidence: "未取得。公開発表だけを確認した段階。",
        gap: "例外処理、根拠の追跡、社内契約で使える機能。",
        next: "匿名化した10ケースを用意し、失敗時に人へ戻せるかを検証する。",
        url: newsItems[0].url,
      },
      {
        id: "w-physical",
        title: "ロボット実証のシミュレーション活用",
        status: "情報収集",
        owner: "自動化担当（デモ）",
        review: "2026-10-06",
        context: "搬送の停止と受け渡しを実証前に整理する。",
        signal: newsItems[2].fact,
        evidence: "現場での測定結果なし。",
        gap: "実際の通路、通信、荷姿をどこまで再現できるか。",
        next: "現場とモデルの違いを1作業で列挙し、実機で確認すべき条件を決める。",
        url: newsItems[2].url,
      },
    ],
  },
  "knowledge-lessons": {
    group: "egc",
    source: [2, 0],
    eyebrow: "EVENT → LESSON → PRACTICE",
    headline: "失敗を、次の人の確認項目にする。",
    intro:
      "原因の記録から一歩先へ。どの手順を変え、誰が反映を確認するかまで残します。",
    steps: ["何が起きたか", "何を学んだか", "どこに反映するか"],
    statuses: ["整理中", "手順への反映待ち", "反映確認済み"],
    publish: "教訓をマップへ",
    fields: [
      ["context", "出来事・起きた条件"],
      ["lesson", "得られた教訓・根拠"],
      ["boundary", "当てはまらない条件・未確認の範囲"],
      ["procedure", "更新する手順・チェック項目"],
      ["verification", "反映の確認方法・確認者"],
    ],
    required: ["context", "lesson", "boundary", "procedure", "verification"],
    seeds: [
      {
        id: "l-month",
        title: "通常日だけで集計自動化を評価しない",
        status: "手順への反映待ち",
        owner: "田中（デモ）",
        review: "2026-09-30",
        context: "月末帳票の追加列で集計が停止したという想定事例。",
        lesson:
          "列の変化を含むデータで試験する。通常日の成功は月末の動作を保証しない。",
        boundary: "他部門の帳票と年度末の形式は未確認。",
        procedure: "受入試験のチェック項目に月末・欠損・列変更を追加する。",
        verification:
          "業務担当が試験データとチェック表を照合する。確認記録は未作成。",
      },
      {
        id: "l-handoff",
        title: "搬送実証では受け渡し待ちも測る",
        status: "整理中",
        owner: "搬送改善担当（デモ）",
        review: "2026-10-01",
        context:
          "走行時間は短くなったが、受け取り側の準備待ちが残ったという想定事例。",
        lesson: "出発から受け渡し完了までを測定範囲にする。",
        boundary: "設備側の待ち理由と夜間運用は未確認。",
        procedure: "PoC測定票に待ち理由と受け渡し完了時刻を追加する。",
        verification: "製造と設備担当が測定範囲をレビューする。",
      },
    ],
  },
};

function RecordDesk({ page, storageKey, notify }) {
  const config = deskConfigs[page.type];
  const [records, setRecords] = useSaved(
    storageKey + ":records-v1",
    config.seeds,
  );
  const [selected, setSelected] = useState(records[0].id);
  const [draft, setDraft] = useState(records[0]);
  const [filter, setFilter] = useState("すべて");
  const [query, setQuery] = useState("");
  const { share } = useKnowledge();
  const [dirty, setDirty] = useState(false);
  const change = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  };
  const persist = () => {
    setRecords((list) =>
      list.some((r) => r.id === draft.id)
        ? list.map((r) => (r.id === draft.id ? draft : r))
        : [...list, draft],
    );
    setDirty(false);
  };
  const validate = () => {
    if (
      !["title", "owner", "review", ...config.required].every((k) =>
        draft[k]?.trim(),
      )
    )
      return "タイトル・担当・期限と必須項目を入力してください。";
    if (draft.url && !safeUrl(draft.url))
      return "情報源には https:// から始まるURLを入力してください。";
    if (
      page.type === "knowledge-questions" &&
      draft.status === "解決" &&
      !draft.answer?.trim()
    )
      return "解決にする前に、答えと適用条件を記録してください。";
    return "";
  };
  const publish = () => {
    const error = validate();
    if (error) {
      notify(error);
      return;
    }
    if (
      page.type === "knowledge-questions" &&
      (draft.status !== "解決" || !draft.answer?.trim())
    ) {
      notify("答えと適用条件を記録し、解決にしてからマップへ残してください。");
      return;
    }
    persist();
    share({
      id: "record-" + draft.id,
      group: config.group,
      title: draft.title,
      relation: config.steps[2],
      detail: config.fields
        .filter(([k]) => k !== "url")
        .map(([k, label]) => `${label}：${draft[k] || "未記入"}`)
        .join("\n"),
      owner: draft.owner,
      review: draft.review,
      status: draft.status,
      evidence:
        draft.evidence || draft.lesson || draft.attempt || draft.context,
      route: `#/${config.group}/${page.id}`,
    });
    notify("保存してナレッジマップへ反映しました（ブラウザ内）");
  };
  const choose = (record) => {
    if (dirty) {
      notify(
        "編集中です。「保存」または「編集を取り消す」で区切ってから選んでください。",
      );
      return;
    }
    setSelected(record.id);
    setDraft(record);
  };
  const rows = records.filter(
    (r) =>
      (filter === "すべて" || r.status === filter) &&
      `${r.title} ${r.context} ${r.owner}`.includes(query),
  );
  return (
    <div className="knowledge">
      <Head eyebrow={config.eyebrow} title={config.headline}>
        {config.intro}
      </Head>
      <div className="kn-process">
        {config.steps.map((s, i) => (
          <div key={s}>
            <span>0{i + 1}</span>
            <strong>{s}</strong>
            {i < 2 && <ArrowRight size={18} />}
          </div>
        ))}
      </div>
      <div className="kn-tools">
        <label className="kn-search">
          <Search size={16} />
          <input
            aria-label="記録を検索"
            placeholder="場面・担当で探す"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="状態で絞る"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>すべて</option>
          {config.statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (dirty) {
              notify("編集中の内容を保存するか、取り消してください。");
              return;
            }
            const d = {
              id: newId(),
              title: "",
              owner: "",
              review: "",
              status: config.statuses[0],
            };
            setDraft(d);
            setSelected(d.id);
            setDirty(true);
          }}
        >
          <Plus size={15} />
          新しい記録
        </button>
      </div>
      <div className="kn-desk">
        <nav className="kn-record-list" aria-label="記録一覧">
          {rows.map((r) => (
            <button
              key={r.id}
              className={selected === r.id ? "active" : ""}
              aria-pressed={selected === r.id}
              onClick={() => choose(r)}
            >
              <span>{r.status}</span>
              <strong>{r.title}</strong>
              <small>
                {r.owner} · {r.review}
                <br />
                {r.review < today() ? "見直し期限を過ぎています" : "見直し予定"}
              </small>
            </button>
          ))}
          {!rows.length && (
            <p className="kn-empty">一致する記録がありません。</p>
          )}
        </nav>
        <form
          className="kn-form kn-record-editor"
          onSubmit={(e) => {
            e.preventDefault();
            const error = validate();
            if (error) {
              notify(error);
              return;
            }
            persist();
            notify("記録を保存しました");
          }}
        >
          <div className="wide kn-editor-title">
            <h3>
              {records.some((r) => r.id === selected)
                ? "記録を育てる"
                : "新しい記録"}
            </h3>
            <span role="status">{dirty ? "未保存の変更あり" : "保存済み"}</span>
          </div>
          <label className="wide">
            タイトル
            <input
              aria-label="記録のタイトル"
              value={draft.title}
              required
              onChange={(e) => change("title", e.target.value)}
            />
          </label>
          <label>
            状態
            <select
              aria-label="記録の状態"
              value={draft.status}
              onChange={(e) => change("status", e.target.value)}
            >
              {config.statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            担当・見直す人
            <input
              value={draft.owner}
              required
              onChange={(e) => change("owner", e.target.value)}
            />
          </label>
          <label>
            見直し期限
            <input
              type="date"
              value={draft.review}
              required
              onChange={(e) => change("review", e.target.value)}
            />
          </label>
          {config.fields.map(([key, label]) => (
            <label className="wide" key={key}>
              {label}
              {config.required.includes(key) ? " *" : ""}
              {key === "url" ? (
                <input
                  type="url"
                  value={draft[key] || ""}
                  onChange={(e) => change(key, e.target.value)}
                />
              ) : (
                <textarea
                  value={draft[key] || ""}
                  required={config.required.includes(key)}
                  onChange={(e) => change(key, e.target.value)}
                />
              )}
            </label>
          ))}
          {draft.url && <External url={draft.url}>根拠の情報源を開く</External>}
          <div className="kn-actions wide">
            <button type="submit" className="kn-primary">
              保存
            </button>
            <button type="button" onClick={publish}>
              {config.publish}
            </button>
            <button
              type="button"
              disabled={!dirty}
              onClick={() => {
                const r = records.find((r) => r.id === selected) || records[0];
                setDraft(r);
                setSelected(r.id);
                setDirty(false);
              }}
            >
              編集を取り消す
            </button>
            <a href="#/gain/community">
              マップを見る
              <ArrowUpRight size={14} />
            </a>
          </div>
        </form>
      </div>
      <p className="kn-muted">初期の記録・担当・判断はデモ。{localNote}</p>
      <Source indexes={config.source} />
    </div>
  );
}

function FieldLibrary({ storageKey, notify }) {
  const [task, setTask] = useState("すべて");
  const [notes, setNotes] = useSaved(storageKey + ":field-v1", {});
  const { share } = useKnowledge();
  return (
    <div className="knowledge">
      <Head
        eyebrow="CONDITIONS MATTER"
        title="「うまくいった」の、条件まで持ち帰る。"
      >
        点検・搬送・着脱の想定事例。画像は生成した概念図で、実機の性能や工場の実績を表しません。
      </Head>
      <div className="kn-filters">
        {["すべて", "点検", "搬送", "着脱"].map((t) => (
          <button key={t} aria-pressed={task === t} onClick={() => setTask(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="kn-field-cases">
        {fieldCases
          .filter((c) => task === "すべて" || c.task === task)
          .map((c) => (
            <article className="kn-case" key={c.id}>
              <div className="kn-case-image">
                <img
                  loading="lazy"
                  src={`${import.meta.env.BASE_URL}images/guides/${c.image}.png`}
                  alt={`${c.task}作業の概念図`}
                />
                <span>{c.task} / 想定事例</span>
              </div>
              <div className="kn-case-body">
                <h3>{c.title}</h3>
                <p>{c.condition}</p>
                <dl>
                  <dt>適用するなら揃える条件</dt>
                  <dd>{c.works}</dd>
                  <dt>そのまま転用できない例</dt>
                  <dd>{c.fails}</dd>
                  <dt>次の現場で確かめること</dt>
                  <dd>{c.test}</dd>
                </dl>
                <label className="kn-field">
                  自分の現場との違い
                  <textarea
                    value={notes[c.id] || ""}
                    onChange={(e) =>
                      setNotes((n) => ({ ...n, [c.id]: e.target.value }))
                    }
                    placeholder="通路・設備・荷姿・運用時間など"
                  />
                </label>
                <div className="kn-actions">
                  <button
                    onClick={() => {
                      if (!notes[c.id]?.trim()) {
                        notify("自分の現場との違いを先に記録してください。");
                        return;
                      }
                      share({
                        id: "field-" + c.id,
                        group: "robot",
                        title: c.title + "：自分の現場との差",
                        relation: "現場条件を比べる",
                        detail: notes[c.id],
                        evidence: "利用者の検討メモ。現場での実証は別途必要。",
                        route: "#/robot/comparison",
                        status: "未検証",
                        owner: "未設定",
                        review: "",
                        related: [c.related],
                      });
                      notify("現場との差をマップに残しました");
                    }}
                  >
                    違いをマップに残す
                  </button>
                  <External url={c.link}>実証を具体化する</External>
                </div>
              </div>
            </article>
          ))}
      </div>
      <p className="kn-muted">{localNote}</p>
      <Source indexes={[2]} />
    </div>
  );
}

function Pipeline({ storageKey, notify }) {
  const [items, setItems] = useSaved(storageKey + ":flow-v2", initialPipeline);
  const [limit, setLimit] = useSaved(storageKey + ":wip-v2", 4);
  const [filter, setFilter] = useState("すべて");
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null);
  const [message, setMessage] = useState("");
  const active = items.filter((i) => i.stage > 0 && i.stage < 4);
  const overdue = (i) => i.stage < 4 && i.due && i.due < today();
  const shown = items.filter(
    (i) =>
      filter === "すべて" || (filter === "停止中" ? !!i.blocker : overdue(i)),
  );
  const move = (item, target) => {
    const error = pipelineGate(items, item, target, limit);
    if (error) {
      setMessage(error);
      notify(error);
      return;
    }
    setItems((list) =>
      list.map((i) =>
        i.id === item.id
          ? {
              ...i,
              stage: target,
              entered: today(),
              effectVerified: target < i.stage ? false : i.effectVerified,
            }
          : i,
      ),
    );
    setMessage(`${item.id}を「${pipelineStages[target]}」へ移動しました。`);
  };
  return (
    <div className="knowledge">
      <Head
        eyebrow="FINISH WORK · THEN START WORK"
        title="新しく始める前に、止まっている仕事を見る。"
      >
        評価への移動を着手、効果確認の後を完了とするデモです。評価・実行・効果確認が仕掛かりに含まれます。
      </Head>
      <div className="kn-flow-stats">
        <div>
          <strong>
            {active.length} / {limit}
          </strong>
          <span>仕掛かり / 上限</span>
        </div>
        <div>
          <strong>
            {items.filter((i) => i.stage < 4 && i.blocker).length}
          </strong>
          <span>停止中</span>
        </div>
        <div>
          <strong>{items.filter(overdue).length}</strong>
          <span>期限超過</span>
        </div>
        <label>
          仕掛かり上限
          <input
            type="number"
            min="1"
            max="30"
            aria-label="仕掛かり上限"
            value={limit}
            onChange={(e) =>
              setLimit(Math.max(1, Math.min(30, Number(e.target.value) || 1)))
            }
          />
        </label>
      </div>
      <div className="kn-tools">
        <div className="kn-filters">
          {["すべて", "停止中", "期限超過"].map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (draft) {
              notify("開いている案件を保存または閉じてから追加してください。");
              return;
            }
            const id = "EGC-" + newId().slice(0, 8);
            setSelected(id);
            setDraft({
              id,
              title: "",
              owner: "",
              due: "",
              next: "",
              blocker: "",
              evidence: "",
              stage: 0,
              entered: today(),
            });
          }}
        >
          案件を追加
        </button>
      </div>
      <p className="kn-feedback" role="status">
        {message ||
          "担当・期限・次の行動を揃えて段階を進めます。停止中の案件は進められません。"}
      </p>
      {draft && (
        <form
          className="kn-form kn-pipeline-editor"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !["title", "owner", "next", "due"].every((k) => draft[k]?.trim())
            )
              return;
            setItems((list) =>
              list.some((i) => i.id === selected)
                ? list.map((i) => (i.id === selected ? draft : i))
                : [...list, draft],
            );
            setDraft(null);
            setSelected(null);
            notify("案件を保存しました");
          }}
        >
          <h3 className="wide">{selected} · 次の行動を整理</h3>
          {[
            ["title", "案件名"],
            ["owner", "担当"],
            ["due", "次の行動の期限"],
            ["next", "次の行動"],
            ["blocker", "止まった理由（解消したら空欄に）"],
            ["evidence", "効果確認の記録"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type={key === "due" ? "date" : "text"}
                required={["title", "owner", "due", "next"].includes(key)}
                value={draft[key]}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [key]: e.target.value }))
                }
              />
            </label>
          ))}
          <label className="wide kn-checkbox">
            <input
              type="checkbox"
              checked={!!draft.effectVerified}
              onChange={(e) =>
                setDraft((d) => ({ ...d, effectVerified: e.target.checked }))
              }
            />
            効果を確認し、記録を残した（デモ）
          </label>
          <div className="kn-actions wide">
            <button type="submit" className="kn-primary">
              案件を保存
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setSelected(null);
              }}
            >
              編集を取り消す
            </button>
          </div>
        </form>
      )}
      <div className="kn-flow-board">
        {pipelineStages.map((stage, index) => (
          <section className="kn-flow-column" key={stage}>
            <h3>
              <span>0{index + 1}</span>
              {stage}
              <small>{items.filter((i) => i.stage === index).length}</small>
            </h3>
            {shown
              .filter((i) => i.stage === index)
              .map((i) => (
                <article
                  className={`kn-flow-card ${i.blocker ? "blocked" : ""}`}
                  key={i.id}
                >
                  <span>
                    {i.id} ·{" "}
                    {index === 0 ? "未着手" : index === 4 ? "完了" : "着手済み"}
                  </span>
                  <h4>{i.title}</h4>
                  <p>
                    {i.owner}
                    <br />
                    期限 {i.due}
                    {overdue(i) && <b> · 超過</b>}
                  </p>
                  <p>
                    <strong>次：</strong>
                    {i.next}
                  </p>
                  {i.blocker && <p className="kn-blocker">停止：{i.blocker}</p>}
                  <small>
                    この段階：
                    {Math.max(
                      0,
                      Math.floor(
                        (Date.parse(today()) - Date.parse(i.entered)) /
                          86400000,
                      ),
                    )}
                    日
                  </small>
                  <button
                    disabled={!!draft}
                    onClick={() => {
                      setSelected(i.id);
                      setDraft({ ...i });
                    }}
                  >
                    担当・次の行動を編集
                  </button>
                  <label>
                    段階を移す
                    <select
                      aria-label={`${i.id}の段階`}
                      disabled={!!draft}
                      value={i.stage}
                      onChange={(e) => move(i, Number(e.target.value))}
                    >
                      {pipelineStages.map((s, j) => (
                        <option key={s} value={j}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </article>
              ))}
            {!shown.some((i) => i.stage === index) && (
              <p className="kn-muted">表示する案件なし</p>
            )}
          </section>
        ))}
      </div>
      <details className="kn-add">
        <summary>このボードの運用ルールと以前の記録</summary>
        <p>
          評価から効果確認までの仕掛かりを制限します。先の段階への飛び越しは不可。完了には効果確認の記録が必要です。上限を下げても既存案件は移動しません。実際の承認を代行するものではありません。
        </p>
        <p>
          以前の簡易ボードの保存内容は上書きしていません。この版は新しい保存領域を使います。
        </p>
        <button
          onClick={() => {
            try {
              const old = JSON.parse(
                localStorage.getItem("forward:egc/pipeline"),
              );
              if (!old) {
                notify("このブラウザに以前のボードの記録はありません。");
                return;
              }
              exportJson("egc-pipeline-previous.json", old);
            } catch {
              notify("以前の記録を読み取れませんでした。");
            }
          }}
        >
          以前の記録を書き出す
        </button>
      </details>
      <p className="kn-muted">
        案件・日付はデモ。期限超過と滞留日数は閲覧日の {today()}{" "}
        を基準に計算します。{localNote}
      </p>
      <Source indexes={[5]} />
    </div>
  );
}
export const knowledgeComponents = {
  "knowledge-news": News,
  "knowledge-map": KnowledgeMap,
  "knowledge-questions": RecordDesk,
  "knowledge-decisions": RecordDesk,
  "knowledge-watch": RecordDesk,
  "knowledge-lessons": RecordDesk,
  "knowledge-field": FieldLibrary,
  "knowledge-pipeline": Pipeline,
};
export const knowledgeUsage = {
  "knowledge-news": "記事を絞り込み、業務で試す問いをマップへ残す。",
  "knowledge-map": "枝を開き、関係をたどる。自分の知見を追加してJSONに保存。",
  "knowledge-questions": "問いに担当と検証を付け、解決した答えをマップへ残す。",
  "knowledge-decisions":
    "決定・代替案・見直し条件を記録し、判断理由を引き継ぐ。",
  "knowledge-watch": "外部情報と現場の証拠を分け、次の検証を決める。",
  "knowledge-lessons": "出来事を教訓に変え、手順への反映先まで記録する。",
  "knowledge-field": "適用条件を読み、自分の現場との差をマップに残す。",
  "knowledge-pipeline":
    "停止・期限超過を絞り込み、次の行動を揃えて案件を進める。",
};
