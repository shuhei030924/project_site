import React, { useState } from "react";
import { Plus, X, Check, AlertTriangle, RotateCcw } from "lucide-react";
import { Panel, Note, Metric, SavedNote, NumberField, ResetLink, useSaved, fmt, isNum } from "./frontier-shared";
import { hhi, sampleSize } from "./models";

export function Premortem({ page, storageKey }) {
  const [headline, setHeadline] = useSaved(storageKey + ":headline", page.headline);
  const [reasons, setReasons] = useSaved(
    storageKey + ":reasons",
    page.reasons.map(([text, signal, week, owner]) => ({ text, signal, week: +week, owner, checked: false })),
  );
  const [draft, setDraft] = useState({ text: "", signal: "", week: 4, owner: "" });
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <>
      <Panel title="失敗した未来の見出し">
        <input className="headline-input" value={headline} onChange={(e) => setHeadline(e.target.value)} aria-label="失敗の見出し" />
        <p className="muted">「〜かもしれない」ではなく、すでに起きた出来事として書きます。</p>
      </Panel>
      <div className="two-column">
        <Panel title="なぜ失敗したか" aside={<span className="badge">{reasons.length}件</span>}>
          <ul className="reason-list">
            {reasons.map((r, i) => (
              <li key={i}>
                <label className="check-row">
                  <input type="checkbox" checked={r.checked} onChange={() => setReasons(reasons.map((x, j) => (i === j ? { ...x, checked: !x.checked } : x)))} />
                  <span>
                    <strong>{r.text}</strong>
                    <small>予兆：{r.signal} · 第{r.week}週 · {r.owner}</small>
                  </span>
                </label>
                <button className="icon-button" aria-label="削除" onClick={() => setReasons(reasons.filter((_, j) => j !== i))}>
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
          <div className="reason-form">
            <input placeholder="失敗の理由（起きたこととして）" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} aria-label="理由" />
            <input placeholder="早く気づける予兆" value={draft.signal} onChange={(e) => setDraft({ ...draft, signal: e.target.value })} aria-label="予兆" />
            <div className="reason-form-row">
              <label>
                確認する週
                <select value={draft.week} onChange={(e) => setDraft({ ...draft, week: +e.target.value })}>
                  {weeks.map((w) => (
                    <option key={w} value={w}>
                      第{w}週
                    </option>
                  ))}
                </select>
              </label>
              <input placeholder="確認する人" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} aria-label="担当" />
              <button
                className="button compact"
                disabled={!draft.text.trim() || !draft.signal.trim()}
                onClick={() => {
                  setReasons([...reasons, { ...draft, owner: draft.owner || "未定", checked: false }]);
                  setDraft({ text: "", signal: "", week: 4, owner: "" });
                }}
              >
                <Plus size={14} /> 追加
              </button>
            </div>
          </div>
        </Panel>
        <Panel title="予兆を確認するカレンダー（12週）">
          <div className="week-strip">
            {weeks.map((w) => {
              const due = reasons.filter((r) => r.week === w);
              return (
                <div key={w} className={"week " + (due.length ? "has" : "")}>
                  <span>W{w}</span>
                  {due.map((r, i) => (
                    <em key={i} className={r.checked ? "done" : ""} title={r.signal}>
                      {r.owner}
                    </em>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="inline-metrics">
            <Metric value={reasons.filter((r) => r.week <= 4).length} label="最初の4週で確認する予兆" />
            <Metric value={reasons.filter((r) => r.checked).length} label="確認済み" />
          </div>
          {reasons.length > 0 && reasons.every((r) => r.week > 6) && (
            <Note warning>すべての予兆が7週目以降です。早期に確認できる予兆を一つは置きます。</Note>
          )}
          <Note>{page.note}</Note>
        </Panel>
      </div>
    </>
  );
}

export function Quadrant({ page, storageKey }) {
  const [items, setItems] = useSaved(storageKey + ":items", page.items.map(([name, x, y]) => ({ name, x: +x, y: +y })));
  const quad = (it) => (it.y >= 3 ? (it.x >= 3 ? 0 : 1) : it.x >= 3 ? 2 : 3);
  return (
    <div className="two-column">
      <Panel title="2軸で位置づける">
        <div className="quadrant" role="img" aria-label={`${page.xLabel}と${page.yLabel}の散布図`}>
          {page.quadrants.map(([name], i) => (
            <span key={name} className={"q-label q" + i}>
              {name}
            </span>
          ))}
          {items.map((it) => (
            <span key={it.name} className="q-dot" style={{ left: `${((it.x - 0.5) / 5) * 100}%`, bottom: `${((it.y - 0.5) / 5) * 100}%` }}>
              {it.name}
            </span>
          ))}
          <em className="q-x">{page.xLabel} →</em>
          <em className="q-y">{page.yLabel} →</em>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>技術領域</th>
                <th>{page.xLabel}</th>
                <th>{page.yLabel}</th>
                <th>象限</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.name}>
                  <th>{it.name}</th>
                  {["x", "y"].map((k) => (
                    <td key={k}>
                      <select value={it[k]} aria-label={`${it.name}の${k === "x" ? page.xLabel : page.yLabel}`} onChange={(e) => setItems(items.map((x, j) => (i === j ? { ...x, [k]: +e.target.value } : x)))}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td>{page.quadrants[quad(it)][0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="象限ごとの付き合い方">
        {page.quadrants.map(([name, strategy], i) => (
          <div key={name} className="q-strategy">
            <strong>{name}</strong>
            <p>{strategy}</p>
            <small>{items.filter((it) => quad(it) === i).map((it) => it.name).join("、") || "該当なし"}</small>
          </div>
        ))}
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

const TRI = ["一致", "不一致", "未確認"];
export function Triangulate({ page, storageKey }) {
  const [grid, setGrid] = useSaved(storageKey + ":grid", page.questions.map((q) => q.slice(1)));
  const verdict = (row) => (row.every((v) => v === "一致") ? ["確認済み", "ok"] : row.includes("不一致") ? ["条件差を確認", "bad"] : ["未確認あり", "warn"]);
  return (
    <Panel title="三者の説明を並べる">
      <div className="table-scroll">
        <table className="tri-table">
          <thead>
            <tr>
              <th>確認項目</th>
              {page.sources.map((s) => (
                <th key={s}>{s}</th>
              ))}
              <th>判定</th>
            </tr>
          </thead>
          <tbody>
            {page.questions.map(([q], i) => {
              const [label, tone] = verdict(grid[i]);
              return (
                <tr key={q}>
                  <th>{q}</th>
                  {grid[i].map((v, k) => (
                    <td key={k}>
                      <select value={v} aria-label={`${q}：${page.sources[k]}`} className={"tri-" + TRI.indexOf(v)} onChange={(e) => setGrid(grid.map((r, ri) => (ri === i ? r.map((x, ci) => (ci === k ? e.target.value : x)) : r)))}>
                        {TRI.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td>
                    <span className={"chain-badge " + tone}>{label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="inline-metrics">
        <Metric value={grid.filter((r) => verdict(r)[1] === "ok").length} label="三者一致の項目" />
        <Metric value={grid.filter((r) => r.includes("不一致")).length} label="不一致を含む項目" />
      </div>
      <Note>{page.note}</Note>
      <SavedNote storageKey={storageKey + ":memo"} label="不一致の理由として考えられる条件差" initial="夜間精度：A社は照明を増設済み。提案時の数値は増設後の環境か確認。" />
    </Panel>
  );
}

export function Concentration({ page, storageKey }) {
  const [shares, setShares] = useSaved(storageKey + ":shares", page.categories.map((c) => c[2]));
  return (
    <>
      <div className="conc-grid">
        {page.categories.map(([cat, partners], ci) => {
          const idx = hhi(shares[ci]);
          const tone = idx === null ? "" : idx >= 5000 ? "bad" : idx >= 2500 ? "warn" : "ok";
          return (
            <Panel key={cat} title={cat} aside={<span className={"chain-badge " + tone}>{idx === null ? "—" : fmt(idx, 0)}</span>}>
              {partners.map((pName, pi) => (
                <label className="share-row" key={pName}>
                  <span>{pName}</span>
                  <input type="number" min="0" max="100" value={shares[ci][pi]} aria-label={`${cat}：${pName}のシェア`} onChange={(e) => setShares(shares.map((s, i) => (i === ci ? s.map((v, j) => (j === pi ? e.target.value : v)) : s)))} />
                  <span className="share-bar">
                    <span style={{ width: Math.min(100, +shares[ci][pi] || 0) + "%" }} />
                  </span>
                </label>
              ))}
              <p className="muted">
                {idx === null ? "シェアを入力してください。" : idx >= 5000 ? "一社依存に近い状態です。" : idx >= 2500 ? "集中が高い領域です。" : "分散しています。"}
              </p>
            </Panel>
          );
        })}
      </div>
      <button className="text-link" onClick={() => setShares(page.categories.map((c) => c[2]))}>
        <RotateCcw size={15} /> 初期のシェアに戻す
      </button>
      <Note>{page.note}</Note>
    </>
  );
}

export function Split({ page, storageKey }) {
  const [values, setValues] = useSaved(storageKey + ":values", page.values);
  const ok = values.every(isNum);
  const [oc, pc, ob, pb] = values.map(Number);
  const costShare = oc + pc > 0 ? (oc / (oc + pc)) * 100 : null;
  const benefitShare = ob + pb > 0 ? (ob / (ob + pb)) * 100 : null;
  const gap = costShare !== null && benefitShare !== null ? benefitShare - costShare : null;
  return (
    <div className="two-column calculator-layout">
      <Panel title="負担と成果の見込み">
        {page.labels.map((label, i) => (
          <NumberField key={label} label={label} value={values[i]} onChange={(v) => setValues(values.map((x, j) => (i === j ? v : x)))} />
        ))}
        <ResetLink onClick={() => setValues(page.values)} />
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">BALANCE / 分担の釣り合い</div>
        {ok && gap !== null ? (
          <>
            <output className="calc-value">{gap > 0 ? "+" : ""}{fmt(gap, 0)}</output>
            <h2>pt ＝ 自社の成果率 − 自社の負担率</h2>
            <div className="split-bars">
              {[
                ["負担", costShare],
                ["成果", benefitShare],
              ].map(([label, v]) => (
                <div key={label} className="split-row">
                  <span>{label}</span>
                  <div className="split-track">
                    <span className="mine" style={{ width: v + "%" }}>
                      自社 {fmt(v, 0)}%
                    </span>
                    <span className="theirs">パートナー {fmt(100 - v, 0)}%</span>
                  </div>
                </div>
              ))}
            </div>
            <Note warning={Math.abs(gap) > 15}>
              {Math.abs(gap) <= 15
                ? "負担と成果の割合はおおむね釣り合っています。"
                : gap > 0
                  ? "自社が負担以上の成果を得る想定です。パートナー側の成果（参照事例・製品化）を明示しないと合意が続きません。"
                  : "自社の負担が成果を上回る想定です。負担の見直しか、成果の再定義を話します。"}
            </Note>
          </>
        ) : (
          <p role="status">4つの金額を0以上で入力してください（合計が0の項目は計算できません）。</p>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}

export function Bipartite({ page, storageKey }) {
  const [tech, setTech] = useSaved(storageKey + ":tech", null);
  const H = 40 + Math.max(page.partners.length, page.techs.length) * 44;
  const yP = (i) => 30 + i * 44,
    yT = (i) => 30 + i * 44;
  const counts = page.techs.map((_, t) => page.edges.filter((e) => e[1] === t).length);
  const linked = (e) => tech === null || e[1] === tech;
  return (
    <div className="two-column">
      <Panel title="つながりの図">
        <svg className="bipartite" viewBox={`0 0 640 ${H}`} role="img" aria-label="パートナーと技術のつながり">
          {page.edges.map(([p, t], i) => (
            <line key={i} x1="200" y1={yP(p)} x2="440" y2={yT(t)} className={linked([p, t]) ? "on" : "off"} />
          ))}
          {page.partners.map((name, i) => (
            <g key={name}>
              <circle cx="200" cy={yP(i)} r="7" className={tech === null || page.edges.some((e) => e[0] === i && e[1] === tech) ? "on" : "off"} />
              <text x="188" y={yP(i) + 4} textAnchor="end">
                {name}
              </text>
            </g>
          ))}
          {page.techs.map((name, i) => (
            <g key={name} className="tech-node" onClick={() => setTech(tech === i ? null : i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setTech(tech === i ? null : i)} aria-pressed={tech === i}>
              <circle cx="440" cy={yT(i)} r="7" className={tech === i ? "picked" : counts[i] === 0 ? "gap" : counts[i] === 1 ? "single" : ""} />
              <text x="454" y={yT(i) + 4}>
                {name} <tspan className="muted-text">（{counts[i]}社）</tspan>
              </text>
            </g>
          ))}
        </svg>
        <p className="muted">右側の技術を選ぶと、持っている企業だけを強調します。橙＝1社のみ、灰＝該当なし。</p>
      </Panel>
      <Panel title="空白と一社依存">
        <div className="inline-metrics">
          <Metric value={counts.filter((c) => c === 0).length} label="持つ企業がない技術" />
          <Metric value={counts.filter((c) => c === 1).length} label="1社しか持たない技術" />
        </div>
        <ul className="plain-list">
          {page.techs.map((t, i) => (
            <li key={t}>
              {t}：{counts[i] === 0 ? "探索の空白" : counts[i] === 1 ? `${page.partners[page.edges.find((e) => e[1] === i)[0]]} のみ` : `${counts[i]}社`}
            </li>
          ))}
        </ul>
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

const RULES = [
  ["現状を数値で示している", (t) => /\d/.test(t), "件数・時間・割合など、今の状態を数字で書きます。"],
  ["制約・条件を書いている", (t) => /(夜間|条件|以内|以下|以上|環境|制約|時間帯|温度|照明)/.test(t), "夜間・温度・時間帯など、現場の条件を書きます。"],
  ["成功の判定基準がある", (t) => /(判定|基準|以下|以上|%|％|達成)/.test(t), "何をもって成功とするかを数値や条件で書きます。"],
  ["判断する人が書かれている", (t) => /(担当|責任者|判断|部門|チーム|管理)/.test(t), "誰が結果を評価し採否を決めるかを書きます。"],
  ["解決手段を決めつけていない", (t) => !/(を導入|を購入|AIを使|カメラを|ロボットを導入)/.test(t), "「〜を導入」は手段の指定です。困っている状態を書きます。"],
];
export function BriefLint({ page, storageKey }) {
  const [text, setText] = useSaved(storageKey + ":text", page.text);
  const results = RULES.map(([name, test, hint]) => ({ name, pass: test(text), hint }));
  const passed = results.filter((r) => r.pass).length;
  return (
    <div className="two-column">
      <Panel title="課題文（編集できます）">
        <textarea rows={7} value={text} onChange={(e) => setText(e.target.value)} aria-label="課題文" />
        <button className="text-link" onClick={() => setText(page.text)}>
          <RotateCcw size={15} /> サンプルに戻す
        </button>
        <Note>{page.note}</Note>
      </Panel>
      <Panel title="点検結果" aside={<span className={"badge " + (passed < 4 ? "warning" : "")}>{passed} / {RULES.length}</span>}>
        <ul className="lint-list">
          {results.map((r) => (
            <li key={r.name} className={r.pass ? "pass" : "fail"}>
              {r.pass ? <Check size={16} /> : <AlertTriangle size={16} />}
              <div>
                <strong>{r.name}</strong>
                {!r.pass && <small>{r.hint}</small>}
              </div>
            </li>
          ))}
        </ul>
        <p className="muted">語の有無で判定する簡易ルールです。文章の質は最終的に人が読んで確かめます。</p>
      </Panel>
    </div>
  );
}

export function SampleSize({ page, storageKey }) {
  const [values, setValues] = useSaved(storageKey + ":values", page.values);
  const [base, delta] = values.map(Number);
  const n = values.every(isNum) ? sampleSize(base, delta) : null;
  const table = [1, 2, 3, 5].map((d) => [d, values.every(isNum) ? sampleSize(base, d) : null]);
  return (
    <div className="two-column calculator-layout">
      <Panel title="確かめたい差">
        {page.labels.map((label, i) => (
          <NumberField key={label} label={label} value={values[i]} onChange={(v) => setValues(values.map((x, j) => (i === j ? v : x)))} />
        ))}
        <ResetLink onClick={() => setValues(page.values)} />
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">SAMPLE / 1群あたりの必要件数</div>
        {n ? (
          <>
            <output className="calc-value">{fmt(n, 0)}</output>
            <h2>件 × 2群（現状と新方式）</h2>
            <div className="calc-secondary">
              {table.map(([d, v]) => (
                <div key={d}>
                  <span>改善幅 {d}pt なら</span>
                  <strong>{v ? fmt(v, 0) + "件" : "—"}</strong>
                </div>
              ))}
            </div>
            <div className="formula">
              <h3>計算式</h3>
              <p>n ＝ 2 × (1.96 ＋ 0.84)² × p̄(1−p̄) ÷ (p₂−p₁)²</p>
            </div>
          </>
        ) : (
          <p role="status">正解率は0〜100の間、改善幅は0以外で、合計が100%を超えないようにしてください。</p>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}

export function Pricing({ page, storageKey }) {
  const [volume, setVolume] = useSaved(storageKey + ":volume", page.volume);
  const [models, setModels] = useSaved(storageKey + ":models", page.models.map(([name, fixed, unit]) => ({ name, fixed: +fixed, unit: +unit })));
  const cost = (m, v) => m.fixed + m.unit * v;
  const maxV = 20;
  const maxC = Math.max(...models.map((m) => cost(m, maxV)), 1);
  const at = models.map((m) => cost(m, +volume));
  const best = at.indexOf(Math.min(...at));
  return (
    <div className="two-column">
      <Panel title="料金モデルの条件">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>モデル</th>
                <th>固定費（万円/年）</th>
                <th>台数単価（万円/年）</th>
                <th>{volume}台の年間費用</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <tr key={m.name} className={best === i ? "best" : ""}>
                  <th>{m.name}</th>
                  {["fixed", "unit"].map((k) => (
                    <td key={k}>
                      <input type="number" min="0" value={m[k]} aria-label={`${m.name}の${k === "fixed" ? "固定費" : "単価"}`} onChange={(e) => setModels(models.map((x, j) => (i === j ? { ...x, [k]: +e.target.value || 0 } : x)))} />
                    </td>
                  ))}
                  <td>
                    <strong>{fmt(at[i], 0)}万円</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label className="field">
          想定台数 {volume}台
          <input type="range" min="1" max={maxV} value={volume} onChange={(e) => setVolume(+e.target.value)} aria-label="想定台数" />
        </label>
        <button className="text-link" onClick={() => { setVolume(page.volume); setModels(page.models.map(([name, fixed, unit]) => ({ name, fixed: +fixed, unit: +unit }))); }}>
          <RotateCcw size={15} /> 初期の条件に戻す
        </button>
      </Panel>
      <Panel title="台数と年間費用">
        <svg className="pricing-svg" viewBox="-10 -10 440 260" role="img" aria-label="台数ごとの年間費用">
          <line x1="0" y1="220" x2="400" y2="220" className="axis" />
          <line x1="0" y1="0" x2="0" y2="220" className="axis" />
          {models.map((m, i) => (
            <polyline key={m.name} className={"m" + i} points={[0, maxV].map((v) => `${(v / maxV) * 400},${220 - (cost(m, v) / maxC) * 210}`).join(" ")} />
          ))}
          <line x1={(volume / maxV) * 400} x2={(volume / maxV) * 400} y1="0" y2="220" className="marker" />
          <text x="400" y="240" textAnchor="end">
            {maxV}台
          </text>
          <text x="0" y="240">
            0台
          </text>
        </svg>
        <ul className="legend">
          {models.map((m, i) => (
            <li key={m.name} className={"m" + i}>
              {m.name}
            </li>
          ))}
        </ul>
        <Note>
          {volume}台では<strong>{models[best].name}</strong>が最も低い（{fmt(at[best], 0)}万円/年）。
        </Note>
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

const MS = { pending: ["判定待ち", "warn"], pass: ["達成", "ok"], fail: ["未達", "bad"] };
export function MilestonePay({ page, storageKey }) {
  const [status, setStatus] = useSaved(storageKey + ":status", page.milestones.map((m) => m[3]));
  const firstFail = status.indexOf("fail");
  const rows = page.milestones.map(([name, criteria, amount], i) => {
    const blocked = firstFail !== -1 && i > firstFail;
    const paid = status[i] === "pass" && !blocked;
    return { name, criteria, amount: +amount, blocked, paid };
  });
  const paid = rows.filter((r) => r.paid).reduce((s, r) => s + r.amount, 0);
  const held = rows.filter((r) => !r.paid).reduce((s, r) => s + r.amount, 0);
  return (
    <>
      <div className="inline-metrics">
        <Metric value={fmt(paid, 0) + "万円"} label="支払い済み" />
        <Metric value={fmt(held, 0) + "万円"} label="保留中" />
        <Metric value={fmt((paid / (paid + held)) * 100, 0) + "%"} label="支払い済みの割合" />
      </div>
      <Panel title="マイルストーンと受入基準">
        <ol className="milestone-list">
          {rows.map((r, i) => (
            <li key={r.name} className={r.blocked ? "blocked" : status[i]}>
              <span className="chain-index">M{i + 1}</span>
              <div>
                <strong>{r.name}</strong>
                <small>基準：{r.criteria}</small>
              </div>
              <strong className="amount">{fmt(r.amount, 0)}万円</strong>
              <select value={status[i]} aria-label={`${r.name}の判定`} disabled={r.blocked} onChange={(e) => setStatus(status.map((s, j) => (i === j ? e.target.value : s)))}>
                {Object.entries(MS).map(([k, [v]]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <span className={"chain-badge " + (r.blocked ? "bad" : MS[status[i]][1])}>{r.blocked ? "前段の未達で保留" : r.paid ? "支払い" : MS[status[i]][0]}</span>
            </li>
          ))}
        </ol>
        {firstFail !== -1 && (
          <Note warning>
            M{firstFail + 1}が未達のため、以降の支払いは保留です。基準の見直しか、再実証の条件を合意します。
          </Note>
        )}
        <Note>{page.note}</Note>
      </Panel>
    </>
  );
}
