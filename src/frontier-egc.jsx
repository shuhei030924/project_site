import React, { useState } from "react";
import { Plus, X, AlertTriangle, Check, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { Panel, Note, Metric, SavedNote, NumberField, ResetLink, useSaved, fmt, isNum } from "./frontier-shared";
import { KANO, kanoCategory, littlesLaw, jaccard, percentile, costOfDelay } from "./models";

const KANO_Q = ["好ましい", "当然だ", "どちらでもない", "我慢できる", "困る"];
export function Kano({ page, storageKey }) {
  const [answers, setAnswers] = useSaved(storageKey + ":answers", page.requests.map((r) => [+r[1], +r[2]]));
  const cats = answers.map(([f, d]) => kanoCategory(f, d));
  const dist = KANO.keys.map((k) => cats.filter((c) => c?.key === k).length);
  return (
    <div className="two-column">
      <Panel title="二つの問いに答える">
        <p className="muted">「この機能があったら？」と「この機能がなかったら？」に、それぞれ答えます。</p>
        <div className="kano-list">
          {page.requests.map(([text], i) => (
            <div key={text} className="kano-item">
              <strong>{text}</strong>
              <div className="kano-q">
                {["あったら", "なかったら"].map((q, k) => (
                  <label key={q}>
                    {q}
                    <select value={answers[i][k]} aria-label={`${text}：${q}`} onChange={(e) => setAnswers(answers.map((a, j) => (i === j ? a.map((v, l) => (l === k ? +e.target.value : v)) : a)))}>
                      {KANO_Q.map((o, n) => (
                        <option key={o} value={n}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <span className={"kano-badge k-" + cats[i]?.key}>{cats[i]?.label}</span>
            </div>
          ))}
        </div>
        <button className="text-link" onClick={() => setAnswers(page.requests.map((r) => [+r[1], +r[2]]))}>
          <RotateCcw size={15} /> 初期の回答に戻す
        </button>
      </Panel>
      <Panel title="分類の分布">
        <ul className="kano-dist">
          {KANO.labels.map((label, i) => (
            <li key={label} className={"k-" + KANO.keys[i]}>
              <span>{label}</span>
              <div className="progress">
                <span style={{ width: `${(dist[i] / page.requests.length) * 100}%` }} />
              </div>
              <strong>{dist[i]}</strong>
            </li>
          ))}
        </ul>
        <Note warning={dist[5] > 0}>
          {dist[5] > 0 ? "「要確認」は矛盾した回答です。質問の意味が伝わっていない可能性があるので、聞き直します。" : "当たり前品質を先に満たし、魅力的品質は余力で試します。"}
        </Note>
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function FlowLaw({ page, storageKey }) {
  const [stages, setStages] = useSaved(storageKey + ":stages", page.stages.map(([name, wip]) => ({ name, wip: +wip })));
  const [throughput, setThroughput] = useSaved(storageKey + ":tp", page.throughput);
  const [intake, setIntake] = useSaved(storageKey + ":intake", page.intake);
  const [limit, setLimit] = useSaved(storageKey + ":limit", page.limit);
  const wip = stages.reduce((s, st) => s + st.wip, 0);
  const lead = isNum(throughput) ? littlesLaw(wip, +throughput) : null;
  const growth = isNum(intake) && isNum(throughput) ? +intake - +throughput : null;
  const max = Math.max(...stages.map((s) => s.wip), 1);
  return (
    <div className="two-column calculator-layout">
      <Panel title="段階ごとの仕掛かり">
        <div className="wip-columns">
          {stages.map((s, i) => (
            <div key={s.name} className="wip-col">
              <div className="wip-track">
                <span style={{ height: `${(s.wip / max) * 100}%` }}>{s.wip}</span>
              </div>
              <label>
                {s.name}
                <input type="number" min="0" value={s.wip} aria-label={`${s.name}の件数`} onChange={(e) => setStages(stages.map((x, j) => (i === j ? { ...x, wip: Math.max(0, +e.target.value || 0) } : x)))} />
              </label>
            </div>
          ))}
        </div>
        <NumberField label="週あたりの完了件数（処理速度）" value={throughput} onChange={setThroughput} />
        <NumberField label="週あたりの受付件数" value={intake} onChange={setIntake} />
        <NumberField label="仕掛かりの上限（件）" value={limit} onChange={setLimit} />
        <ResetLink onClick={() => { setStages(page.stages.map(([name, wip]) => ({ name, wip: +wip }))); setThroughput(page.throughput); setIntake(page.intake); setLimit(page.limit); }} />
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">LITTLE'S LAW / 滞留と待ち時間</div>
        {lead !== null ? (
          <>
            <output className="calc-value">{fmt(lead, 1)}</output>
            <h2>週 の平均リードタイム（仕掛かり {wip}件 ÷ {throughput}件/週）</h2>
            <div className="calc-secondary">
              <div>
                <span>仕掛かりの上限との差</span>
                <strong className={wip > +limit ? "over" : ""}>{wip - +limit > 0 ? "+" : ""}{wip - +limit}件</strong>
              </div>
              <div>
                <span>受付 − 完了（週）</span>
                <strong>{growth === null ? "—" : (growth > 0 ? "+" : "") + fmt(growth, 1) + "件/週"}</strong>
              </div>
              <div>
                <span>4週後の見込み仕掛かり</span>
                <strong>{growth === null ? "—" : Math.max(0, wip + growth * 4) + "件"}</strong>
              </div>
            </div>
            <Note warning={growth > 0 || wip > +limit}>
              {growth > 0
                ? `受付が完了を週${fmt(growth, 1)}件上回っています。4週後には仕掛かり${Math.max(0, wip + growth * 4)}件、リードタイム約${fmt(littlesLaw(Math.max(0, wip + growth * 4), +throughput), 1)}週。受付を絞るか、処理速度を上げます。`
                : wip > +limit
                  ? "仕掛かりが上限を超えています。新規の受付を止めて完了を優先します。"
                  : "受付と完了が釣り合い、仕掛かりは上限内です。"}
            </Note>
            <div className="formula">
              <h3>計算式</h3>
              <p>平均リードタイム ＝ 仕掛かり件数 ÷ 週あたりの完了件数（到着と完了が安定している期間の平均）</p>
            </div>
          </>
        ) : (
          <p role="status">処理速度は0より大きい値にしてください。</p>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}

export function PokaYoke({ page, storageKey }) {
  const [choices, setChoices] = useSaved(storageKey + ":choices", page.errors.map(([, a, i]) => [+a, +i]));
  const detectOnly = choices.every(([a]) => a === 3);
  const dist = page.approaches.map((_, k) => choices.filter(([a]) => a === k).length);
  return (
    <div className="two-column">
      <Panel title="間違いごとの対策">
        <div className="poka-list">
          {page.errors.map(([text], i) => (
            <div key={text} className="poka-item">
              <strong>{text}</strong>
              <div className="poka-steps">
                {page.approaches.map((a, k) => (
                  <button key={a} className={choices[i][0] === k ? "selected" : ""} onClick={() => setChoices(choices.map((c, j) => (i === j ? [k, c[1]] : c)))}>
                    <span>{k + 1}</span>
                    {a}
                  </button>
                ))}
              </div>
              {choices[i][0] === 3 && (
                <label className="poka-inspect">
                  検出の位置
                  <select value={choices[i][1]} onChange={(e) => setChoices(choices.map((c, j) => (i === j ? [c[0], +e.target.value] : c)))} aria-label={`${text}の検出位置`}>
                    {page.inspections.map((ins, n) => (
                      <option key={ins} value={n}>
                        {ins}検査
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <SavedNote storageKey={`${storageKey}:how:${i}`} label="具体的な仕組み" rows={2} initial={["測定値欄をMESから自動取込にし、空欄では申請できない形にする（排除）", "旧様式のリンクを消し、申請入口を1つにする（置換）", "ロット番号入力時に桁数とMES上の存在を照合し、候補を表示する（容易化＋源流検査）", "SPCチャートが添付されていないと次の画面へ進めない（源流検査）"][i]} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="対策の分布">
        <ul className="kano-dist">
          {page.approaches.map((a, k) => (
            <li key={a}>
              <span>{k + 1}. {a}</span>
              <div className="progress">
                <span style={{ width: `${(dist[k] / page.errors.length) * 100}%` }} />
              </div>
              <strong>{dist[k]}</strong>
            </li>
          ))}
        </ul>
        <Note warning={detectOnly}>
          {detectOnly ? "すべて検出に頼っています。1〜3の手段で間違いそのものを起こせない形にできないか、もう一度考えます。" : "検出以外の手段が含まれています。検出は源流に近い位置ほど手戻りが小さくなります。"}
        </Note>
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function Catchball({ page, storageKey }) {
  const [levels, setLevels] = useSaved(storageKey + ":levels", page.levels.map(([name, goal, measure, concern]) => ({ name, goal, measure, concern: concern === "—" ? "" : concern, reply: "" })));
  const update = (i, k, v) => setLevels(levels.map((l, j) => (i === j ? { ...l, [k]: v } : l)));
  const open = levels.filter((l) => l.concern.trim() && !l.reply.trim()).length;
  const missing = levels.filter((l) => !l.measure.trim()).length;
  return (
    <>
      <div className="catchball">
        {levels.map((l, i) => (
          <div key={l.name} className="cb-level">
            <div className="cb-head">
              <span className="eyebrow">{l.name}</span>
              {i > 0 && (
                <span className="cb-arrows" aria-hidden="true">
                  <ArrowLeft size={13} /> 方針 · 懸念 <ArrowRight size={13} />
                </span>
              )}
            </div>
            <label className="field">
              目標
              <textarea rows={2} value={l.goal} onChange={(e) => update(i, "goal", e.target.value)} />
            </label>
            <label className="field">
              指標
              <input value={l.measure} onChange={(e) => update(i, "measure", e.target.value)} className={!l.measure.trim() ? "missing" : ""} />
            </label>
            {i > 0 && (
              <>
                <label className="field">
                  現場からの懸念（上へ戻す）
                  <textarea rows={2} value={l.concern} onChange={(e) => update(i, "concern", e.target.value)} />
                </label>
                <label className="field">
                  上からの返答
                  <textarea rows={2} value={l.reply} placeholder="懸念への返答を記入…" onChange={(e) => update(i, "reply", e.target.value)} className={l.concern.trim() && !l.reply.trim() ? "missing" : ""} />
                </label>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="inline-metrics">
        <Metric value={open} label="返答のない懸念" tone={open ? "bad" : ""} />
        <Metric value={missing} label="指標が空の段" tone={missing ? "bad" : ""} />
      </div>
      <Note warning={open > 0 || missing > 0}>
        {open > 0 ? "返答のない懸念があります。返答を書くか、上の段の目標を修正します。" : missing > 0 ? "指標のない段があります。つながりを確かめられません。" : "すべての段に指標があり、懸念には返答があります。"}
      </Note>
      <Note>{page.note}</Note>
      <button className="text-link" onClick={() => setLevels(page.levels.map(([name, goal, measure, concern]) => ({ name, goal, measure, concern: concern === "—" ? "" : concern, reply: "" })))}>
        <RotateCcw size={15} /> 初期の内容に戻す
      </button>
    </>
  );
}

export function CD3({ page, storageKey }) {
  const [items, setItems] = useSaved(storageKey + ":items", page.items.map(([name, value, weeks]) => ({ name, value: +value, weeks: +weeks })));
  const scored = items.map((it) => ({ ...it, cd3: costOfDelay(it.value, it.weeks) }));
  const byCd3 = [...scored].sort((a, b) => (b.cd3 ?? -1) - (a.cd3 ?? -1));
  const byValue = [...scored].sort((a, b) => b.value - a.value);
  const totalDelay = (order) => {
    let t = 0,
      loss = 0;
    order.forEach((it) => {
      t += it.weeks;
      loss += it.value * t;
    });
    return loss;
  };
  return (
    <div className="two-column">
      <Panel title="案件の条件">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>案件</th>
                <th>遅れのコスト（万円/週）</th>
                <th>所要（週）</th>
                <th>CD3</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.name}>
                  <th>{it.name}</th>
                  {["value", "weeks"].map((k) => (
                    <td key={k}>
                      <input type="number" min={k === "weeks" ? 1 : 0} value={it[k]} aria-label={`${it.name}の${k === "value" ? "遅れのコスト" : "所要週数"}`} onChange={(e) => setItems(items.map((x, j) => (i === j ? { ...x, [k]: Math.max(k === "weeks" ? 1 : 0, +e.target.value || 0) } : x)))} />
                    </td>
                  ))}
                  <td>
                    <strong>{scored[i].cd3 === null ? "—" : fmt(scored[i].cd3, 1)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ResetLink onClick={() => setItems(page.items.map(([name, value, weeks]) => ({ name, value: +value, weeks: +weeks })))} />
      </Panel>
      <Panel title="順番の比較（1人ずつ順に実行する場合）">
        <div className="order-compare">
          {[
            ["CD3の高い順", byCd3],
            ["効果の大きい順", byValue],
          ].map(([label, order]) => (
            <div key={label}>
              <h3 className="sub-heading">{label}</h3>
              <ol className="rank-list compact">
                {order.map((it) => (
                  <li key={it.name}>
                    <strong>{it.name}</strong>
                    <span>{it.weeks}週</span>
                  </li>
                ))}
              </ol>
              <Metric value={fmt(totalDelay(order), 0) + "万円"} label="遅れの総コスト" />
            </div>
          ))}
        </div>
        <Note>
          CD3順は効果順より{fmt(totalDelay(byValue) - totalDelay(byCd3), 0)}万円、遅れの総コストが小さくなります（同じ場合は0）。
        </Note>
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function ChangeLoad({ page, storageKey }) {
  const [changes, setChanges] = useSaved(storageKey + ":changes", page.changes.map(([name, team, month]) => ({ name, team, month: +month })));
  const grid = page.teams.map((t) => page.months.map((_, m) => changes.filter((c) => c.team === t && c.month === m)));
  const over = grid.flatMap((row, t) => row.map((cell, m) => (cell.length > page.limit ? [page.teams[t], page.months[m], cell.length] : null))).filter(Boolean);
  return (
    <div className="two-column">
      <Panel title="チーム × 月">
        <div className="load-grid" style={{ "--cols": page.months.length }}>
          <div />
          {page.months.map((m) => (
            <div key={m} className="load-head">
              {m}
            </div>
          ))}
          {page.teams.map((t, ti) => (
            <React.Fragment key={t}>
              <div className="load-team">{t}</div>
              {page.months.map((m, mi) => (
                <div key={m} className={"load-cell " + (grid[ti][mi].length > page.limit ? "over" : grid[ti][mi].length === page.limit ? "full" : "")}>
                  <strong>{grid[ti][mi].length || ""}</strong>
                  {grid[ti][mi].map((c) => (
                    <small key={c.name}>{c.name}</small>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <p className="muted">1チームに同じ月{page.limit + 1}件以上で赤、{page.limit}件で黄。</p>
      </Panel>
      <Panel title="時期を動かす">
        <ul className="change-list">
          {changes.map((c, i) => (
            <li key={c.name}>
              <span>
                <strong>{c.name}</strong> <small>{c.team}</small>
              </span>
              <select value={c.month} aria-label={`${c.name}の実施月`} onChange={(e) => setChanges(changes.map((x, j) => (i === j ? { ...x, month: +e.target.value } : x)))}>
                {page.months.map((m, k) => (
                  <option key={m} value={k}>
                    {m}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
        <Note warning={over.length > 0}>
          {over.length ? over.map(([t, m, n]) => `${t}・${m}に${n}件`).join("、") + "。定着確認が追いつかない恐れがあります。" : "どのチームも上限内です。"}
        </Note>
        <Note>{page.note}</Note>
        <ResetLink onClick={() => setChanges(page.changes.map(([name, team, month]) => ({ name, team, month: +month })))} />
      </Panel>
    </div>
  );
}

export function Dedupe({ page, storageKey }) {
  const [threshold, setThreshold] = useSaved(storageKey + ":th", page.threshold);
  const [merged, setMerged] = useSaved(storageKey + ":merged", []);
  const pairs = [];
  page.proposals.forEach((a, i) =>
    page.proposals.forEach((b, j) => {
      if (j > i) pairs.push({ a, b, score: jaccard(a[1], b[1]) });
    }),
  );
  const candidates = pairs.filter((p) => p.score >= threshold).sort((a, b) => b.score - a.score);
  const key = (p) => p.a[0] + "+" + p.b[0];
  return (
    <div className="two-column">
      <Panel title="類似度の高い組">
        <label className="field">
          しきい値 {fmt(threshold, 2)}
          <input type="range" min="0.05" max="0.6" step="0.05" value={threshold} onChange={(e) => setThreshold(+e.target.value)} aria-label="類似度のしきい値" />
        </label>
        {candidates.length ? (
          <ul className="dedupe-list">
            {candidates.map((p) => (
              <li key={key(p)} className={merged.includes(key(p)) ? "merged" : ""}>
                <div>
                  <strong>
                    {p.a[0]} × {p.b[0]}
                  </strong>
                  <small>{p.a[1]}</small>
                  <small>{p.b[1]}</small>
                </div>
                <span className="badge">{fmt(p.score, 2)}</span>
                <button className="button secondary compact" onClick={() => setMerged(merged.includes(key(p)) ? merged.filter((k) => k !== key(p)) : [...merged, key(p)])}>
                  {merged.includes(key(p)) ? <Check size={14} /> : <Plus size={14} />} {merged.includes(key(p)) ? "統合済み" : "統合候補に"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">このしきい値では候補がありません。</p>
        )}
      </Panel>
      <Panel title="類似度の一覧">
        <div className="table-scroll">
          <table className="sim-table">
            <thead>
              <tr>
                <th />
                {page.proposals.map((p) => (
                  <th key={p[0]}>{p[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.proposals.map((a, i) => (
                <tr key={a[0]}>
                  <th>{a[0]}</th>
                  {page.proposals.map((b, j) => {
                    const s = i === j ? null : jaccard(a[1], b[1]);
                    return (
                      <td key={b[0]} className={s !== null && s >= threshold ? "hit" : ""} style={{ "--a": s ?? 0 }}>
                        {s === null ? "—" : fmt(s, 2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Metric value={merged.length} label="統合候補にした組" />
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function Alignment({ page, storageKey }) {
  const [people, setPeople] = useSaved(storageKey + ":people", page.people.map(([name, role, influence, stance]) => ({ name, role, influence: +influence, stance: +stance })));
  const move = (i, d) => setPeople(people.map((p, j) => (i === j ? { ...p, stance: Math.max(0, Math.min(page.stances.length - 1, p.stance + d)) } : p)));
  const next = [...people].filter((p) => p.stance < 2).sort((a, b) => b.influence - a.influence || a.stance - b.stance)[0];
  return (
    <>
      <div className="stance-board" style={{ "--cols": page.stances.length }}>
        {page.stances.map((s, k) => (
          <div key={s} className={"stance-col s" + k}>
            <h3>{s}</h3>
            {people
              .filter((p) => p.stance === k)
              .map((p) => (
                <div key={p.name} className="stance-card">
                  <strong>{p.name}</strong>
                  <small>
                    {p.role} · 影響 {"●".repeat(p.influence)}
                  </small>
                  <div className="button-row compact-row">
                    <button className="icon-button" aria-label={`${p.name}を左へ`} disabled={k === 0} onClick={() => move(people.indexOf(p), -1)}>
                      <ArrowLeft size={14} />
                    </button>
                    <button className="icon-button" aria-label={`${p.name}を右へ`} disabled={k === page.stances.length - 1} onClick={() => move(people.indexOf(p), 1)}>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className="two-column">
        <Panel title="次に話す相手">
          {next ? (
            <>
              <Metric value={next.name} label={`${next.role} · 影響 ${next.influence} · ${page.stances[next.stance]}`} />
              <SavedNote storageKey={storageKey + ":memo:" + next.name} label="聞くこと・反映すること" initial="懸念の中身と、計画にどう反映すれば賛成に近づくかを聞く。" />
            </>
          ) : (
            <Note>影響の大きい関係者は全員が賛成以上です。</Note>
          )}
        </Panel>
        <Panel title="全体の状況">
          <div className="inline-metrics">
            <Metric value={people.filter((p) => p.stance >= 2).length + " / " + people.length} label="賛成以上" />
            <Metric value={people.filter((p) => p.stance === 0 && p.influence >= 2).length} label="影響大で懸念あり" tone={people.some((p) => p.stance === 0 && p.influence >= 2) ? "bad" : ""} />
          </div>
          <Note>{page.note}</Note>
          <ResetLink onClick={() => setPeople(page.people.map(([name, role, influence, stance]) => ({ name, role, influence: +influence, stance: +stance })))} />
        </Panel>
      </div>
    </>
  );
}

export function IssueTree({ page, storageKey }) {
  const [tree, setTree] = useSaved(
    storageKey + ":tree",
    page.branches.map(([name, leaves]) => ({ name, leaves: leaves.map((l) => ({ text: l, measurable: true, overlap: false })) })),
  );
  const [draft, setDraft] = useState({});
  const flat = tree.flatMap((b) => b.leaves);
  const overlaps = flat.filter((l) => l.overlap).length,
    unmeasurable = flat.filter((l) => !l.measurable).length;
  return (
    <>
      <div className="issue-tree">
        <div className="it-root">{page.root}</div>
        <div className="it-branches">
          {tree.map((b, bi) => (
            <div key={b.name} className="it-branch">
              <h3>{b.name}</h3>
              <ul>
                {b.leaves.map((l, li) => (
                  <li key={li} className={(l.overlap ? "overlap " : "") + (!l.measurable ? "unmeasurable" : "")}>
                    <span>{l.text}</span>
                    <div className="it-flags">
                      <label>
                        <input type="checkbox" checked={l.measurable} onChange={() => setTree(tree.map((x, i) => (i === bi ? { ...x, leaves: x.leaves.map((y, j) => (j === li ? { ...y, measurable: !y.measurable } : y)) } : x)))} />
                        測れる
                      </label>
                      <label>
                        <input type="checkbox" checked={l.overlap} onChange={() => setTree(tree.map((x, i) => (i === bi ? { ...x, leaves: x.leaves.map((y, j) => (j === li ? { ...y, overlap: !y.overlap } : y)) } : x)))} />
                        他と重なる
                      </label>
                      <button className="icon-button" aria-label="削除" onClick={() => setTree(tree.map((x, i) => (i === bi ? { ...x, leaves: x.leaves.filter((_, j) => j !== li) } : x)))}>
                        <X size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="sipoc-add">
                <input value={draft[bi] || ""} placeholder="要因を追加…" aria-label={`${b.name}に追加`} onChange={(e) => setDraft({ ...draft, [bi]: e.target.value })} />
                <button
                  className="icon-button"
                  aria-label={`${b.name}に追加する`}
                  onClick={() => {
                    const v = (draft[bi] || "").trim();
                    if (!v) return;
                    setTree(tree.map((x, i) => (i === bi ? { ...x, leaves: [...x.leaves, { text: v, measurable: false, overlap: false }] } : x)));
                    setDraft({ ...draft, [bi]: "" });
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="inline-metrics">
        <Metric value={flat.length} label="要因の数" />
        <Metric value={overlaps} label="他と重なる要因" tone={overlaps ? "bad" : ""} />
        <Metric value={unmeasurable} label="測れない要因" tone={unmeasurable ? "bad" : ""} />
      </div>
      <Note warning={overlaps > 0 || unmeasurable > 0}>
        {overlaps > 0 ? "重なる要因があります。どちらかの枝に寄せるか、切り分けの基準を決めます。" : unmeasurable > 0 ? "測れない要因は、原因分析に進む前に測り方を決めます。" : "漏れなく重なりなく分かれ、各要因は測れます。なぜなぜ分析へ進めます。"}
      </Note>
      <Note>{page.note}</Note>
      <ResetLink onClick={() => setTree(page.branches.map(([name, leaves]) => ({ name, leaves: leaves.map((l) => ({ text: l, measurable: true, overlap: false })) })))} />
    </>
  );
}

export function Sla({ page, storageKey }) {
  const [text, setText] = useSaved(storageKey + ":durations", page.durations);
  const [target, setTarget] = useSaved(storageKey + ":target", page.target);
  const values = text.split(/[、,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0);
  const p50 = percentile(values, 0.5),
    p90 = percentile(values, 0.9),
    mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  const within = values.length ? (values.filter((v) => v <= +target).length / values.length) * 100 : null;
  const bins = [
    [0, 2],
    [3, 5],
    [6, 10],
    [11, 20],
    [21, Infinity],
  ].map(([lo, hi]) => ({ label: hi === Infinity ? `${lo}日以上` : `${lo}〜${hi}日`, n: values.filter((v) => v >= lo && v <= hi).length }));
  const maxBin = Math.max(...bins.map((b) => b.n), 1);
  return (
    <div className="two-column calculator-layout">
      <Panel title="返答までの日数（提案20件）">
        <label className="field">
          日数の一覧（読点区切り）
          <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <NumberField label="目標（日以内）" value={target} onChange={setTarget} />
        <ResetLink onClick={() => { setText(page.durations); setTarget(page.target); }} />
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">PERCENTILES / 平均が隠す遅れ</div>
        {values.length ? (
          <>
            <output className="calc-value">{fmt(p90, 0)}</output>
            <h2>日（90パーセンタイル） · 中央値 {fmt(p50, 0)}日 · 平均 {fmt(mean, 1)}日</h2>
            <div className="hist" role="img" aria-label="返答日数の分布">
              {bins.map((b) => (
                <div key={b.label} className="hist-col">
                  <span style={{ height: `${(b.n / maxBin) * 100}%` }}>{b.n || ""}</span>
                  <small>{b.label}</small>
                </div>
              ))}
            </div>
            <div className="calc-secondary">
              <div>
                <span>目標{target}日以内に返答した割合</span>
                <strong>{fmt(within, 0)}%</strong>
              </div>
              <div>
                <span>目標を超えた件数</span>
                <strong>{values.filter((v) => v > +target).length}件</strong>
              </div>
            </div>
            <Note warning={mean <= +target && p90 > +target}>
              {mean <= +target && p90 > +target
                ? `平均は目標内ですが、1割の提案者は${fmt(p90, 0)}日以上待っています。遅れた案件の共通点を調べます。`
                : p90 <= +target
                  ? "9割の提案に目標内で返答しています。"
                  : "平均も90パーセンタイルも目標を超えています。受付後の一次返答を分けて早めます。"}
            </Note>
          </>
        ) : (
          <p role="status">0以上の日数を読点区切りで入力してください。</p>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}
