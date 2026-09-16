import React, { useState } from "react";
import {
  Check,
  ArrowRight,
  Info,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useSaved } from "./storage";
import { calculateModel, format, auditLog, conflicts } from "./models";
import { research } from "./research";
const Panel = ({ title, children }) => (
  <section className="panel">
    <div className="section-header">
      <h2>{title}</h2>
    </div>
    {children}
  </section>
);
const Note = ({ children, warning = false }) => (
  <div className={"notice " + (warning ? "warning" : "")}>
    <Info size={19} />
    <div>{children}</div>
  </div>
);
const Metric = ({ value, label }) => (
  <div className="advanced-metric">
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);
const Progress = ({ value }) => (
  <div className="progress">
    <span style={{ width: Math.max(0, Math.min(100, value)) + "%" }} />
  </div>
);
export function ResearchNote({ page, site }) {
  const ref = research[page.source];
  const target = site.pages.find((p) => p.id === page.next);
  return (
    <div className="research-note">
      <div>
        <span className="eyebrow">DESIGN RESEARCH / 深掘りした視点</span>
        <p>{ref.use}</p>
        <a href={ref.url} target="_blank" rel="noreferrer">
          {ref.name}
          <ExternalLink size={13} />
        </a>
      </div>
      {target && (
        <a className="button secondary" href={`#/${site.id}/${target.id}`}>
          {target.title}へ<ArrowRight size={16} />
        </a>
      )}
    </div>
  );
}
function ModelCalc({ page, storageKey }) {
  const [values, setValues] = useSaved(storageKey + ":model", page.values);
  const result = calculateModel(page.model, values);
  return (
    <div className="two-column calculator-layout">
      <Panel title="業務の前提を入力">
        {page.labels.map((label, i) => (
          <label className="field" key={label}>
            {label}
            <input
              type="number"
              min="0"
              step="any"
              value={values[i]}
              onChange={(e) =>
                setValues(values.map((n, j) => (i === j ? e.target.value : n)))
              }
            />
          </label>
        ))}
        <button className="text-link" onClick={() => setValues(page.values)}>
          <RotateCcw size={15} />
          初期の条件に戻す
        </button>
      </Panel>
      <section className="calc-result">
        <div className="eyebrow">DECISION SUPPORT / 条件から考える</div>
        {result.error ? (
          <>
            <span className="calc-value">—</span>
            <p role="status">{result.error}</p>
          </>
        ) : (
          <>
            <output className="calc-value">{result.value}</output>
            <h2>{result.label}</h2>
            <div className="calc-secondary">
              {result.metrics.map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            <div className="formula">
              <h3>計算式</h3>
              <p>{result.formula}</p>
            </div>
          </>
        )}
        <p>{page.note}</p>
      </section>
    </div>
  );
}
function Benchmark({ page, storageKey }) {
  const [scores, setScores] = useSaved(storageKey + ":scores", page.scores);
  const avg = scores.map((r) => r.reduce((a, b) => a + +b, 0) / r.length);
  return (
    <>
      <div className="experiment-hypothesis">
        <div className="eyebrow">SAME INPUT, DIFFERENT RESULTS</div>
        <h2>{page.context}</h2>
      </div>
      <div className="benchmark-candidates">
        {page.candidates.map((c, i) => (
          <Panel key={c} title={`候補 ${String.fromCharCode(65 + i)}`}>
            <p className="large-copy">{c}</p>
            <Metric value={avg[i].toFixed(1) + " / 5"} label="評価点の平均" />
          </Panel>
        ))}
      </div>
      <Panel title="観点ごとの評価">
        <p className="muted">
          1：使えない / 3：修正すれば使える /
          5：要件を満たす。点数は人が判断します。
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>評価観点・ケース</th>
                {page.candidates.map((c, i) => (
                  <th key={c}>候補 {String.fromCharCode(65 + i)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.criteria.map((c, i) => (
                <tr key={c}>
                  <th>{c}</th>
                  {scores.map((r, j) => (
                    <td key={j}>
                      <select
                        aria-label={`${c} 候補${j + 1}`}
                        value={r[i]}
                        onChange={(e) =>
                          setScores(
                            scores.map((row, ri) =>
                              row.map((s, ci) =>
                                ri === j && ci === i ? +e.target.value : s,
                              ),
                            ),
                          )
                        }
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>{page.note}</Note>
        <label className="field">
          採用判断・追加で試す条件
          <SavedNote
            storageKey={storageKey + ":rationale"}
            initial="低い評価のケースを再確認してから、使う範囲を決める。"
          />
        </label>
      </Panel>
    </>
  );
}
function SavedNote({ storageKey, initial = "" }) {
  const [note, setNote] = useSaved(storageKey, initial);
  return (
    <textarea
      rows={3}
      value={note}
      onChange={(e) => setNote(e.target.value)}
      aria-label="検討メモ"
    />
  );
}
function Cohort({ page, storageKey }) {
  const [rows, setRows] = useSaved(storageKey + ":cohorts", page.rows);
  const valid = rows.every(
    (r) =>
      r
        .slice(1)
        .every(
          (n) => String(n).trim() !== "" && Number.isInteger(+n) && +n >= 0,
        ) &&
      +r[1] > 0 &&
      +r[2] <= +r[1] &&
      +r[3] <= +r[1],
  );
  return (
    <Panel title="同じ受講者グループを追跡">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {[...page.headers, "4週後の利用率"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r[0]}>
                <th>{r[0]}</th>
                {r.slice(1).map((n, j) => (
                  <td key={j}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      aria-label={`${r[0]} ${page.headers[j + 1]}`}
                      value={n}
                      onChange={(e) =>
                        setRows(
                          rows.map((row, k) =>
                            row.map((v, l) =>
                              k === i && l === j + 1 ? e.target.value : v,
                            ),
                          ),
                        )
                      }
                    />
                  </td>
                ))}
                <td>{valid ? format((+r[3] / +r[1]) * 100) + "%" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!valid && (
        <Note warning>
          人数を0以上の整数で入力し、利用者数を受講人数以下にしてください。
        </Note>
      )}
      <div className="cohort-bars">
        {rows.map((r) => (
          <div key={r[0]}>
            <strong>{r[0]}</strong>
            <Progress value={valid ? (+r[3] / +r[1]) * 100 : 0} />
            <span>{valid ? `${r[3]} / ${r[1]}人` : "要確認"}</span>
          </div>
        ))}
      </div>
      <Note>{page.note}</Note>
    </Panel>
  );
}
function Scenario({ page, storageKey }) {
  const [answers, setAnswers] = useSaved(storageKey + ":decisions", {});
  const [active, setActive] = useState(0);
  const item = page.cases[active],
    answer = answers[active];
  return (
    <div className="two-column">
      <Panel title="現場の場面を選ぶ">
        <div className="scenario-list">
          {page.cases.map((c, i) => (
            <button
              key={c.title}
              className={active === i ? "selected" : ""}
              onClick={() => setActive(i)}
            >
              <span>CASE 0{i + 1}</span>
              <strong>{c.title}</strong>
              {answers[i] !== undefined && <CheckCircle2 size={17} />}
            </button>
          ))}
        </div>
        <Note>答えだけでなく、何を確認して誰が決めるかを考える演習です。</Note>
      </Panel>
      <Panel title={item.title}>
        <p className="large-copy">{item.context}</p>
        <div className="answer-options">
          {item.options.map((o, i) => (
            <button
              key={o}
              aria-pressed={answer === i}
              className={answer === i ? "selected" : ""}
              onClick={() => setAnswers({ ...answers, [active]: i })}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {o}
            </button>
          ))}
        </div>
        {answer !== undefined && (
          <Note warning={answer !== item.correct}>
            <strong>
              {answer === item.correct
                ? "この条件では妥当な選択です"
                : "判断の前提を見直しましょう"}
            </strong>
            <p>{item.reason}</p>
          </Note>
        )}
      </Panel>
    </div>
  );
}
function Quiz({ page, storageKey }) {
  const [answers, setAnswers] = useSaved(storageKey + ":answers", {});
  const [submitted, setSubmitted] = useState(false);
  const score = page.questions.filter((q, i) => answers[i] === q.answer).length;
  return (
    <Panel title="理由まで理解するミニ演習">
      <div className="quiz">
        {page.questions.map((q, i) => (
          <fieldset key={q.q}>
            <legend>
              <span>0{i + 1}</span>
              {q.q}
            </legend>
            {q.options.map((o, j) => (
              <label key={o}>
                <input
                  type="radio"
                  name={"quiz" + i}
                  checked={answers[i] === j}
                  onChange={() => {
                    setAnswers({ ...answers, [i]: j });
                    setSubmitted(false);
                  }}
                />
                {o}
              </label>
            ))}
            {submitted && (
              <Note warning={answers[i] !== q.answer}>
                <strong>
                  {answers[i] === q.answer ? "正解" : "もう一度確認"}
                </strong>
                <p>{q.why}</p>
              </Note>
            )}
          </fieldset>
        ))}
      </div>
      <button
        className="button"
        disabled={page.questions.some((_, i) => answers[i] === undefined)}
        onClick={() => setSubmitted(true)}
      >
        理由と結果を確認
        <ArrowRight size={16} />
      </button>
      {submitted && (
        <div className="quiz-result" role="status">
          {score} / {page.questions.length} 問正解{" "}
          <small>正式な資格・作業許可の認定ではありません。</small>
        </div>
      )}
    </Panel>
  );
}
function Redaction({ page, storageKey }) {
  const [input, setInput] = useSaved(storageKey + ":input", page.input);
  const [terms, setTerms] = useSaved(
    storageKey + ":terms",
    page.terms.join("\n"),
  );
  const [result, setResult] = useState(null);
  function run() {
    let text = input,
      count = 0;
    text = text
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => {
        count++;
        return "[メール]";
      })
      .replace(/EMP-\d+/g, () => {
        count++;
        return "[社員番号]";
      });
    terms
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .forEach((term, i) => {
        const parts = text.split(term);
        count += parts.length - 1;
        text = parts.join(`[置換${i + 1}]`);
      });
    setResult({ text, count });
  }
  return (
    <div className="two-column">
      <Panel title="架空の文章で練習">
        <label className="field">
          元の文章
          <textarea
            rows={6}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setResult(null);
            }}
          />
        </label>
        <label className="field">
          追加で置換する語（1行1語）
          <textarea
            rows={4}
            value={terms}
            onChange={(e) => {
              setTerms(e.target.value);
              setResult(null);
            }}
          />
        </label>
        <button className="button" onClick={run}>
          置換結果を確認
        </button>
      </Panel>
      <Panel title="置換した結果">
        {result ? (
          <>
            <Metric
              value={result.count + "か所"}
              label="ルールに一致した置換箇所"
            />
            <pre className="output-example">{result.text}</pre>
          </>
        ) : (
          <p>左の例を編集して、置換結果を確認してください。</p>
        )}
        <Note warning>{page.note}</Note>
        <p>
          置換後にも固有の設備仕様・製品条件・取引情報が残っていないか、人が確認してください。実データの貼り付けは不要です。
        </p>
      </Panel>
    </div>
  );
}
function Scheduler({ page, storageKey }) {
  const [items, setItems] = useSaved(storageKey + ":slots", page.items);
  const { parsed, pairs } = conflicts(items);
  const valid = parsed.every((r) => r.valid);
  const min = Math.min(
      ...parsed.filter((r) => r.valid).map((r) => r.begin),
      480,
    ),
    max = Math.max(...parsed.filter((r) => r.valid).map((r) => r.end), 1080);
  return (
    <Panel title={page.resource}>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>対象</th>
              <th>開始時刻</th>
              <th>充電時間（分）</th>
              <th>終了時刻</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={r[0]}>
                <th>{r[0]}</th>
                <td>
                  <input
                    aria-label={r[0] + " 開始"}
                    type="time"
                    value={r[1]}
                    onChange={(e) =>
                      setItems(
                        items.map((x, j) =>
                          i === j ? [x[0], e.target.value, x[2]] : x,
                        ),
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    aria-label={r[0] + " 分数"}
                    type="number"
                    min="1"
                    value={r[2]}
                    onChange={(e) =>
                      setItems(
                        items.map((x, j) =>
                          i === j ? [x[0], x[1], e.target.value] : x,
                        ),
                      )
                    }
                  />
                </td>
                <td>
                  {parsed[i].valid
                    ? `${String(Math.floor(parsed[i].end / 60)).padStart(2, "0")}:${String(parsed[i].end % 60).padStart(2, "0")}`
                    : "要確認"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="schedule-axis">
        <span>{Math.floor(min / 60)}:00</span>
        <span>{Math.ceil(max / 60)}:00</span>
      </div>
      <div className="schedule-lanes">
        {parsed.map((r) => (
          <div key={r.name}>
            <strong>{r.name}</strong>
            <div className="schedule-track">
              {r.valid && (
                <span
                  style={{
                    left: ((r.begin - min) / (max - min)) * 100 + "%",
                    width: ((r.end - r.begin) / (max - min)) * 100 + "%",
                  }}
                >
                  {r.end - r.begin}分
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <Note warning={!valid || pairs.length > 0}>
        {!valid
          ? "時刻と正の分数を確認してください。同じ日で終了する条件を入力します。"
          : pairs.length
            ? pairs.map((p) => p.join(" と ") + " が重複").join(" / ")
            : "この計画では充電枠の重複はありません。"}
      </Note>
      <p className="muted">{page.note}</p>
    </Panel>
  );
}
function Risk({ page, storageKey }) {
  const [items, setItems] = useSaved(storageKey + ":risks", page.items);
  const rows = items
    .map((r, i) => ({ row: r, index: i, rpn: r[2] * r[3] * r[4] }))
    .sort((a, b) => (b.row[2] >= 9) - (a.row[2] >= 9) || b.rpn - a.rpn);
  return (
    <Panel title="失敗の影響から対策を考える">
      <p>影響・発生・検出困難度：各1〜10。数値が大きいほど要注意。</p>
      <div className="table-scroll">
        <table className="risk-table">
          <thead>
            <tr>
              <th>失敗と影響</th>
              <th>影響 S</th>
              <th>発生 O</th>
              <th>検出 D</th>
              <th>S×O×D</th>
              <th>対策 / 担当</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ row: r, index: i, rpn }) => (
              <tr key={r[0]}>
                <th>
                  {r[0]}
                  <small>{r[1]}</small>
                  {+r[2] >= 9 && (
                    <span className="badge warning">重大影響を優先確認</span>
                  )}
                </th>
                {[2, 3, 4].map((k) => (
                  <td key={k}>
                    <select
                      aria-label={`${r[0]} ${["", "", "影響", "発生", "検出"][k]}`}
                      value={r[k]}
                      onChange={(e) =>
                        setItems(
                          items.map((x, j) =>
                            x.map((v, l) =>
                              j === i && l === k ? +e.target.value : v,
                            ),
                          ),
                        )
                      }
                    >
                      {Array.from({ length: 10 }, (_, n) => (
                        <option key={n} value={n + 1}>
                          {n + 1}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
                <td>
                  <strong>{rpn}</strong>
                </td>
                <td>
                  {r[5]}
                  <small>{r[6]}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note warning>{page.note}</Note>
      <label className="field">
        追加で確認する証拠
        <SavedNote
          storageKey={storageKey + ":evidence"}
          initial="対策後の再評価と、影響の高い失敗を現場責任者と確認する。"
        />
      </label>
    </Panel>
  );
}
function Evidence({ page, storageKey }) {
  const [items, setItems] = useSaved(storageKey + ":evidence", page.items);
  const done = items.filter((r) => r[3] === "確認済み").length;
  return (
    <>
      <div className="evidence-header">
        <Metric
          value={`${done} / ${items.length}`}
          label="根拠を確認した項目"
        />
        <p>{page.note}</p>
      </div>
      <div className="evidence-grid">
        {items.map((r, i) => (
          <Panel key={r[0]} title={r[0]}>
            <p>{r[1]}</p>
            <label className="field">
              根拠の文書・記録
              <input
                value={r[2]}
                onChange={(e) =>
                  setItems(
                    items.map((x, j) =>
                      j === i ? [x[0], x[1], e.target.value, "未確認"] : x,
                    ),
                  )
                }
              />
            </label>
            <label className="field">
              確認状況
              <select
                value={r[3]}
                onChange={(e) =>
                  setItems(
                    items.map((x, j) =>
                      j === i ? [x[0], x[1], x[2], e.target.value] : x,
                    ),
                  )
                }
              >
                <option>未確認</option>
                <option>追加確認</option>
                <option
                  disabled={
                    !r[2].trim() || /未提出|未収集|未実施|待ち|予定/.test(r[2])
                  }
                >
                  確認済み
                </option>
              </select>
            </label>
            <p className="muted">
              根拠を書き換えた場合は、再確認のため未確認に戻ります。
            </p>
          </Panel>
        ))}
      </div>
    </>
  );
}
function Weighted({ page, storageKey }) {
  const [weights, setWeights] = useSaved(storageKey + ":weights", page.weights);
  const [scores, setScores] = useSaved(storageKey + ":scores", page.scores);
  const sum = weights.reduce((a, b) => a + Number(b), 0);
  const valid =
    weights.every((n) => n !== "" && Number.isFinite(+n) && +n >= 0) && sum > 0;
  const results = scores.map((r) =>
    valid ? r.reduce((a, b, i) => a + b * weights[i], 0) / sum : 0,
  );
  const best = Math.max(...results);
  return (
    <>
      <div className="compare-options">
        {page.candidates.map((c, i) => (
          <section
            key={c}
            className={
              "compare-option " +
              (valid && results[i] === best ? "selected" : "")
            }
          >
            <small>
              {valid && results[i] === best ? "HIGHEST SCORE" : "CANDIDATE"}
            </small>
            <h2>{c}</h2>
            <Metric
              value={valid ? results[i].toFixed(2) : "—"}
              label="重み付き平均 / 5点"
            />
          </section>
        ))}
      </div>
      <Panel title="評価軸と配点">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>評価軸</th>
                <th>重み</th>
                {page.candidates.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.criteria.map((c, i) => (
                <tr key={c}>
                  <th>{c}</th>
                  <td>
                    <input
                      type="number"
                      min="0"
                      aria-label={c + " 重み"}
                      value={weights[i]}
                      onChange={(e) =>
                        setWeights(
                          weights.map((v, j) => (i === j ? e.target.value : v)),
                        )
                      }
                    />
                  </td>
                  {scores.map((r, j) => (
                    <td key={j}>
                      <select
                        aria-label={`${c} ${page.candidates[j]}`}
                        value={r[i]}
                        onChange={(e) =>
                          setScores(
                            scores.map((row, ri) =>
                              row.map((v, ci) =>
                                ri === j && ci === i ? +e.target.value : v,
                              ),
                            ),
                          )
                        }
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note warning={!valid}>
          {valid
            ? `重みの合計 ${sum}。合計で割って正規化しています。`
            : "0以上の重みを入力してください。合計は0より大きい値が必要です。"}
          <br />
          {page.note}
        </Note>
        <label className="field">
          必須条件・採用前の確認
          <SavedNote
            storageKey={storageKey + ":conditions"}
            initial="構内利用、対象品種、支援体制を確認してから候補を絞る。"
          />
        </label>
      </Panel>
    </>
  );
}
function LogAudit({ page, storageKey }) {
  const [input, setInput] = useSaved(storageKey + ":csv", page.input);
  const report = auditLog(input);
  return (
    <div className="two-column">
      <Panel title="業務ログのサンプル">
        <label className="field">
          CSV（case_id,activity,timestamp）
          <textarea
            className="log-editor"
            rows={13}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <p className="muted">{page.note}</p>
      </Panel>
      <Panel title="検査結果">
        <div className="inline-metrics">
          <Metric
            value={report.events.length}
            label="読めた重複除外後のイベント"
          />
          <Metric value={report.cases} label="ケース数" />
        </div>
        {report.issues.length ? (
          <>
            <h3>{report.issues.length}件の確認事項</h3>
            {report.issues.map((s, i) => (
              <div className="log-issue" key={i}>
                <AlertTriangle size={16} />
                {s}
              </div>
            ))}
          </>
        ) : (
          <Note>
            この簡易検査で形式上の問題は見つかりませんでした。記録の業務上の正しさは別途確認してください。
          </Note>
        )}
        <h3>次の確認</h3>
        <p>
          時刻の取得元とケースIDの意味を担当者と揃え、ケースの開始・終了が記録されているか確認します。
        </p>
      </Panel>
    </div>
  );
}
function Variants({ page, storageKey }) {
  const [items, setItems] = useSaved(storageKey + ":variants", page.items);
  const valid = items.every(
    (r) =>
      r.slice(2).every((n) => n !== "" && Number.isFinite(+n) && +n >= 0) &&
      Number.isInteger(+r[2]),
  );
  const total = items.reduce((s, r) => s + +r[2], 0),
    avg = items.reduce((s, r) => s + r[2] * r[3], 0) / total;
  return (
    <Panel title="経路別の量と時間">
      <div className="inline-metrics">
        <Metric value={valid ? total : "—"} label="対象件数" />
        <Metric
          value={valid && total ? format(avg) + "h" : "—"}
          label="全体の加重平均所要時間"
        />
      </div>
      {items.map((r, i) => (
        <div className="variant-row" key={r[0]}>
          <div>
            <span className="badge">{r[0]}</span>
            <h3>{r[1]}</h3>
            <Progress value={valid && total ? (r[2] / total) * 100 : 0} />
          </div>
          <label>
            件数
            <input
              aria-label={r[0] + " 件数"}
              type="number"
              min="0"
              value={r[2]}
              onChange={(e) =>
                setItems(
                  items.map((x, j) =>
                    j === i ? [x[0], x[1], e.target.value, x[3]] : x,
                  ),
                )
              }
            />
          </label>
          <label>
            平均時間（h）
            <input
              aria-label={r[0] + " 時間"}
              type="number"
              min="0"
              step="any"
              value={r[3]}
              onChange={(e) =>
                setItems(
                  items.map((x, j) =>
                    j === i ? [x[0], x[1], x[2], e.target.value] : x,
                  ),
                )
              }
            />
          </label>
        </div>
      ))}
      {!valid && <Note warning>0以上の値、件数は整数で入力してください。</Note>}
      <Note>{page.note}</Note>
    </Panel>
  );
}
function ValueStream({ page, storageKey }) {
  const [items, setItems] = useSaved(storageKey + ":times", page.items);
  const valid = items.every((r) =>
    r.slice(1).every((v) => v !== "" && Number.isFinite(+v) && +v >= 0),
  );
  const work = items.reduce((a, r) => a + +r[1], 0),
    wait = items.reduce((a, r) => a + +r[2], 0),
    total = work + wait;
  return (
    <Panel title="時間を分けて観測する">
      <div className="inline-metrics">
        <Metric
          value={valid ? format(total / 60) + "h" : "—"}
          label="作業＋待ちの合計"
        />
        <Metric
          value={valid && total ? format((work / total) * 100) + "%" : "—"}
          label="作業時間比率"
        />
        <Metric
          value={valid ? format(wait / 60) + "h" : "—"}
          label="待ち時間の合計"
        />
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>工程</th>
              <th>作業（分）</th>
              <th>待ち（分）</th>
              <th>時間の内訳</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={r[0]}>
                <th>{r[0]}</th>
                {[1, 2].map((k) => (
                  <td key={k}>
                    <input
                      aria-label={r[0] + (k === 1 ? " 作業" : " 待ち")}
                      type="number"
                      min="0"
                      value={r[k]}
                      onChange={(e) =>
                        setItems(
                          items.map((x, j) =>
                            x.map((v, l) =>
                              i === j && k === l ? e.target.value : v,
                            ),
                          ),
                        )
                      }
                    />
                  </td>
                ))}
                <td>
                  <div className="split-bar">
                    <span
                      style={{
                        width:
                          valid && +r[1] + +r[2]
                            ? (r[1] / (+r[1] + +r[2])) * 100 + "%"
                            : "0%",
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        濃い色：作業 /
        薄い色：待ち。各工程内の比率であり、工程間の長さは比較できません。
      </p>
      <Note warning={!valid}>
        {valid ? page.note : "すべての時間を0以上の数値で入力してください。"}
      </Note>
    </Panel>
  );
}
function Rules({ page, storageKey }) {
  const [v, setV] = useSaved(storageKey + ":rules", {
    amount: 120,
    match: "一致",
    single: "いいえ",
  });
  const valid = v.amount !== "" && Number.isFinite(+v.amount) && +v.amount >= 0;
  const path =
    v.match === "不一致"
      ? 0
      : v.single === "はい"
        ? 1
        : +v.amount >= 100
          ? 2
          : 3;
  const rules = [
    "仕様不一致 → 依頼者へ差戻し",
    "単一供給 → 例外承認の経路",
    "100万円以上 → 部門長の承認",
    "100万円未満 → 担当承認",
  ];
  return (
    <div className="two-column">
      <Panel title="試す見積条件">
        <label className="field">
          見積金額（万円）
          <input
            type="number"
            min="0"
            value={v.amount}
            onChange={(e) => setV({ ...v, amount: e.target.value })}
          />
        </label>
        <label className="field">
          要求仕様との一致
          <select
            value={v.match}
            onChange={(e) => setV({ ...v, match: e.target.value })}
          >
            <option>一致</option>
            <option>不一致</option>
          </select>
        </label>
        <label className="field">
          供給可能な会社が1社のみ
          <select
            value={v.single}
            onChange={(e) => setV({ ...v, single: e.target.value })}
          >
            <option>いいえ</option>
            <option>はい</option>
          </select>
        </label>
      </Panel>
      <Panel title="適用された最初のルール">
        <div className="rule-list">
          {rules.map((r, i) => (
            <div className={valid && i === path ? "selected" : ""} key={r}>
              <span>{i + 1}</span>
              {r}
              {valid && i === path && <Check size={18} />}
            </div>
          ))}
        </div>
        <Note warning={!valid}>
          {valid ? page.note : "見積金額を0以上で入力してください。"}
        </Note>
      </Panel>
    </div>
  );
}
function Control({ page, storageKey }) {
  const [raw, setRaw] = useSaved(
    storageKey + ":observations",
    page.observations.join(", "),
  );
  const [target, setTarget] = useSaved(storageKey + ":target", page.target);
  const list = raw.split(",").map((x) => x.trim()),
    v = list.map(Number),
    valid =
      list.length >= 2 &&
      list.length <= 100 &&
      list.every((x) => x !== "" && Number.isFinite(+x) && +x >= 0) &&
      target !== "" &&
      Number.isFinite(+target) &&
      +target >= 0;
  const mean = page.baseline.reduce((a, b) => a + b, 0) / page.baseline.length,
    sd = Math.sqrt(
      page.baseline.reduce((a, b) => a + (b - mean) ** 2, 0) /
        (page.baseline.length - 1),
    ),
    upper = mean + 3 * sd,
    lower = Math.max(0, mean - 3 * sd),
    max = Math.max(upper, +target, ...(valid ? v : [])) * 1.15;
  const y = (n) => 210 - (n / max) * 180;
  const outside = valid
    ? v.map((n, i) => (n > upper || n < lower ? i + 1 : null)).filter(Boolean)
    : [];
  return (
    <>
      <div className="two-column">
        <Panel title="改善後の測定値">
          <label className="field">
            日次の処理時間（分・カンマ区切り）
            <textarea
              rows={4}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </label>
          <label className="field">
            目標値（分）
            <input
              type="number"
              min="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </label>
          <p className="muted">
            固定した基準期間：{page.baseline.join(", ")}分
          </p>
        </Panel>
        <Panel title="基準期間との比較">
          <div className="inline-metrics">
            <Metric value={format(mean)} label="基準平均（分）" />
            <Metric
              value={format(lower) + "–" + format(upper)}
              label="参考の上下限（分）"
            />
          </div>
          <Note warning={!valid || outside.length > 0}>
            {!valid
              ? "0以上の測定値を2〜100点、目標値も0以上で入力してください。"
              : outside.length
                ? `限界外：${outside.join("、")}点目。測定条件と特別な原因を確認。`
                : "この範囲では限界外の点はありません。安定性を保証する判定ではありません。"}
          </Note>
        </Panel>
      </div>
      <Panel title="時系列の変化">
        {valid && (
          <svg
            className="control-chart"
            viewBox="0 0 920 260"
            role="img"
            aria-label={`参考限界外 ${outside.length}点。目標は${target}分。`}
          >
            {[
              [upper, "参考上限", "#ba654f"],
              [mean, "基準平均", "#6a7d69"],
              [lower, "参考下限", "#ba654f"],
              [+target, "目標", "#456bba"],
            ].map(([n, label, color], i) => (
              <g key={label}>
                <line
                  x1="45"
                  x2="760"
                  y1={y(n)}
                  y2={y(n)}
                  stroke={color}
                  strokeDasharray="5 4"
                />
                <text x="775" y={40 + i * 24} style={{ fill: color }}>
                  {label} {format(n)}
                </text>
              </g>
            ))}
            <polyline
              points={v
                .map((n, i) => `${45 + (i / (v.length - 1)) * 715},${y(n)}`)
                .join(" ")}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
            />
            {v.map((n, i) => (
              <g key={i}>
                <circle
                  cx={45 + (i / (v.length - 1)) * 715}
                  cy={y(n)}
                  r="5"
                  fill={outside.includes(i + 1) ? "#bd5942" : "var(--accent)"}
                />
                <text
                  x={45 + (i / (v.length - 1)) * 715}
                  y="238"
                  textAnchor="middle"
                >
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
        )}
        <Note>{page.note}</Note>
      </Panel>
    </>
  );
}
function Ledger({ page, storageKey }) {
  const [selected, setSelected] = useSaved(storageKey + ":accepted", [2, 3]);
  const groups = {};
  page.items.forEach((r, i) => {
    const key = r.slice(1, 4).join(" / ");
    (groups[key] ??= []).push(i);
  });
  const total = selected.reduce((s, i) => s + page.items[i][4], 0);
  const verified = selected
    .filter((i) => page.items[i][5] === "確認済み")
    .reduce((s, i) => s + page.items[i][4], 0);
  const toggle = (i) => {
    const group = Object.values(groups).find((g) => g.includes(i));
    setSelected(
      selected.includes(i)
        ? selected.filter((x) => x !== i)
        : [...selected.filter((x) => !group.includes(x)), i],
    );
  };
  return (
    <Panel title="効果を採用する単位を揃える">
      <div className="inline-metrics">
        <Metric value={format(total) + "h"} label="選択した行の申告合計" />
        <Metric value={format(verified) + "h"} label="うち確認済みの効果" />
        <Metric
          value={Object.values(groups).filter((g) => g.length > 1).length}
          label="重複候補の組数"
        />
      </div>
      {Object.entries(groups).map(([key, indices]) => (
        <div className="ledger-group" key={key}>
          <h3>
            {key}
            {indices.length > 1 && (
              <span className="badge warning">重複候補：1行だけ選択</span>
            )}
          </h3>
          {indices.map((i) => {
            const r = page.items[i];
            return (
              <label className="check-row" key={i}>
                <input
                  type="checkbox"
                  checked={selected.includes(i)}
                  onChange={() => toggle(i)}
                />
                <span>
                  <strong>{r[0]}</strong> · {r[4]}時間{" "}
                  <span className="badge">{r[5]}</span>
                </span>
              </label>
            );
          })}
        </div>
      ))}
      <Note>{page.note}</Note>
      <label className="field">
        確認した重複範囲・採用理由
        <SavedNote
          storageKey={storageKey + ":rationale"}
          initial="見積比較の2件は同じ転記時間を含む可能性。測定対象を確認するまで合算しない。"
        />
      </label>
    </Panel>
  );
}
export const advancedComponents = {
  modelcalc: ModelCalc,
  benchmark: Benchmark,
  cohort: Cohort,
  scenario: Scenario,
  quiz: Quiz,
  redaction: Redaction,
  scheduler: Scheduler,
  risk: Risk,
  evidence: Evidence,
  weighted: Weighted,
  logaudit: LogAudit,
  variants: Variants,
  valuestream: ValueStream,
  rules: Rules,
  control: Control,
  ledger: Ledger,
};
export const advancedUsage = {
  modelcalc: "前提を変え、結果と計算式を確認。",
  benchmark: "評価点を変更し、平均値と弱い条件を確認。",
  cohort: "人数を編集し、同じ受講者の利用率を比較。",
  scenario: "場面と判断を選び、理由を確認。",
  quiz: "回答して、判断理由を振り返る。",
  redaction: "架空の文章を置換し、残る情報を確認。",
  scheduler: "開始時刻を変えて、充電枠の重複を解消。",
  risk: "影響・発生・検出を評価し、対策の優先度を検討。",
  evidence: "証拠の所在を記録し、確認済みと未確認を分ける。",
  weighted: "配点を変え、候補の順位が変わるか確認。",
  logaudit: "ログを修正して、欠落・重複・時刻の警告を解消。",
  variants: "件数と所要時間を変え、経路別の影響を比較。",
  valuestream: "作業と待ちを編集して、時間の内訳を確認。",
  rules: "見積条件を変え、適用される判断ルールを確認。",
  control: "測定値を変え、基準から外れる点を確認。",
  ledger: "重複候補を確認し、合算する効果を1行ずつ選択。",
};
