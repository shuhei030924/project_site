import React, { useState } from "react";
import { Bell, Check, AlertTriangle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Panel, Note, Metric, SavedNote, NumberField, ResetLink, useSaved, fmt, isNum } from "./frontier-shared";
import { separationDistance, canaryVerdict, oee, kingman, envelopeAllows } from "./models";

export function Andon({ page, storageKey }) {
  const [calls, setCalls] = useSaved(storageKey + ":calls", {});
  const [log, setLog] = useSaved(storageKey + ":log", []);
  const pull = (name) => setCalls({ ...calls, [name]: { elapsed: 0, at: "14:32" } });
  const resolve = (name) => {
    const { [name]: c, ...rest } = calls;
    setCalls(rest);
    setLog([{ name, elapsed: c.elapsed, at: c.at }, ...log].slice(0, 8));
  };
  const tier = (elapsed) => [...page.ladder].reverse().find(([m]) => elapsed >= m);
  const active = Object.keys(calls).length;
  return (
    <>
      <div className="andon-board" role="group" aria-label="工程の状態">
        {page.stations.map(([name, area, state]) => {
          const call = calls[name];
          const cls = call ? "call" : state;
          return (
            <div key={name} className={"andon-cell " + cls}>
              <span className="andon-lamp" aria-hidden="true" />
              <strong>{name}</strong>
              <small>{area}</small>
              <em>{call ? `呼び出し中 · ${call.elapsed}分` : state === "warning" ? "注意" : "正常"}</em>
              {call ? (
                <>
                  <label className="andon-elapsed">
                    経過（分）
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={call.elapsed}
                      aria-label={`${name}の経過時間`}
                      onChange={(e) => setCalls({ ...calls, [name]: { ...call, elapsed: +e.target.value } })}
                    />
                  </label>
                  <button className="button compact" onClick={() => resolve(name)}>
                    <Check size={14} /> 対応完了
                  </button>
                </>
              ) : (
                <button className="button secondary compact" onClick={() => pull(name)}>
                  <Bell size={14} /> 異常を知らせる
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="two-column">
        <Panel title="応答のはしご">
          <ol className="ladder-steps">
            {page.ladder.map(([m, role]) => {
              const due = Object.values(calls).some((c) => c.elapsed >= m);
              return (
                <li key={m} className={due ? "due" : ""}>
                  <span className="chain-index">{m}分</span>
                  <span>{role}</span>
                  {due && <AlertTriangle size={15} />}
                </li>
              );
            })}
          </ol>
          {active > 0 && (
            <Note warning>
              {Object.entries(calls).map(([name, c]) => (
                <div key={name}>
                  {name}：{tier(c.elapsed)?.[1]}
                </div>
              ))}
            </Note>
          )}
          <Note>{page.note}</Note>
        </Panel>
        <Panel title="対応の記録" aside={<span className="badge">{log.length}件</span>}>
          {log.length ? (
            <ul className="plain-list">
              {log.map((l, i) => (
                <li key={i}>
                  {l.name} · 呼び出し {l.at} · {l.elapsed}分で対応完了
                  {l.elapsed >= page.ladder[2][0] && <span className="badge warning">保全まで到達</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">対応完了の記録はまだありません。</p>
          )}
          <SavedNote storageKey={storageKey + ":review"} label="呼び出しが長引いた理由" initial="夜勤は装置保全担当がサブファブにいるため、15分の段で到達に時間がかかる。" />
        </Panel>
      </div>
    </>
  );
}

export function Zone({ page, storageKey }) {
  const [values, setValues] = useSaved(storageKey + ":values", page.values);
  const [available, setAvailable] = useSaved(storageKey + ":available", page.available);
  const [human, robot, react, stop, margin] = values;
  const result = values.every(isNum) ? separationDistance({ human, robot, react, stop, margin }) : null;
  const scale = 300 / Math.max(result?.total || 1, +available || 1, 600);
  return (
    <div className="two-column calculator-layout">
      <Panel title="条件を入力">
        {page.labels.map((label, i) => (
          <NumberField key={label} label={label} value={values[i]} onChange={(v) => setValues(values.map((x, j) => (i === j ? v : x)))} />
        ))}
        <NumberField label="現場で確保できる距離（mm）" value={available} onChange={setAvailable} />
        <ResetLink onClick={() => { setValues(page.values); setAvailable(page.available); }} />
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">SEPARATION / 必要な離隔（概念値）</div>
        {result ? (
          <>
            <output className="calc-value">{fmt(result.total, 0)}</output>
            <h2>mm の離隔が必要</h2>
            <div className="calc-secondary">
              <div>
                <span>人の移動分</span>
                <strong>{fmt(result.humanTravel, 0)} mm</strong>
              </div>
              <div>
                <span>機体の移動分</span>
                <strong>{fmt(result.robotTravel, 0)} mm</strong>
              </div>
              <div>
                <span>余裕</span>
                <strong>{fmt(result.margin, 0)} mm</strong>
              </div>
            </div>
            <svg className="zone-svg" viewBox="0 0 700 340" role="img" aria-label="離隔の概念図">
              <circle cx="350" cy="170" r={Math.min(320, +available * scale)} className="avail" />
              <circle cx="350" cy="170" r={Math.min(320, result.total * scale)} className={result.total <= +available ? "need ok" : "need bad"} />
              <rect x="330" y="150" width="40" height="40" rx="6" className="robot" />
              <text x="350" y="330" textAnchor="middle">
                緑の点線＝確保できる距離 / 塗り＝必要な離隔
              </text>
            </svg>
            {result.total <= +available ? (
              <Note>確保できる距離に収まっています。速度を上げる場合は再計算します。</Note>
            ) : (
              <Note warning>
                {fmt(result.total - available, 0)} mm 不足。機体の速度を下げる、検知を早める、または経路を分けます。
              </Note>
            )}
          </>
        ) : (
          <p role="status">すべての条件に0以上の数値を入力してください。</p>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}

export function Canary({ page, storageKey }) {
  const [values, setValues] = useSaved(storageKey + ":values", page.values);
  const [stage, setStage] = useSaved(storageKey + ":stage", 0);
  const [history, setHistory] = useSaved(storageKey + ":history", []);
  const exposure = page.stages[stage];
  const [canaryErr, controlErr, tolerance, budget] = values;
  const r = values.every(isNum) ? canaryVerdict({ canaryErr, controlErr, tolerance, exposure, budget }) : null;
  const verdictLabel = { proceed: ["次の段階へ進める", "ok"], hold: ["この段階で観察を続ける", "warn"], rollback: ["元の設定へ戻す", "bad"] };
  const act = (kind) => {
    setHistory([{ stage: exposure, kind, canaryErr, controlErr }, ...history].slice(0, 10));
    if (kind === "proceed" && stage < page.stages.length - 1) setStage(stage + 1);
    if (kind === "rollback") setStage(0);
  };
  return (
    <>
      <div className="experiment-hypothesis">
        <div className="eyebrow">CHANGE / 段階的に広げる変更</div>
        <h2>{page.change}</h2>
      </div>
      <div className="canary-stages">
        {page.stages.map((s, i) => (
          <div key={s} className={"canary-stage " + (i < stage ? "done" : i === stage ? "current" : "")}>
            <strong>{s}%</strong>
            <small>{i < stage ? "通過" : i === stage ? "適用中" : "未適用"}</small>
          </div>
        ))}
      </div>
      <div className="two-column calculator-layout">
        <Panel title="観測した指標">
          {page.labels.map((label, i) => (
            <NumberField key={label} label={label} value={values[i]} onChange={(v) => setValues(values.map((x, j) => (i === j ? v : x)))} />
          ))}
          <ResetLink onClick={() => { setValues(page.values); setStage(0); }} />
        </Panel>
        <section className="calc-result">
          <div className="eyebrow">VERDICT / 判定の目安</div>
          {r ? (
            <>
              <output className="calc-value">{fmt(canaryErr - controlErr, 1)}</output>
              <h2>pt の差（適用群 − 比較群）</h2>
              <div className="calc-secondary">
                <div>
                  <span>全体に混ざった停止率</span>
                  <strong>{fmt(r.blended, 2)}%</strong>
                </div>
                <div>
                  <span>予算の消費</span>
                  <strong>{r.budgetUse === null ? "—" : fmt(r.budgetUse, 0) + "%"}</strong>
                </div>
              </div>
              <div className={"verdict " + verdictLabel[r.verdict][1]}>{verdictLabel[r.verdict][0]}</div>
              <div className="button-row">
                <button className="button" disabled={r.verdict === "rollback" || stage === page.stages.length - 1} onClick={() => act("proceed")}>
                  次の段階へ
                </button>
                <button className="button secondary" onClick={() => act("hold")}>
                  観察を続ける
                </button>
                <button className="button secondary" onClick={() => act("rollback")}>
                  元に戻す
                </button>
              </div>
            </>
          ) : (
            <p role="status">数値を入力してください。</p>
          )}
          <p>{page.note}</p>
        </section>
      </div>
      {history.length > 0 && (
        <Panel title="判断の履歴">
          <ul className="plain-list">
            {history.map((h, i) => (
              <li key={i}>
                {h.stage}%段階：{verdictLabel[h.kind][0]}（適用 {h.canaryErr}% / 比較 {h.controlErr}%）
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}

export function Hierarchy({ page, storageKey }) {
  const [chosen, setChosen] = useSaved(storageKey + ":chosen", page.hazards.map((h) => h[2]));
  const toggle = (h, l) =>
    setChosen(chosen.map((set, i) => (i === h ? (set.includes(l) ? set.filter((x) => x !== l) : [...set, l]) : set)));
  const counts = page.levels.map((_, l) => chosen.filter((set) => set.includes(l)).length);
  const weak = page.hazards.map((h, i) => h[1] === 3 && chosen[i].length > 0 && chosen[i].every((l) => l >= 3));
  return (
    <div className="two-column">
      <Panel title="危険源と選んだ手段">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>危険源</th>
                <th>影響</th>
                {page.levels.map((l) => (
                  <th key={l}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.hazards.map(([name, sev], i) => (
                <tr key={name} className={weak[i] ? "weak" : ""}>
                  <th>{name}</th>
                  <td>
                    <span className={"badge " + (sev === 3 ? "warning" : "")}>{sev}</span>
                  </td>
                  {page.levels.map((l, k) => (
                    <td key={l}>
                      <input type="checkbox" aria-label={`${name}：${l}`} checked={chosen[i].includes(k)} onChange={() => toggle(i, k)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {weak.some(Boolean) ? (
          <Note warning>
            影響3の危険源で、管理的対策・保護具だけを選んでいます：{page.hazards.filter((_, i) => weak[i]).map((h) => h[0]).join("、")}
          </Note>
        ) : (
          <Note>影響の大きい危険源には、上位の手段が含まれています。</Note>
        )}
      </Panel>
      <Panel title="手段の分布（上ほど効果が高い）">
        <div className="pyramid">
          {page.levels.map((l, k) => (
            <div key={l} className="pyramid-row" style={{ "--w": 45 + k * 13 }}>
              <span>{l}</span>
              <strong>{counts[k]}</strong>
            </div>
          ))}
        </div>
        <Note>{page.note}</Note>
        <SavedNote storageKey={storageKey + ":memo"} label="上位の手段を採れない理由" initial="協働アームの挟み込み：トレイ受け治具の形状変更（工学的対策）を次回改修で検討。" />
      </Panel>
    </div>
  );
}

export function Replay({ page, storageKey }) {
  const [marks, setMarks] = useSaved(storageKey + ":marks", page.marks);
  const [cursor, setCursor] = useState(0);
  const events = page.events.map(([t, text]) => ({ t: +t, text }));
  const end = events[events.length - 1].t;
  const labels = ["気づくまで", "判断まで", "復旧まで"];
  const segs = [
    [0, events[marks[0]].t],
    [events[marks[0]].t, events[marks[1]].t],
    [events[marks[1]].t, events[marks[2]].t],
  ];
  const longest = segs.map(([a, b]) => b - a).indexOf(Math.max(...segs.map(([a, b]) => b - a)));
  return (
    <>
      <div className="experiment-hypothesis">
        <div className="eyebrow">INCIDENT / 再生する停止</div>
        <h2>{page.title}</h2>
      </div>
      <Panel
        title="タイムライン"
        aside={
          <div className="button-row compact-row">
            <button className="icon-button" aria-label="前へ" onClick={() => setCursor(Math.max(0, cursor - 1))}>
              <ChevronLeft size={17} />
            </button>
            <span className="badge">{cursor + 1} / {events.length}</span>
            <button className="icon-button" aria-label="次へ" onClick={() => setCursor(Math.min(events.length - 1, cursor + 1))}>
              <ChevronRight size={17} />
            </button>
          </div>
        }
      >
        <div className="replay-bar" role="img" aria-label="経過時間の内訳">
          {segs.map(([a, b], i) => (
            <span key={i} className={"seg s" + i + (longest === i ? " longest" : "")} style={{ flex: Math.max(b - a, 0.2) }}>
              {labels[i]} {b - a}分
            </span>
          ))}
        </div>
        <ol className="replay-events">
          {events.map((e, i) => (
            <li key={i} className={(i === cursor ? "current " : "") + (i <= cursor ? "seen" : "")}>
              <span className="chain-index">{e.t}分</span>
              <p>{e.text}</p>
              <select
                aria-label={`${e.t}分の区切り`}
                value={marks.indexOf(i) === -1 ? "" : marks.indexOf(i)}
                onChange={(ev) => {
                  if (ev.target.value === "") return;
                  const k = +ev.target.value,
                    j = marks.indexOf(i),
                    next = [...marks];
                  if (j !== -1) next[j] = marks[k];
                  next[k] = i;
                  setMarks(next);
                }}
              >
                <option value="">—</option>
                <option value="0">気づいた時点</option>
                <option value="1">判断した時点</option>
                <option value="2">復旧した時点</option>
              </select>
            </li>
          ))}
        </ol>
        <div className="inline-metrics">
          <Metric value={end + "分"} label="停止から復旧まで" />
          <Metric value={labels[longest]} label="最も長い区間" />
        </div>
        {!(marks[0] <= marks[1] && marks[1] <= marks[2]) && (
          <Note warning>区切りの順番が前後しています。気づき → 判断 → 復旧の順になるように選び直します。</Note>
        )}
        <Note warning>
          {longest === 0 && "気づくまでが最も長い区間です。停止の通知先と方法を見直します。"}
          {longest === 1 && "判断までが最も長い区間です。現場で決められる条件を手順に書きます。"}
          {longest === 2 && "復旧作業が最も長い区間です。手順・道具・権限の準備を確認します。"}
        </Note>
        <Note>{page.note}</Note>
      </Panel>
    </>
  );
}

export function Waterfall({ page, storageKey }) {
  const [values, setValues] = useSaved(storageKey + ":values", page.values);
  const [planned, downtime, idealCycle, count, defects] = values;
  const r = values.every(isNum) ? oee({ planned, downtime, idealCycle, count, defects }) : null;
  const bars = r
    ? [
        ["計画時間", 100, "base"],
        ["停止による損失", -(1 - r.availability) * 100, "loss"],
        ["速度低下による損失", -r.availability * (1 - r.performance) * 100, "loss"],
        ["不良による損失", -r.availability * r.performance * (1 - r.quality) * 100, "loss"],
        ["OEE", r.oee * 100, "result"],
      ]
    : [];
  let running = 100;
  return (
    <div className="two-column calculator-layout">
      <Panel title="1シフトの記録">
        {page.labels.map((label, i) => (
          <NumberField key={label} label={label} value={values[i]} onChange={(v) => setValues(values.map((x, j) => (i === j ? v : x)))} />
        ))}
        <ResetLink onClick={() => setValues(page.values)} />
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">OEE / 設備総合効率</div>
        {r ? (
          <>
            <output className="calc-value">{fmt(r.oee * 100, 1)}</output>
            <h2>% ＝ 稼働 {fmt(r.availability * 100, 0)}% × 性能 {fmt(r.performance * 100, 0)}% × 品質 {fmt(r.quality * 100, 0)}%</h2>
            <div className="waterfall" role="img" aria-label="損失の滝グラフ">
              {bars.map(([label, v, kind]) => {
                const top = kind === "loss" ? running : 0;
                if (kind === "loss") running += v;
                const height = Math.abs(v);
                const bottom = kind === "loss" ? top - height : 0;
                return (
                  <div key={label} className="wf-col">
                    <div className="wf-track">
                      <span className={"wf-bar " + kind} style={{ bottom: bottom + "%", height: height + "%" }} />
                    </div>
                    <small>{label}</small>
                    <strong>{fmt(Math.abs(v), 1)}%</strong>
                  </div>
                );
              })}
            </div>
            <div className="formula">
              <h3>計算式</h3>
              <p>稼働率＝(計画−停止)÷計画、性能率＝理想サイクル×回数÷稼働時間、品質率＝(回数−不良)÷回数</p>
            </div>
          </>
        ) : (
          <p role="status">停止時間は計画時間以下、不良は処理回数以下で入力してください。</p>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}

export function Queue({ page, storageKey }) {
  const [u, setU] = useSaved(storageKey + ":u", page.utilization);
  const [service, setService] = useSaved(storageKey + ":service", page.service);
  const [variability, setVariability] = useSaved(storageKey + ":var", page.variability);
  const cv = [0.5, 1, 1.5][variability];
  const wait = kingman(u, cv, cv, +service);
  const curve = Array.from({ length: 96 }, (_, i) => {
    const rho = i;
    const w = kingman(rho, cv, cv, +service);
    return [rho, w];
  });
  const maxW = kingman(95, 1.5, 1.5, +service) || 1;
  const y = (w) => 200 - Math.min(200, (w / maxW) * 200);
  return (
    <div className="two-column calculator-layout">
      <Panel title="条件">
        <label className="field">
          稼働率 {u}%
          <input type="range" min="0" max="95" value={u} onChange={(e) => setU(+e.target.value)} aria-label="稼働率" />
        </label>
        <NumberField label="1件の搬送時間（分）" value={service} onChange={setService} />
        <label className="field">
          到着・処理のばらつき
          <select value={variability} onChange={(e) => setVariability(+e.target.value)}>
            <option value={0}>小さい（定期的な依頼）</option>
            <option value={1}>中程度</option>
            <option value={2}>大きい（突発が多い）</option>
          </select>
        </label>
        <ResetLink onClick={() => { setU(page.utilization); setService(page.service); setVariability(page.variability); }} />
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">WAITING / 依頼の平均待ち時間（近似）</div>
        {wait === null ? (
          <p role="status">搬送時間は0より大きい値にしてください。</p>
        ) : (
          <>
            <output className="calc-value">{fmt(wait, 1)}</output>
            <h2>分 の待ち（稼働率 {u}%）</h2>
            <svg className="queue-svg" viewBox="-40 -10 460 250" role="img" aria-label="稼働率と待ち時間の曲線">
              <line x1="0" y1="200" x2="400" y2="200" className="axis" />
              <line x1="0" y1="0" x2="0" y2="200" className="axis" />
              <polyline points={curve.map(([r, w]) => `${(r / 100) * 400},${y(w)}`).join(" ")} />
              <line x1={(u / 100) * 400} x2={(u / 100) * 400} y1="0" y2="200" className="marker" />
              <circle cx={(u / 100) * 400} cy={y(wait)} r="6" />
              <text x="400" y="220" textAnchor="end">
                稼働率 100%
              </text>
              <text x="0" y="220">
                0%
              </text>
            </svg>
            <div className="calc-secondary">
              <div>
                <span>80%のとき</span>
                <strong>{fmt(kingman(80, cv, cv, +service), 1)}分</strong>
              </div>
              <div>
                <span>90%のとき</span>
                <strong>{fmt(kingman(90, cv, cv, +service), 1)}分</strong>
              </div>
            </div>
          </>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}

export function Heatmap({ page, storageKey }) {
  const [shift, setShift] = useSaved(storageKey + ":shift", page.shifts[0]);
  const [picked, setPicked] = useState(null);
  const grid = Array.from({ length: page.rowsCount }, () => Array(page.cols).fill(0));
  page.cells[shift].forEach(([r, c, n]) => (grid[r][c] = n));
  const max = Math.max(...grid.flat(), 1);
  const top = page.cells[shift].slice().sort((a, b) => b[2] - a[2]).slice(0, 3);
  return (
    <div className="two-column">
      <Panel title="区画ごとの停止件数" aside={
        <div className="tabs small">
          {page.shifts.map((s) => (
            <button key={s} className={shift === s ? "selected" : ""} onClick={() => setShift(s)}>
              {s}
            </button>
          ))}
        </div>
      }>
        <div className="heatmap" style={{ "--cols": page.cols }} role="grid" aria-label={`${shift}の停止件数`}>
          {grid.map((row, r) =>
            row.map((n, c) => (
              <button
                key={r + "-" + c}
                role="gridcell"
                aria-label={`行${r + 1} 列${c + 1}：${n}件`}
                className={"heat-cell " + (picked === r + "," + c ? "picked" : "")}
                style={{ "--a": n / max }}
                onClick={() => setPicked(r + "," + c)}
              >
                {n || ""}
              </button>
            )),
          )}
        </div>
        <p className="muted">上が北側通路、左が受入口。数字は{shift}の1か月の停止件数。</p>
        {picked && (
          <Note>
            区画 {picked.replace(",", "-")}：{grid[+picked.split(",")[0]][+picked.split(",")[1]]}件
            {page.reasons[picked] && ` · 主な理由：${page.reasons[picked]}`}
          </Note>
        )}
      </Panel>
      <Panel title={`${shift}の上位3区画`}>
        <ol className="rank-list">
          {top.map(([r, c, n]) => (
            <li key={r + "-" + c}>
              <strong>区画 {r},{c}</strong>
              <span>{n}件</span>
              <small>{page.reasons[r + "," + c] || "理由未記録"}</small>
            </li>
          ))}
        </ol>
        <Note>{page.note}</Note>
        <SavedNote storageKey={storageKey + ":memo"} label="現地で確認すること" initial="夜勤の区画3-4：照明の照度を測り、停止ログの時刻と照合する。" />
      </Panel>
    </div>
  );
}

export function Envelope({ page, storageKey }) {
  const [weight, setWeight] = useSaved(storageKey + ":weight", page.weight);
  const [offset, setOffset] = useSaved(storageKey + ":offset", page.offset);
  const ok = isNum(weight) && isNum(offset);
  const r = ok ? envelopeAllows(page.envelope, +weight, +offset) : null;
  const maxW = page.envelope[page.envelope.length - 1][0],
    maxO = Math.max(...page.envelope.map((p) => p[1]));
  const X = (w) => (w / maxW) * 380 + 40,
    Y = (o) => 220 - (o / maxO) * 190;
  return (
    <div className="two-column calculator-layout">
      <Panel title="搬送する荷">
        <NumberField label="荷の重さ（kg）" value={weight} onChange={setWeight} />
        <NumberField label="重心のずれ（mm）" value={offset} onChange={setOffset} />
        <ResetLink onClick={() => { setWeight(page.weight); setOffset(page.offset); }} />
        <Note>{page.note}</Note>
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">ENVELOPE / 可搬範囲</div>
        {r ? (
          <>
            <output className="calc-value">{r.allowed ? "範囲内" : "範囲外"}</output>
            <h2>{+weight}kg のときの許容ずれ {fmt(r.limit, 0)} mm</h2>
            <svg className="envelope-svg" viewBox="0 0 460 250" role="img" aria-label="可搬範囲の図">
              <polygon points={[[0, 0], ...page.envelope, [maxW, 0]].map(([w, o]) => `${X(w)},${Y(o)}`).join(" ")} />
              <line x1="40" y1="220" x2="420" y2="220" className="axis" />
              <line x1="40" y1="30" x2="40" y2="220" className="axis" />
              <circle cx={X(Math.min(+weight, maxW))} cy={Y(Math.min(+offset, maxO))} r="7" className={r.allowed ? "ok" : "bad"} />
              <text x="420" y="240" textAnchor="end">
                重さ {maxW}kg
              </text>
              <text x="44" y="26">
                ずれ {maxO}mm
              </text>
            </svg>
            {!r.allowed && <Note warning>重心を荷台中央へ寄せる、荷を分ける、または別の機体を選びます。</Note>}
          </>
        ) : (
          <p role="status">重さとずれを0以上で入力してください。</p>
        )}
      </section>
    </div>
  );
}

export function Yamazumi({ page, storageKey }) {
  const [tasks, setTasks] = useSaved(
    storageKey + ":tasks",
    page.tasks.map(([name, sec, who, st]) => ({ name, sec: +sec, who, st: +st })),
  );
  const [takt, setTakt] = useSaved(storageKey + ":takt", page.takt);
  const totals = page.stations.map((_, s) => tasks.filter((t) => t.st === s).reduce((a, t) => a + t.sec, 0));
  const max = Math.max(...totals, +takt || 0, 1);
  return (
    <>
      <div className="two-column calculator-layout">
        <Panel title="工程ごとの積み上げ" aside={<label className="takt-input">タクト <input type="number" min="1" value={takt} onChange={(e) => setTakt(e.target.value)} aria-label="タクト（秒）" /> 秒</label>}>
          <div className="yamazumi" role="img" aria-label="工程ごとの作業時間の積み上げ">
            <div className="takt-line" style={{ bottom: `${((+takt || 0) / max) * 100}%` }}>
              <span>タクト {takt}秒</span>
            </div>
            {page.stations.map((s, si) => (
              <div key={s} className="yz-col">
                <div className="yz-stack">
                  {tasks
                    .filter((t) => t.st === si)
                    .map((t) => (
                      <span key={t.name} className={"yz-block " + (t.who === "ロボット" ? "robot" : "")} style={{ height: (t.sec / max) * 100 + "%" }} title={`${t.name} ${t.sec}秒`}>
                        {t.sec}
                      </span>
                    ))}
                </div>
                <strong className={totals[si] > +takt ? "over" : ""}>{s} · {totals[si]}秒</strong>
              </div>
            ))}
          </div>
          <p className="muted">薄い色＝人、濃い色＝ロボット。タクトの線を超える工程が、待たせる工程です。</p>
        </Panel>
        <Panel title="作業の移動">
          <ul className="task-move">
            {tasks.map((t, i) => (
              <li key={t.name}>
                <span>
                  <strong>{t.name}</strong> <small>{t.sec}秒 · {t.who}</small>
                </span>
                <select value={t.st} aria-label={`${t.name}の工程`} onChange={(e) => setTasks(tasks.map((x, j) => (i === j ? { ...x, st: +e.target.value } : x)))}>
                  {page.stations.map((s, k) => (
                    <option key={s} value={k}>
                      {s}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <button className="text-link" onClick={() => { setTasks(page.tasks.map(([name, sec, who, st]) => ({ name, sec: +sec, who, st: +st }))); setTakt(page.takt); }}>
            <RotateCcw size={15} /> 初期の配置に戻す
          </button>
        </Panel>
      </div>
      {totals.some((t) => t > +takt) ? (
        <Note warning>タクト超過：{page.stations.filter((_, i) => totals[i] > +takt).join("、")}。作業を移すか、ロボット化する作業を見直します。</Note>
      ) : (
        <Note>すべての工程がタクト以内です。</Note>
      )}
      <Note>{page.note}</Note>
    </>
  );
}
