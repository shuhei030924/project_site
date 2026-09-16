import React, { useState } from "react";
import { Check, X, ArrowRight, ArrowUp, ArrowDown, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { Panel, Note, Metric, SavedNote, useSaved, fmt, clamp } from "./frontier-shared";
import { brier, wordDiff } from "./models";

const STATUS = {
  verified: ["確認済み", "ok"],
  unverified: ["主張のみ（未確認）", "warn"],
  missing: ["測定なし", "bad"],
};
export function Chain({ page, storageKey }) {
  const [status, setStatus] = useSaved(
    storageKey + ":levels",
    page.levels.map((l) => l[3]),
  );
  const firstBreak = status.findIndex((s) => s !== "verified");
  return (
    <>
      <div className="experiment-hypothesis">
        <div className="eyebrow">EVIDENCE CHAIN / 根拠のつながり</div>
        <h2>{page.program}</h2>
      </div>
      <Panel title="4段階の根拠を確認する">
        <ol className="chain">
          {page.levels.map(([name, metric, sample], i) => {
            const broken = firstBreak !== -1 && i > firstBreak;
            const [label, tone] = STATUS[status[i]];
            return (
              <li key={name} className={"chain-step " + (broken ? "broken" : tone)}>
                <span className="chain-index">L{i + 1}</span>
                <div>
                  <strong>{name}</strong>
                  <p>{metric}</p>
                  <small>{sample}</small>
                </div>
                <label>
                  根拠の状態
                  <select
                    value={status[i]}
                    aria-label={`${name}の根拠`}
                    onChange={(e) => setStatus(status.map((s, j) => (i === j ? e.target.value : s)))}
                  >
                    {Object.entries(STATUS).map(([k, [v]]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <span className={"chain-badge " + (broken ? "bad" : tone)}>
                  {broken ? "上の段階が切れているため説明できない" : label}
                </span>
              </li>
            );
          })}
        </ol>
        {firstBreak === -1 ? (
          <Note>4段階すべてに根拠があります。成果を講座の効果として説明できます。</Note>
        ) : (
          <Note warning>
            L{firstBreak + 1}「{page.levels[firstBreak][0]}」で根拠が切れています。
            {firstBreak < 3 && ` L${firstBreak + 2}以降の数字は、講座の効果ではなく単独の観測として扱います。`}
          </Note>
        )}
        <Note>{page.note}</Note>
        <SavedNote storageKey={storageKey + ":plan"} label="切れた段階を確かめる方法" initial="4週後に受講者40名へ利用回数を聞き、報告書の作成時間を5件計測する。" />
      </Panel>
    </>
  );
}

export function Journey({ page, storageKey }) {
  const [emotion, setEmotion] = useSaved(storageKey + ":emotion", page.phases.map((p) => p[3]));
  const [selected, setSelected] = useState(null);
  const w = 720,
    h = 150,
    step = w / (page.phases.length - 1);
  const pts = emotion.map((e, i) => [i * step, h - ((e - 1) / 4) * (h - 20) - 10]);
  const low = emotion.indexOf(Math.min(...emotion));
  return (
    <>
      <div className="journey-head">
        <div>
          <span className="eyebrow">ACTOR</span>
          <strong>{page.actor}</strong>
        </div>
        <div>
          <span className="eyebrow">SCENARIO</span>
          <strong>{page.scenario}</strong>
        </div>
      </div>
      <Panel title="場面ごとの行為・考え・感情">
        <div className="journey-scroll">
          <div className="journey-grid" style={{ "--cols": page.phases.length }}>
            {page.phases.map((ph, i) => (
              <button
                key={ph[0]}
                className={"journey-phase " + (selected === i ? "selected" : "") + (low === i ? " low" : "")}
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
              >
                <span className="eyebrow">0{i + 1}</span>
                <strong>{ph[0]}</strong>
                <p>{ph[1]}</p>
                <em>「{ph[2]}」</em>
              </button>
            ))}
            <svg className="journey-curve" viewBox={`-20 0 ${w + 40} ${h}`} preserveAspectRatio="none" role="img" aria-label="感情の推移">
              <line x1="-20" x2={w + 20} y1={h / 2} y2={h / 2} className="mid" />
              <polyline points={pts.map((p) => p.join(",")).join(" ")} />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={low === i ? 8 : 5} className={low === i ? "low" : ""} />
              ))}
            </svg>
            {page.phases.map((ph, i) => (
              <label key={ph[0]} className="journey-emotion">
                感情 {emotion[i]} / 5
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={emotion[i]}
                  aria-label={`${ph[0]}の感情`}
                  onChange={(e) => setEmotion(emotion.map((v, j) => (i === j ? +e.target.value : v)))}
                />
              </label>
            ))}
          </div>
        </div>
        <Note warning>
          最も下がる場面：<strong>{page.phases[low][0]}</strong>。機会：{page.phases[low][4]}
        </Note>
        {selected !== null && (
          <div className="journey-detail">
            <span className="eyebrow">OPPORTUNITY / {page.phases[selected][0]}</span>
            <p>{page.phases[selected][4]}</p>
            <SavedNote storageKey={`${storageKey}:opp:${selected}`} label="この場面での試し方" initial="" rows={2} />
          </div>
        )}
        <Note>{page.note}</Note>
      </Panel>
    </>
  );
}

const RUNGS = ["観察（原文にある事実）", "解釈（事実の意味づけ）", "結論（行動や判断）"];
export function Ladder({ page, storageKey }) {
  const [rungs, setRungs] = useSaved(storageKey + ":rungs", page.statements.map(() => null));
  const counts = [0, 1, 2].map((r) => rungs.filter((x) => x === r).length);
  const done = rungs.every((r) => r !== null);
  const expected = page.statements.map((s) => s[1]);
  const correct = rungs.filter((r, i) => r === expected[i]).length;
  return (
    <>
      <div className="experiment-hypothesis">
        <div className="eyebrow">SOURCE / 元の情報</div>
        <h2>{page.context}</h2>
      </div>
      <div className="two-column">
        <Panel title="文を段に分ける">
          <ol className="ladder-list">
            {page.statements.map(([text], i) => (
              <li key={text}>
                <p>{text}</p>
                <div className="tabs small">
                  {RUNGS.map((r, k) => (
                    <button
                      key={r}
                      className={rungs[i] === k ? "selected" : ""}
                      onClick={() => setRungs(rungs.map((v, j) => (i === j ? k : v)))}
                    >
                      {r.split("（")[0]}
                    </button>
                  ))}
                </div>
                {done && rungs[i] !== expected[i] && (
                  <small className="ladder-hint">
                    <AlertTriangle size={13} /> 例では「{RUNGS[expected[i]].split("（")[0]}」。
                    {expected[i] === 1 && rungs[i] === 0 && "原文にない意味づけは観察ではありません。"}
                    {expected[i] === 2 && "行動を求める文は結論です。"}
                  </small>
                )}
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="はしごの形">
          <div className="ladder-viz">
            {RUNGS.map((r, k) => (
              <div key={r} className="ladder-rung" style={{ "--n": counts[2 - k] }}>
                <span>{RUNGS[2 - k]}</span>
                <strong>{counts[2 - k]}</strong>
              </div>
            ))}
          </div>
          {done && (
            <>
              <Metric value={`${correct} / ${page.statements.length}`} label="例と一致した分類" />
              {counts[2] > 0 && counts[0] === 0 && (
                <Note warning>観察が一つもないのに結論があります。原文を確かめてから判断します。</Note>
              )}
              {counts[2] > counts[0] && counts[0] > 0 && (
                <Note warning>結論が観察より多い形です。結論ごとに支える観察を示せるか確かめます。</Note>
              )}
            </>
          )}
          <Note>{page.note}</Note>
        </Panel>
      </div>
    </>
  );
}

export function Tree({ page, storageKey }) {
  const [path, setPath] = useSaved(storageKey + ":path", ["start"]);
  const current = path[path.length - 1];
  const node = page.nodes[current],
    leaf = page.leaves[current];
  const answer = (next) => setPath([...path, next]);
  return (
    <div className="two-column">
      <Panel title="質問に答える">
        <ol className="tree-trail">
          {path.map((id, i) => (
            <li key={id + i}>
              {page.nodes[id] ? page.nodes[id][0] : page.leaves[id][0]}
              {i < path.length - 1 && <span className="badge">{page.nodes[id][1] === path[i + 1] ? "はい" : "いいえ"}</span>}
            </li>
          ))}
        </ol>
        {node ? (
          <div className="tree-question">
            <h3>{node[0]}</h3>
            <div className="button-row">
              <button className="button" onClick={() => answer(node[1])}>
                はい
              </button>
              <button className="button secondary" onClick={() => answer(node[2])}>
                いいえ
              </button>
            </div>
          </div>
        ) : (
          <div className={"tree-leaf " + leaf[2]}>
            {leaf[2] === "ok" ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
            <div>
              <strong>{leaf[0]}</strong>
              <p>{leaf[1]}</p>
            </div>
          </div>
        )}
        <button className="text-link" onClick={() => setPath(["start"])}>
          <RotateCcw size={15} />
          最初から判定する
        </button>
      </Panel>
      <Panel title="判定の記録">
        <Metric value={path.length - 1} label="答えた質問の数" />
        <SavedNote
          storageKey={storageKey + ":record"}
          label="判定した対象と結果"
          initial="対象：欠陥報告20件（顧客名・ロット番号を置換済み）。判定：承認済みツールへ入力できる。"
        />
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function Spaced({ page, storageKey }) {
  const [items, setItems] = useSaved(
    storageKey + ":items",
    page.items.map(([skill, day, level]) => ({ skill, day: +day, level: +level })),
  );
  const due = (it) => it.day + page.intervals[Math.min(it.level, page.intervals.length - 1)];
  const update = (i, ok) =>
    setItems(
      items.map((it, j) =>
        i === j ? { ...it, day: page.today, level: ok ? Math.min(it.level + 1, page.intervals.length - 1) : 0 } : it,
      ),
    );
  const todayDue = items.filter((it) => due(it) <= page.today);
  return (
    <>
      <div className="inline-metrics">
        <Metric value={`${page.today}日目`} label="今日（9月16日）" />
        <Metric value={todayDue.length} label="今日再現する項目" />
        <Metric value={items.filter((it) => it.level === page.intervals.length - 1).length} label="30日間隔に到達" />
      </div>
      <Panel title="再現の予定">
        <div className="spaced-list">
          {items.map((it, i) => {
            const d = due(it),
              overdue = d < page.today,
              today = d === page.today;
            return (
              <div key={it.skill} className={"spaced-item " + (overdue ? "overdue" : today ? "today" : "")}>
                <div>
                  <strong>{it.skill}</strong>
                  <small>
                    最終再現 {it.day}日目 · 次の間隔 {page.intervals[it.level]}日 · 予定 {d}日目
                    {overdue && `（${page.today - d}日超過）`}
                  </small>
                  <div className="spaced-track" aria-hidden="true">
                    {page.intervals.map((n, k) => (
                      <span key={n} className={k <= it.level ? "on" : ""}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="button-row">
                  <button className="button compact" disabled={d > page.today} onClick={() => update(i, true)}>
                    <Check size={14} /> 再現できた
                  </button>
                  <button className="button secondary compact" disabled={d > page.today} onClick={() => update(i, false)}>
                    <X size={14} /> できなかった
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <Note>{page.note}</Note>
      </Panel>
    </>
  );
}

export function Pairing({ page, storageKey }) {
  const people = page.people.map((r) => ({ name: r[0], dept: r[1], scores: r.slice(2, 6).map(Number), days: r[6] }));
  const [learner, setLearner] = useState(0);
  const [skill, setSkill] = useState(0);
  const [pairs, setPairs] = useSaved(storageKey + ":pairs", []);
  const me = people[learner];
  const mentors = people
    .map((p, i) => ({ ...p, i, gap: p.scores[skill] - me.scores[skill], shared: p.days.split("・").some((d) => me.days.includes(d)) }))
    .filter((p) => p.i !== learner && p.gap >= 1)
    .sort((a, b) => b.shared - a.shared || b.gap - a.gap);
  return (
    <div className="two-column">
      <Panel title="学びたい人と内容">
        <label className="field">
          学びたい人
          <select value={learner} onChange={(e) => setLearner(+e.target.value)}>
            {people.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name}（{p.dept}）
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          伸ばしたい内容
          <select value={skill} onChange={(e) => setSkill(+e.target.value)}>
            {page.skills.map((s, i) => (
              <option key={s} value={i}>
                {s}（現在 {me.scores[i]} / 5）
              </option>
            ))}
          </select>
        </label>
        <p className="muted">空き曜日：{me.days}</p>
        <h3 className="sub-heading">組み合わせの候補</h3>
        {mentors.length ? (
          <div className="pairing-list">
            {mentors.map((m) => (
              <div key={m.name} className="pairing-row">
                <div>
                  <strong>{m.name}</strong> <small>{m.dept} · {page.skills[skill]} {m.scores[skill]}（差 +{m.gap}）</small>
                  <small>{m.shared ? "同じ曜日に空きあり" : "曜日の調整が必要"}</small>
                </div>
                <button
                  className="button compact"
                  onClick={() => setPairs([...pairs, { learner: me.name, mentor: m.name, skill: page.skills[skill] }])}
                >
                  組み合わせを記録
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Note warning>この内容で差が1以上ある相手がいません。外部の講座か、他部門の推進役を探します。</Note>
        )}
      </Panel>
      <Panel title="記録した組み合わせ" aside={<span className="badge">{pairs.length}件</span>}>
        {pairs.length ? (
          <ul className="plain-list">
            {pairs.map((p, i) => (
              <li key={i}>
                {p.learner} ← {p.mentor}：{p.skill}
                <button className="icon-button" aria-label="削除" onClick={() => setPairs(pairs.filter((_, j) => j !== i))}>
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">まだ記録がありません。</p>
        )}
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

const VERDICT = { ok: "一致", wrong: "誤り", unsupported: "根拠なし" };
export function Claims({ page, storageKey }) {
  const [marks, setMarks] = useSaved(storageKey + ":marks", page.claims.map(() => null));
  const [graded, setGraded] = useSaved(storageKey + ":graded", false);
  const correct = marks.filter((m, i) => m === page.claims[i][1]).length;
  return (
    <div className="two-column">
      <Panel title="元データ">
        <table className="facts">
          <tbody>
            {page.facts.map(([k, v]) => (
              <tr key={k}>
                <th>{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Note>{page.note}</Note>
      </Panel>
      <Panel title="生成された要約を一文ずつ判定">
        <ol className="claim-list">
          {page.claims.map(([text, truth], i) => (
            <li key={text} className={graded ? (marks[i] === truth ? "right" : "miss") : ""}>
              <p>{text}</p>
              <div className="tabs small">
                {Object.entries(VERDICT).map(([k, v]) => (
                  <button
                    key={k}
                    className={marks[i] === k ? "selected" : ""}
                    disabled={graded}
                    onClick={() => setMarks(marks.map((m, j) => (i === j ? k : m)))}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {graded && marks[i] !== truth && (
                <small className="ladder-hint">
                  <AlertTriangle size={13} /> 例の判定：{VERDICT[truth]}
                </small>
              )}
            </li>
          ))}
        </ol>
        {graded ? (
          <>
            <div className="inline-metrics">
              <Metric value={`${correct} / ${page.claims.length}`} label="判定が例と一致" />
              <Metric value={page.claims.filter((c) => c[1] === "unsupported").length} label="根拠のない文" />
            </div>
            <button className="text-link" onClick={() => { setGraded(false); setMarks(page.claims.map(() => null)); }}>
              <RotateCcw size={15} /> もう一度判定する
            </button>
          </>
        ) : (
          <button className="button" disabled={marks.some((m) => m === null)} onClick={() => setGraded(true)}>
            採点する <ArrowRight size={16} />
          </button>
        )}
      </Panel>
    </div>
  );
}

export function EditDiff({ page, storageKey }) {
  const [final, setFinal] = useSaved(storageKey + ":final", page.final);
  const diff = wordDiff(page.draft, final);
  return (
    <>
      <div className="two-column">
        <Panel title="AIの下書き（固定）">
          <p className="large-copy">{page.draft}</p>
        </Panel>
        <Panel title="人が仕上げた文（編集できます）">
          <textarea rows={6} value={final} onChange={(e) => setFinal(e.target.value)} aria-label="完成した文" />
          <button className="text-link" onClick={() => setFinal(page.final)}>
            <RotateCcw size={15} /> サンプルに戻す
          </button>
        </Panel>
      </div>
      <Panel title="修正の見える化">
        <div className="inline-metrics">
          <Metric value={fmt(diff.ratio * 100, 0) + "%"} label="語単位の修正率" />
          <Metric value={diff.ops.filter((o) => o.type === "extra").length} label="人が加えた語" />
          <Metric value={diff.ops.filter((o) => o.type === "skipped").length} label="人が削った語" />
        </div>
        <p className="diff-view">
          {diff.ops.map((o, i) => (
            <span key={i} className={o.type}>
              {o.step}{" "}
            </span>
          ))}
        </p>
        <p className="muted">緑：加えた語 / 取り消し線：削った語。日本語は句読点と空白で区切る簡易比較です。</p>
        <Note>{page.note}</Note>
      </Panel>
    </>
  );
}

export function PathBuilder({ page, storageKey }) {
  const modules = page.modules.map(([name, minutes, roles]) => ({ name, minutes: +minutes, roles: roles.split(",") }));
  const [role, setRole] = useSaved(storageKey + ":role", page.roles[0]);
  const [order, setOrder] = useSaved(storageKey + ":order", null);
  const path = order ?? modules.map((m, i) => i).filter((i) => modules[i].roles.includes(role));
  const total = path.reduce((s, i) => s + modules[i].minutes, 0);
  const move = (k, dir) => {
    const next = [...path],
      t = k + dir;
    if (t < 0 || t >= next.length) return;
    [next[k], next[t]] = [next[t], next[k]];
    setOrder(next);
  };
  const toggle = (i) => setOrder(path.includes(i) ? path.filter((x) => x !== i) : [...path, i]);
  return (
    <div className="two-column">
      <Panel title="役割と教材を選ぶ">
        <div className="tabs">
          {page.roles.map((r) => (
            <button key={r} className={role === r ? "selected" : ""} onClick={() => { setRole(r); setOrder(null); }}>
              {r}
            </button>
          ))}
        </div>
        <ul className="module-list">
          {modules.map((m, i) => (
            <li key={m.name}>
              <label className="check-row">
                <input type="checkbox" checked={path.includes(i)} onChange={() => toggle(i)} />
                <span>
                  <strong>{m.name}</strong> · {m.minutes}分
                  <small>{m.roles.length === page.roles.length ? "共通" : m.roles.join("・")}</small>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title={`${role}の学習パス`} aside={<span className={"badge " + (total > 60 ? "warning" : "")}>{total}分</span>}>
        <ol className="path-list">
          {path.map((i, k) => (
            <li key={i}>
              <span className="chain-index">{k + 1}</span>
              <div>
                <strong>{modules[i].name}</strong>
                <small>{modules[i].minutes}分</small>
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
        {total > 60 && <Note warning>合計{total}分。初週は60分以内に収め、残りは2週目へ回します。</Note>}
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}

export function Calibration({ page, storageKey }) {
  const [answers, setAnswers] = useSaved(storageKey + ":answers", page.questions.map(() => ({ choice: null, confidence: 70 })));
  const [submitted, setSubmitted] = useSaved(storageKey + ":submitted", false);
  const items = answers.map((a, i) => ({ confidence: a.confidence, correct: a.choice === page.questions[i][2] }));
  const acc = (items.filter((i) => i.correct).length / items.length) * 100;
  const meanConf = items.reduce((s, i) => s + i.confidence, 0) / items.length;
  const score = brier(items);
  const bins = [
    [50, 69],
    [70, 89],
    [90, 100],
  ].map(([lo, hi]) => {
    const inBin = items.filter((i) => i.confidence >= lo && i.confidence <= hi);
    return { lo, hi, n: inBin.length, acc: inBin.length ? (inBin.filter((i) => i.correct).length / inBin.length) * 100 : null };
  });
  return (
    <div className="two-column">
      <Panel title="答えと自信を入力">
        <ol className="calib-list">
          {page.questions.map(([q, options, ans], i) => (
            <li key={q}>
              <p>{q}</p>
              <div className="answer-options">
                {options.map((o, k) => (
                  <button
                    key={o}
                    className={answers[i].choice === k ? "selected" : ""}
                    disabled={submitted}
                    onClick={() => setAnswers(answers.map((a, j) => (i === j ? { ...a, choice: k } : a)))}
                  >
                    <span>{String.fromCharCode(65 + k)}</span>
                    {o}
                    {submitted && k === ans && <Check size={15} className="calib-ok" />}
                  </button>
                ))}
              </div>
              <label className="calib-conf">
                自信 {answers[i].confidence}%
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={answers[i].confidence}
                  disabled={submitted}
                  onChange={(e) => setAnswers(answers.map((a, j) => (i === j ? { ...a, confidence: +e.target.value } : a)))}
                />
              </label>
            </li>
          ))}
        </ol>
        {submitted ? (
          <button className="text-link" onClick={() => { setSubmitted(false); setAnswers(page.questions.map(() => ({ choice: null, confidence: 70 }))); }}>
            <RotateCcw size={15} /> もう一度
          </button>
        ) : (
          <button className="button" disabled={answers.some((a) => a.choice === null)} onClick={() => setSubmitted(true)}>
            採点する <ArrowRight size={16} />
          </button>
        )}
      </Panel>
      <Panel title="較正の結果">
        {submitted ? (
          <>
            <div className="inline-metrics">
              <Metric value={fmt(acc, 0) + "%"} label="正解率" />
              <Metric value={fmt(meanConf, 0) + "%"} label="自信の平均" />
              <Metric value={fmt(score, 3)} label="Brierスコア（0が最良）" />
            </div>
            <Note warning={Math.abs(meanConf - acc) > 15}>
              {meanConf - acc > 15
                ? "自信が正解率を大きく上回っています（過信）。確認の手順を省きやすい傾向です。"
                : acc - meanConf > 15
                  ? "自信が正解率を下回っています。判断できているのに確認に時間をかけすぎている可能性があります。"
                  : "自信と正解率がおおむね一致しています。"}
            </Note>
            <table className="calib-table">
              <thead>
                <tr>
                  <th>自信の区分</th>
                  <th>件数</th>
                  <th>実際の正解率</th>
                </tr>
              </thead>
              <tbody>
                {bins.map((b) => (
                  <tr key={b.lo}>
                    <td>
                      {b.lo}〜{b.hi}%
                    </td>
                    <td>{b.n}</td>
                    <td>{b.acc === null ? "—" : fmt(b.acc, 0) + "%"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="muted">5問すべてに答えて自信を設定すると、正解率・自信の平均・Brierスコアを表示します。</p>
        )}
        <Note>{page.note}</Note>
      </Panel>
    </div>
  );
}
