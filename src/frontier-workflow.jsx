import React, { useState } from "react";
import { Plus, X, ArrowUp, ArrowDown, AlertTriangle, Check, RotateCcw } from "lucide-react";
import { Panel, Note, Metric, SavedNote, NumberField, useSaved, fmt, isNum } from "./frontier-shared";
import { pathMetrics, heijunka, busFactor, sequenceDiff } from "./models";

export function Sipoc({ page, storageKey }) {
  const [cols, setCols] = useSaved(storageKey + ":cols", page.columns);
  const [draft, setDraft] = useState({});
  const names = Object.keys(page.columns);
  const add = (c) => {
    const v = (draft[c] || "").trim();
    if (!v) return;
    setCols({ ...cols, [c]: [...cols[c], v] });
    setDraft({ ...draft, [c]: "" });
  };
  const lint = [
    ["供給者と入力の両方がある", cols.供給者.length > 0 && cols.入力.length > 0],
    ["工程が5〜7個の粗い粒度", cols.工程.length >= 5 && cols.工程.length <= 7],
    ["出力ごとに受け取る顧客がいる", cols.出力.length > 0 && cols.顧客.length > 0],
    ["制約が書かれている", cols.制約.length > 0],
    ["測定が少なくとも1つある", cols.測定.length > 0],
  ];
  return (
    <>
      <div className="experiment-hypothesis">
        <div className="eyebrow">PROCESS / 対象の業務</div>
        <h2>{page.process}</h2>
      </div>
      <div className="sipoc-board">
        {names.map((c) => (
          <div key={c} className={"sipoc-col " + (c === "工程" ? "process" : "")}>
            <h3>
              {c} <span>{cols[c].length}</span>
            </h3>
            <ul>
              {cols[c].map((v, i) => (
                <li key={v + i}>
                  {c === "工程" && <span className="chain-index">{i + 1}</span>}
                  {v}
                  <button className="icon-button" aria-label={`${v}を削除`} onClick={() => setCols({ ...cols, [c]: cols[c].filter((_, j) => j !== i) })}>
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="sipoc-add">
              <input value={draft[c] || ""} placeholder="追加…" aria-label={`${c}に追加`} onChange={(e) => setDraft({ ...draft, [c]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add(c)} />
              <button className="icon-button" aria-label={`${c}に追加する`} onClick={() => add(c)}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="two-column">
        <Panel title="抜けの点検">
          <ul className="lint-list">
            {lint.map(([name, ok]) => (
              <li key={name} className={ok ? "pass" : "fail"}>
                {ok ? <Check size={16} /> : <AlertTriangle size={16} />}
                <div>
                  <strong>{name}</strong>
                </div>
              </li>
            ))}
          </ul>
          <button className="text-link" onClick={() => setCols(page.columns)}>
            <RotateCcw size={15} /> 初期の内容に戻す
          </button>
        </Panel>
        <Panel title="使い方">
          <Note>{page.note}</Note>
          <SavedNote storageKey={storageKey + ":memo"} label="測定の候補" initial="1件あたりの処置所要時間、再測定依頼の件数、ロットの待機時間。" />
        </Panel>
      </div>
    </>
  );
}

export function Spaghetti({ page, storageKey }) {
  const [stations, setStations] = useSaved(storageKey + ":stations", page.stations.map(([name, x, y]) => ({ name, x: +x, y: +y })));
  const [seq, setSeq] = useSaved(storageKey + ":seq", page.sequence);
  const pts = seq.map((i) => [stations[i].x, stations[i].y]);
  const m = pathMetrics(pts);
  const base = pathMetrics(page.sequence.map((i) => [+page.stations[i][1], +page.stations[i][2]]));
  const move = (k, d) => {
    const n = [...seq],
      t = k + d;
    if (t < 0 || t >= n.length) return;
    [n[k], n[t]] = [n[t], n[k]];
    setSeq(n);
  };
  const cell = 60;
  return (
    <div className="two-column">
      <Panel title="経路図（1マス {page.unit}m）">
        <svg className="spaghetti-svg" viewBox={`0 0 ${cell * 11} ${cell * 8}`} role="img" aria-label="移動経路の図">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={"v" + i} x1={i * cell} x2={i * cell} y1="0" y2={cell * 8} className="grid" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={"h" + i} y1={i * cell} y2={i * cell} x1="0" x2={cell * 11} className="grid" />
          ))}
          <polyline points={pts.map(([x, y]) => `${x * cell + cell / 2},${y * cell + cell / 2}`).join(" ")} />
          {stations.map((s, i) => (
            <g key={s.name}>
              <rect x={s.x * cell + 6} y={s.y * cell + 6} width={cell - 12} height={cell - 12} rx="8" />
              <text x={s.x * cell + cell / 2} y={s.y * cell + cell / 2 + 4} textAnchor="middle">
                {s.name}
              </text>
            </g>
          ))}
          {pts.map(([x, y], k) => (
            <text key={k} className="step-no" x={x * cell + cell - 12} y={y * cell + 16 + (k % 3) * 11}>
              {k + 1}
            </text>
          ))}
        </svg>
        <div className="inline-metrics">
          <Metric value={fmt(m.distance * page.unit, 1) + "m"} label="1件あたりの移動距離" />
          <Metric value={m.crossings} label="経路の交差" />
          <Metric value={(m.distance - base.distance) * page.unit <= 0 ? "−" + fmt((base.distance - m.distance) * page.unit, 1) + "m" : "+" + fmt((m.distance - base.distance) * page.unit, 1) + "m"} label="初期配置との差" />
        </div>
      </Panel>
      <Panel title="順番と配置を変える">
        <h3 className="sub-heading">移動の順番</h3>
        <ol className="path-list">
          {seq.map((i, k) => (
            <li key={k}>
              <span className="chain-index">{k + 1}</span>
              <div>
                <strong>{stations[i].name}</strong>
              </div>
              <div className="button-row compact-row">
                <button className="icon-button" aria-label="上へ" onClick={() => move(k, -1)}>
                  <ArrowUp size={15} />
                </button>
                <button className="icon-button" aria-label="下へ" onClick={() => move(k, 1)}>
                  <ArrowDown size={15} />
                </button>
              </div>
            </li>
          ))}
        </ol>
        <h3 className="sub-heading">設備の位置</h3>
        <ul className="station-list">
          {stations.map((s, i) => (
            <li key={s.name}>
              <span>{s.name}</span>
              <label>
                x
                <input type="number" min="0" max="10" value={s.x} aria-label={`${s.name}のx`} onChange={(e) => setStations(stations.map((t, j) => (i === j ? { ...t, x: Math.max(0, Math.min(10, +e.target.value)) } : t)))} />
              </label>
              <label>
                y
                <input type="number" min="0" max="7" value={s.y} aria-label={`${s.name}のy`} onChange={(e) => setStations(stations.map((t, j) => (i === j ? { ...t, y: Math.max(0, Math.min(7, +e.target.value)) } : t)))} />
              </label>
            </li>
          ))}
        </ul>
        <button className="text-link" onClick={() => { setSeq(page.sequence); setStations(page.stations.map(([name, x, y]) => ({ name, x: +x, y: +y }))); }}>
          <RotateCcw size={15} /> 初期の配置に戻す
        </button>
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function Heijunka({ page, storageKey }) {
  const [demands, setDemands] = useSaved(storageKey + ":demands", page.demands);
  const [capacity, setCapacity] = useSaved(storageKey + ":capacity", page.capacity);
  const r = demands.every(isNum) && isNum(capacity) ? heijunka(demands, +capacity) : null;
  const max = Math.max(...demands.map(Number), +capacity || 0, 1);
  return (
    <div className="two-column calculator-layout">
      <Panel title="曜日ごとの依頼件数">
        {page.days.map((d, i) => (
          <NumberField key={d} label={`${d}曜日（件）`} value={demands[i]} onChange={(v) => setDemands(demands.map((x, j) => (i === j ? v : x)))} />
        ))}
        <NumberField label="1日に処理できる件数" value={capacity} onChange={setCapacity} />
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">LEVELING / 平準化</div>
        {r ? (
          <>
            <output className="calc-value">{fmt(r.level, 1)}</output>
            <h2>件/日 に平準化（ピーク {r.peak}件）</h2>
            <div className="level-chart" role="img" aria-label="曜日ごとの依頼と処理能力">
              <div className="level-line" style={{ bottom: `${(+capacity / max) * 100}%` }}>
                <span>能力 {capacity}</span>
              </div>
              <div className="level-line target" style={{ bottom: `${(r.level / max) * 100}%` }}>
                <span>平準 {fmt(r.level, 1)}</span>
              </div>
              {demands.map((n, i) => (
                <div key={i} className="level-col">
                  <span className={"level-bar " + (+n > +capacity ? "over" : "")} style={{ height: `${(+n / max) * 100}%` }} />
                  <small>{page.days[i]}</small>
                </div>
              ))}
            </div>
            <div className="calc-secondary">
              <div>
                <span>能力を超える日</span>
                <strong>{r.overCapacityDays}日</strong>
              </div>
              <div>
                <span>平準化に必要な緩衝</span>
                <strong>{r.buffer}件（前倒し・繰越の上限）</strong>
              </div>
            </div>
            <Note warning={!r.levelFits}>
              {r.levelFits
                ? `平準化すれば能力内で回ります。月曜の超過分は前週末までの前倒しか、繰越の上限${r.buffer}件で吸収します。`
                : "平準化しても能力を超えます。処理能力の増強か、依頼そのものの削減が必要です。"}
            </Note>
          </>
        ) : (
          <p role="status">件数と能力を0以上で入力してください。</p>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}

export function BusFactor({ page, storageKey }) {
  const [matrix, setMatrix] = useSaved(storageKey + ":matrix", page.tasks.map((t) => t[1].map(Boolean)));
  const [plan, setPlan] = useSaved(storageKey + ":plan", []);
  const effective = matrix.map((row, t) => row.map((v, p) => v || plan.some(([pt, pp]) => pt === t && pp === p)));
  const now = busFactor(matrix),
    after = busFactor(effective);
  const toggle = (t, p) => setMatrix(matrix.map((row, i) => (i === t ? row.map((v, j) => (j === p ? !v : v)) : row)));
  const togglePlan = (t, p) => setPlan(plan.some(([a, b]) => a === t && b === p) ? plan.filter(([a, b]) => !(a === t && b === p)) : [...plan, [t, p]]);
  return (
    <div className="two-column">
      <Panel title="作業 × 担当者（できる人に印）">
        <div className="table-scroll">
          <table className="bus-table">
            <thead>
              <tr>
                <th>作業</th>
                {page.people.map((p) => (
                  <th key={p}>{p}</th>
                ))}
                <th>係数</th>
              </tr>
            </thead>
            <tbody>
              {page.tasks.map(([name], t) => (
                <tr key={name} className={after.counts[t] <= 1 ? "risk" : ""}>
                  <th>{name}</th>
                  {page.people.map((p, pi) => {
                    const planned = plan.some(([a, b]) => a === t && b === pi);
                    return (
                      <td key={p}>
                        <button
                          className={"bus-cell " + (matrix[t][pi] ? "know" : planned ? "planned" : "")}
                          aria-label={`${name}：${p}`}
                          aria-pressed={matrix[t][pi]}
                          onClick={() => {
                            if (matrix[t][pi]) toggle(t, pi);
                            else if (planned) {
                              togglePlan(t, pi);
                              toggle(t, pi);
                            } else togglePlan(t, pi);
                          }}
                        >
                          {matrix[t][pi] ? "●" : planned ? "訓練" : ""}
                        </button>
                      </td>
                    );
                  })}
                  <td>
                    <strong>{now.counts[t]}</strong>
                    {after.counts[t] !== now.counts[t] && <small> → {after.counts[t]}</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">セルをクリックするごとに、空欄 → 訓練予定 → できる（●）→ 空欄 と切り替わります。</p>
      </Panel>
      <Panel title="チーム全体の係数">
        <div className="inline-metrics">
          <Metric value={now.factor} label="現在（最小の人数）" tone={now.factor <= 1 ? "bad" : ""} />
          <Metric value={after.factor} label="訓練後の見込み" />
          <Metric value={plan.length} label="訓練の予定" />
        </div>
        <Note warning={now.factor <= 1}>
          {now.factor <= 1
            ? `係数1の作業：${page.tasks.filter((_, t) => now.counts[t] <= 1).map((t) => t[0]).join("、")}。担当者の不在で止まります。`
            : "すべての作業に2人以上の担当がいます。"}
        </Note>
        <Note>{page.note}</Note>
        <SavedNote storageKey={storageKey + ":memo"} label="訓練の進め方" initial="規格外れロットの処置判断：佐藤の判断を3件同席で観察し、判断基準を暗黙知インタビューに記録する。" />
      </Panel>
    </div>
  );
}

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export function DayLog({ page, storageKey }) {
  const [batch, setBatch] = useSaved(storageKey + ":batch", false);
  const blocks = page.blocks.map(([start, minutes, type]) => ({ start: toMin(start), minutes: +minutes, type }));
  const applied = batch
    ? (() => {
        const interrupts = blocks.filter((b) => b.type === "割り込み");
        const total = interrupts.reduce((s, b) => s + b.minutes, 0);
        const rest = blocks.filter((b) => b.type !== "割り込み").map((b) => (b.type === "作業" ? { ...b } : b));
        // 割り込みを窓口時間へ集約し、空いた時間は前の作業に連結する
        const merged = [];
        rest.forEach((b) => {
          const last = merged[merged.length - 1];
          if (last && last.type === "作業" && b.type === "作業" && last.start + last.minutes >= b.start - 20) last.minutes += b.minutes;
          else merged.push({ ...b });
        });
        merged.push({ start: toMin(page.window), minutes: total, type: "割り込み", window: true });
        return merged.sort((a, b) => a.start - b.start);
      })()
    : blocks;
  const focus = applied.filter((b) => b.type === "作業");
  const longest = Math.max(...focus.map((b) => b.minutes));
  const interruptions = applied.filter((b) => b.type === "割り込み").length;
  const dayStart = 9 * 60,
    dayEnd = 16 * 60;
  return (
    <>
      <Panel
        title="1日の記録"
        aside={
          <label className="check-row inline">
            <input type="checkbox" checked={batch} onChange={() => setBatch(!batch)} />
            <span>問い合わせを{page.window}の窓口時間に集約する</span>
          </label>
        }
      >
        <div className="daylog" role="img" aria-label="1日の作業と割り込み">
          {applied.map((b, i) => (
            <span
              key={i}
              className={"day-block " + b.type + (b.window ? " window" : "")}
              style={{ left: `${((b.start - dayStart) / (dayEnd - dayStart)) * 100}%`, width: `${(b.minutes / (dayEnd - dayStart)) * 100}%` }}
              title={`${b.type} ${b.minutes}分`}
            >
              {b.minutes >= 25 && b.minutes}
            </span>
          ))}
          <div className="day-ticks">
            {[9, 10, 11, 12, 13, 14, 15, 16].map((h) => (
              <small key={h} style={{ left: `${((h * 60 - dayStart) / (dayEnd - dayStart)) * 100}%` }}>
                {h}:00
              </small>
            ))}
          </div>
        </div>
        <div className="inline-metrics">
          <Metric value={longest + "分"} label="最長の連続作業" />
          <Metric value={interruptions + "回"} label="割り込みの回数" />
          <Metric value={focus.filter((b) => b.minutes >= 45).length} label="45分以上の集中ブロック" />
        </div>
        <Note>{page.note}</Note>
      </Panel>
    </>
  );
}

export function FieldAudit({ page, storageKey }) {
  const [fields, setFields] = useSaved(
    storageKey + ":fields",
    page.fields.map(([name, req, fill, uses]) => ({ name, req, fill: +fill, uses: uses.split(",").map((v) => v === "1") })),
  );
  const unusedRequired = fields.filter((f) => f.req === "必須" && !f.uses.some(Boolean));
  const lowFill = fields.filter((f) => f.req === "必須" && f.fill < 70);
  const usedOptional = fields.filter((f) => f.req === "任意" && f.uses.filter(Boolean).length >= 2);
  return (
    <div className="two-column">
      <Panel title="項目 × 後工程での利用">
        <div className="table-scroll">
          <table className="field-table">
            <thead>
              <tr>
                <th>項目</th>
                <th>区分</th>
                <th>入力率</th>
                {page.uses.map((u) => (
                  <th key={u}>{u}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => (
                <tr key={f.name} className={unusedRequired.includes(f) ? "risk" : ""}>
                  <th>{f.name}</th>
                  <td>
                    <button className={"badge toggle " + (f.req === "必須" ? "warning" : "")} onClick={() => setFields(fields.map((x, j) => (i === j ? { ...x, req: x.req === "必須" ? "任意" : "必須" } : x)))}>
                      {f.req}
                    </button>
                  </td>
                  <td>{f.fill}%</td>
                  {f.uses.map((u, k) => (
                    <td key={k}>
                      <input type="checkbox" aria-label={`${f.name}：${page.uses[k]}`} checked={u} onChange={() => setFields(fields.map((x, j) => (i === j ? { ...x, uses: x.uses.map((v, l) => (l === k ? !v : v)) } : x)))} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">区分をクリックすると必須と任意を切り替えます。</p>
      </Panel>
      <Panel title="見直しの候補">
        <div className="inline-metrics">
          <Metric value={unusedRequired.length} label="使われない必須項目" tone={unusedRequired.length ? "bad" : ""} />
          <Metric value={lowFill.length} label="入力率70%未満の必須項目" />
          <Metric value={usedOptional.length} label="よく使われる任意項目" />
        </div>
        <ul className="plain-list">
          {unusedRequired.map((f) => (
            <li key={f.name}>{f.name}：どこにも使われていません。削除か任意化の候補。</li>
          ))}
          {lowFill.map((f) => (
            <li key={f.name}>{f.name}：必須なのに入力率{f.fill}%。実態は任意か、入力しづらい項目です。</li>
          ))}
          {usedOptional.map((f) => (
            <li key={f.name}>{f.name}：任意ですが{f.uses.filter(Boolean).length}工程で使われています。必須化の候補。</li>
          ))}
        </ul>
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function Approvals({ page, storageKey }) {
  const [steps, setSteps] = useSaved(storageKey + ":steps", page.steps.map(([role, days, rate]) => ({ role, days: +days, rate: rate === "—" ? null : +rate, skip: false })));
  const total = steps.reduce((s, st) => s + st.days, 0);
  const after = steps.filter((s) => !s.skip).reduce((s, st) => s + st.days, 0);
  const rubber = steps.filter((s) => s.rate !== null && s.rate < 5);
  return (
    <div className="two-column">
      <Panel title="承認の連なり">
        <ol className="approval-chain">
          {steps.map((s, i) => (
            <li key={s.role} className={(s.skip ? "skip " : "") + (s.rate !== null && s.rate < 5 ? "rubber" : "")}>
              <span className="chain-index">{i + 1}</span>
              <div>
                <strong>{s.role}</strong>
                <small>
                  待ち {s.days}日 · 差戻し・修正率 {s.rate === null ? "—" : s.rate + "%"}
                </small>
              </div>
              {s.rate !== null && (
                <label className="check-row inline">
                  <input type="checkbox" checked={s.skip} onChange={() => setSteps(steps.map((x, j) => (i === j ? { ...x, skip: !x.skip } : x)))} />
                  <span>省いてみる</span>
                </label>
              )}
              <label className="rate-input">
                率
                <input type="number" min="0" max="100" value={s.rate ?? ""} disabled={s.rate === null} aria-label={`${s.role}の差戻し率`} onChange={(e) => setSteps(steps.map((x, j) => (i === j ? { ...x, rate: +e.target.value } : x)))} />
                %
              </label>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel title="段数を減らしたとき">
        <div className="inline-metrics">
          <Metric value={total + "日"} label="現在の所要日数" />
          <Metric value={after + "日"} label="省いた後" />
          <Metric value={rubber.length} label="差戻し率5%未満の段" tone={rubber.length ? "bad" : ""} />
        </div>
        {rubber.length > 0 && (
          <Note warning>
            {rubber.map((r) => r.role).join("、")}は、ほぼ差戻しのない承認です。金額のしきい値や事後確認への置き換えを検討します。
          </Note>
        )}
        <Note>{page.note}</Note>
        <SavedNote storageKey={storageKey + ":memo"} label="省く条件" initial="部長承認：100万円未満は課長承認で完了とし、月次で部長へ一覧報告する。" />
      </Panel>
    </div>
  );
}

export function Conformance({ page, storageKey }) {
  const [actual, setActual] = useSaved(storageKey + ":actual", page.actual);
  const seq = actual.split(/[、,]/).map((s) => s.trim()).filter(Boolean);
  const r = sequenceDiff(page.standard, seq);
  return (
    <div className="two-column">
      <Panel title="標準手順と実際の記録">
        <p className="muted">標準：{page.standard.join(" → ")}</p>
        <label className="field">
          実際の記録（読点区切り）
          <textarea rows={3} value={actual} onChange={(e) => setActual(e.target.value)} />
        </label>
        <button className="text-link" onClick={() => setActual(page.actual)}>
          <RotateCcw size={15} /> サンプルに戻す
        </button>
      </Panel>
      <Panel title="適合の結果">
        <div className="inline-metrics">
          <Metric value={r.skipped} label="飛ばした手順" tone={r.skipped ? "bad" : ""} />
          <Metric value={r.extra} label="増えた手順" />
          <Metric value={r.ops.filter((o) => o.type === "match").length} label="一致した手順" />
        </div>
        <ol className="conform-list">
          {r.ops.map((o, i) => (
            <li key={i} className={o.type}>
              <span className="chain-index">{o.type === "match" ? "＝" : o.type === "skipped" ? "−" : "＋"}</span>
              {o.step}
              <small>{o.type === "match" ? "一致" : o.type === "skipped" ? "標準にあるが記録にない" : "記録にあるが標準にない"}</small>
            </li>
          ))}
        </ol>
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function Blueprint({ page, storageKey }) {
  const [flags, setFlags] = useSaved(storageKey + ":flags", page.flags);
  const toggle = (k) => setFlags(flags.includes(k) ? flags.filter((f) => f !== k) : [...flags, k]);
  const perLayer = page.layers.map((_, l) => flags.filter((f) => +f.split(",")[1] === l).length);
  return (
    <>
      <Panel title="層ごとに描く">
        <div className="blueprint" style={{ "--cols": page.steps.length }}>
          <div className="bp-corner" />
          {page.steps.map((s) => (
            <div key={s} className="bp-step">
              {s}
            </div>
          ))}
          {page.layers.map((layer, l) => (
            <React.Fragment key={layer}>
              <div className={"bp-layer " + (l === 1 ? "visibility" : "")}>
                {layer}
                {l === 1 && <small>── 可視線 ──</small>}
              </div>
              {page.steps.map((_, s) => {
                const k = `${s},${l}`;
                return (
                  <button key={k} className={"bp-cell " + (flags.includes(k) ? "flag" : "")} onClick={() => toggle(k)} aria-pressed={flags.includes(k)} aria-label={`${page.steps[s]}：${layer}`}>
                    {page.cells[s][l]}
                    {flags.includes(k) && <AlertTriangle size={13} />}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <p className="muted">箱をクリックすると「問題あり」の印が付きます。可視線より下は利用者に見えない作業です。</p>
      </Panel>
      <div className="two-column">
        <Panel title="問題の所在">
          <div className="inline-metrics">
            {page.layers.map((layer, l) => (
              <Metric key={layer} value={perLayer[l]} label={layer} />
            ))}
          </div>
          <Note warning={perLayer[2] + perLayer[3] > perLayer[0] + perLayer[1]}>
            {perLayer[2] + perLayer[3] > perLayer[0] + perLayer[1]
              ? "問題の多くは可視線の下にあります。利用者には見えないため、待ち時間の理由が伝わっていません。"
              : "問題は主に利用者に見える層にあります。案内や通知の改善が効きます。"}
          </Note>
        </Panel>
        <Panel title="メモ">
          <Note>{page.note}</Note>
          <SavedNote storageKey={storageKey + ":memo"} label="裏側の作業を見える形にする案" initial="装置設定の検証中は「確認中（装置検証）」と状況を表示し、目安日数を添える。" />
        </Panel>
      </div>
    </>
  );
}

export function Terms({ page, storageKey }) {
  const [same, setSame] = useSaved(storageKey + ":same", page.terms.map(() => null));
  const conflicts = same.filter((s) => s === false).length;
  return (
    <div className="two-column">
      <Panel title="部門ごとの意味">
        <div className="table-scroll">
          <table className="terms-table">
            <thead>
              <tr>
                <th>用語</th>
                {page.depts.map((d) => (
                  <th key={d}>{d}</th>
                ))}
                <th>判定</th>
              </tr>
            </thead>
            <tbody>
              {page.terms.map(([term, ...defs], i) => (
                <tr key={term} className={same[i] === false ? "risk" : ""}>
                  <th>{term}</th>
                  {defs.map((d, k) => (
                    <td key={k}>{d}</td>
                  ))}
                  <td>
                    <div className="tabs small">
                      <button className={same[i] === true ? "selected" : ""} onClick={() => setSame(same.map((s, j) => (i === j ? true : s)))}>
                        同じ
                      </button>
                      <button className={same[i] === false ? "selected" : ""} onClick={() => setSame(same.map((s, j) => (i === j ? false : s)))}>
                        異なる
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="ずれの影響">
        <div className="inline-metrics">
          <Metric value={conflicts} label="意味が異なる用語" tone={conflicts ? "bad" : ""} />
          <Metric value={same.filter((s) => s === null).length} label="未判定" />
        </div>
        {conflicts > 0 && (
          <Note warning>
            {page.terms.filter((_, i) => same[i] === false).map((t) => t[0]).join("、")}：部門をまたぐ受け渡しで、同じ言葉が別の状態を指しています。定義を揃えるか「工程歩留」「最終歩留」のように呼び分けます。
          </Note>
        )}
        <Note>{page.note}</Note>
        <SavedNote storageKey={storageKey + ":memo"} label="合意した呼び分け" initial="歩留まり → 工程歩留（製造）／最終テスト歩留（品質保証）／良品出荷率（生産管理）。" />
      </Panel>
    </div>
  );
}
