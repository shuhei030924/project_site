export const format = (n) =>
  new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 }).format(n);
export function calculateModel(model, raw) {
  const v = raw.map(Number),
    [a, b, c, d] = v;
  if (
    raw.some((x) => String(x).trim() === "") ||
    v.some((x) => !Number.isFinite(x) || x < 0)
  )
    return { error: "すべての条件に0以上の数値を入力してください。" };
  const pctModels = { difference: [0, 1, 2, 3], realized: [1] };
  if (pctModels[model]?.some((i) => v[i] > 100))
    return { error: "割合は0〜100%で入力してください。" };
  const denominators = {
    support: [2],
    capacity: [0, 1, 2],
    normalized: [1, 3],
  };
  if (denominators[model]?.some((i) => v[i] <= 0))
    return { error: "時間・件数の分母は0より大きい値にしてください。" };
  const integerFields = {
    support: [0, 3],
    capacity: [1, 3],
    reliability: [1],
    reorder: [0, 2, 3],
    staffing: [0, 3],
    funnel: [0, 1, 2, 3],
    normalized: [1, 3],
  };
  if (integerFields[model]?.some((i) => !Number.isInteger(v[i])))
    return { error: "人数・台数・件数・個数は整数で入力してください。" };
  const out = (value, label, formula, metrics) => ({
    value: typeof value === "number" ? format(value) : value,
    label,
    formula,
    metrics,
  });
  if (model === "support") {
    const cap = Math.floor((a * b * 60) / c);
    return out(
      cap,
      "件 / 月の相談枠",
      "人数 × 支援時間 × 60 ÷ 相談時間（端数切捨て）",
      [
        ["相談件数", d + "件"],
        ["未割当の余力", cap - d + "件"],
      ],
    );
  }
  if (model === "capacity") {
    const cap = Math.floor(a / c) * d;
    return out(
      cap,
      "回 / シフトの搬送上限",
      "各機の完了回数 floor(実稼働時間 ÷ 往復時間) × 台数",
      [
        ["要求タクト", format(a / b) + "分 / 回"],
        ["必要な機体数（時間比の下限）", Math.ceil((b * c) / a) + "台"],
        ["需要との差", cap - b + "回"],
      ],
    );
  }
  if (model === "tco")
    return out(
      a + b * 5 + c - d,
      "万円 / 5年間",
      "導入費 ＋ 年間運用費 × 5 ＋ 更新費 − 残存価値",
      [
        ["運用費の累計", format(b * 5) + "万円"],
        ["残存価値控除前", format(a + b * 5 + c) + "万円"],
      ],
    );
  if (model === "reliability") {
    if (b === 0 && c > 0)
      return {
        error: "故障0件で復旧時間が正のため、集計条件を確認してください。",
      };
    const total = a + c + d;
    return out(
      b ? a / b : "—",
      "h / MTBF（平均故障間隔）",
      "MTBF＝稼働時間÷故障件数、MTTR＝復旧時間÷故障件数",
      [
        ["MTTR", b ? format(c / b) + "h" : "故障0件のため未推定"],
        [
          "観測稼働比率",
          total ? format((a / total) * 100) + "%" : "観測時間なし",
        ],
        ["計画停止", format(d) + "h"],
      ],
    );
  }
  if (model === "reorder") {
    const point = Math.ceil((a * b) / 30 + c);
    return out(
      point,
      "個 / 補充点の目安",
      "月間使用数 × リードタイム ÷ 30 ＋ 安全在庫（切上げ）",
      [
        ["補充点までの不足", Math.max(0, point - d) + "個"],
        ["リードタイム中の平均使用", format((a * b) / 30) + "個"],
      ],
    );
  }
  if (model === "staffing") {
    const demand = (a * b) / 60,
      supply = c * d;
    return out(
      supply - demand,
      "h / 日の余力",
      "担当人数 × 処理可能時間 − 依頼件数 × 所要時間 ÷ 60",
      [
        ["必要な作業時間", format(demand) + "h"],
        ["確保した時間", format(supply) + "h"],
        [
          "必要人数",
          c > 0 ? Math.ceil(demand / c) + "人" : "算出不可（処理可能時間0）",
        ],
      ],
    );
  }
  if (model === "difference")
    return out(
      b - a - (d - c),
      "ポイント / 前後差の差",
      "（施策群の後 − 前）−（比較群の後 − 前）",
      [
        ["施策群の変化", format(b - a) + "pt"],
        ["比較群の変化", format(d - c) + "pt"],
      ],
    );
  if (model === "funnel") {
    if (a < b || b < c || c < d)
      return {
        error: "同じ案件群では、面談 ≥ 評価 ≥ 実証 ≥ 運用の件数になります。",
      };
    return out(
      a ? (d / a) * 100 : "—",
      "% / 面談から運用への移行率",
      "運用件数 ÷ 面談件数 × 100",
      [
        ["面談→評価", a ? format((b / a) * 100) + "%" : "分母0"],
        ["評価→実証", b ? format((c / b) * 100) + "%" : "分母0"],
        ["実証→運用", c ? format((d / c) * 100) + "%" : "分母0"],
      ],
    );
  }
  if (model === "normalized")
    return out(
      (a / b - c / d) * d,
      "h / 改善後の件数に揃えた短縮",
      "（改善前h ÷ 件数 − 改善後h ÷ 件数）× 改善後件数",
      [
        ["改善前1件あたり", format((a / b) * 60) + "分"],
        ["改善後1件あたり", format((c / d) * 60) + "分"],
        ["単純な総時間差", format(a - c) + "h（件数差を含む）"],
      ],
    );
  if (model === "realized") {
    const net = (a * b) / 100 - c;
    return out(
      net,
      "h / 月の純創出時間",
      "全面利用時の短縮 × 利用割合 ÷ 100 − 追加負担",
      [
        ["年間換算", format(net * 12) + "h"],
        ["年間の時間価値換算", format((net * 12 * d) / 10000) + "万円"],
      ],
    );
  }
  return { error: "未定義の計算モデルです。" };
}
export function auditLog(text) {
  const lines = text.trim().split(/\r?\n/),
    issues = [],
    events = [];
  if (lines[0]?.trim() !== "case_id,activity,timestamp")
    return {
      issues: ["1行目は case_id,activity,timestamp にしてください。"],
      events: [],
      cases: 0,
    };
  const seen = new Set(),
    last = new Map();
  lines.slice(1).forEach((line, i) => {
    const fields = line.split(",").map((x) => x.trim()),
      num = i + 2;
    if (fields.length !== 3 || fields.some((x) => !x)) {
      issues.push(`${num}行：必須項目が欠落、または列数が不正。`);
      return;
    }
    const [id, activity, time] = fields,
      timestamp = Date.parse(time);
    const parts =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:Z|[+-](\d{2}):(\d{2}))$/.exec(
        time,
      );
    const calendar =
      parts && new Date(`${parts[1]}-${parts[2]}-${parts[3]}T00:00:00Z`);
    if (
      !parts ||
      !Number.isFinite(timestamp) ||
      calendar.getUTCDate() !== +parts[3] ||
      +parts[4] > 23 ||
      +parts[5] > 59 ||
      +parts[6] > 59 ||
      +(parts[7] || 0) > 23 ||
      +(parts[8] || 0) > 59
    ) {
      issues.push(`${num}行：実在する日付とタイムゾーン付きISO時刻が必要。`);
      return;
    }
    const signature = JSON.stringify(fields);
    if (seen.has(signature)) {
      issues.push(`${num}行：同じケース・活動・時刻の重複。`);
      return;
    }
    seen.add(signature);
    if (last.has(id) && timestamp < last.get(id))
      issues.push(`${num}行：${id} の時刻が前の行より前。元の記録順を確認。`);
    last.set(id, timestamp);
    events.push({ id, activity, time });
  });
  return { issues, events, cases: new Set(events.map((e) => e.id)).size };
}
export function conflicts(items) {
  const parsed = items.map(([name, start, duration]) => {
    const match = /^(\d{2}):(\d{2})$/.exec(start);
    const begin = match ? +match[1] * 60 + +match[2] : -1;
    return {
      name,
      begin,
      end: begin + +duration,
      valid:
        !!match &&
        +match[1] < 24 &&
        +match[2] < 60 &&
        duration !== "" &&
        +duration > 0 &&
        begin + +duration <= 1440,
    };
  });
  const pairs = [];
  parsed.forEach((a, i) =>
    parsed.forEach((b, j) => {
      if (j > i && a.valid && b.valid && a.begin < b.end && b.begin < a.end)
        pairs.push([a.name, b.name]);
    }),
  );
  return { parsed, pairs };
}

// --- 第3期（frontier）で追加した純粋な計算 ---
export const KANO = {
  labels: ["魅力的", "一元的", "当たり前", "無関心", "逆", "要確認"],
  keys: ["A", "O", "M", "I", "R", "Q"],
  // 行：機能あり(好き/当然/どちらでも/我慢/嫌い)、列：機能なし
  table: [
    ["Q", "A", "A", "A", "O"],
    ["R", "I", "I", "I", "M"],
    ["R", "I", "I", "I", "M"],
    ["R", "I", "I", "I", "M"],
    ["R", "R", "R", "R", "Q"],
  ],
};
export function kanoCategory(functional, dysfunctional) {
  const key = KANO.table[functional]?.[dysfunctional];
  if (!key) return null;
  return { key, label: KANO.labels[KANO.keys.indexOf(key)] };
}
export function littlesLaw(wip, throughput) {
  if (!(throughput > 0) || !(wip >= 0)) return null;
  return wip / throughput;
}
// 概念理解用の簡略式。ISO 13855系の S = K×T + C を人と機体の接近速度で展開。
export function separationDistance({ human, robot, react, stop, margin }) {
  const v = [human, robot, react, stop, margin].map(Number);
  if (v.some((n) => !Number.isFinite(n) || n < 0)) return null;
  const [vh, vr, tr, ts, c] = v;
  return {
    humanTravel: vh * (tr + ts),
    robotTravel: vr * (tr + ts),
    margin: c,
    total: vh * (tr + ts) + vr * (tr + ts) + c,
  };
}
export function pathMetrics(points) {
  let distance = 0,
    crossings = 0;
  const cross = (a, b, c, d) => {
    const s = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
    const d1 = s(c, d, a),
      d2 = s(c, d, b),
      d3 = s(a, b, c),
      d4 = s(a, b, d);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1],
      [x2, y2] = points[i];
    distance += Math.hypot(x2 - x1, y2 - y1);
    for (let j = 1; j < i - 1; j++)
      if (cross(points[j - 1], points[j], points[i - 1], points[i])) crossings++;
  }
  return { distance, crossings };
}
export function busFactor(matrix) {
  const counts = matrix.map((row) => row.filter(Boolean).length);
  return { counts, factor: counts.length ? Math.min(...counts) : 0 };
}
export function hhi(shares) {
  const total = shares.reduce((a, b) => a + Number(b || 0), 0);
  if (!(total > 0)) return null;
  return shares.reduce((s, n) => s + ((Number(n || 0) / total) * 100) ** 2, 0);
}
export function percentile(values, p) {
  const v = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!v.length) return null;
  const pos = (v.length - 1) * p,
    lo = Math.floor(pos),
    hi = Math.ceil(pos);
  return v[lo] + (v[hi] - v[lo]) * (pos - lo);
}
export function tokens(text) {
  // 日本語は分かち書きしないため、助詞・句読点を除いた二文字連鎖（bigram）を語の代わりに使う
  const chunks = String(text)
    .toLowerCase()
    .replace(/[のをにへではがともやからへ、。,.・「」（）()\s]+/g, " ")
    .split(" ")
    .filter(Boolean);
  const set = new Set();
  chunks.forEach((c) => {
    if (c.length === 1) set.add(c);
    for (let i = 0; i < c.length - 1; i++) set.add(c.slice(i, i + 2));
  });
  return set;
}
export function jaccard(a, b) {
  const A = tokens(a),
    B = tokens(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}
export function sequenceDiff(standard, actual) {
  const n = standard.length,
    m = actual.length,
    dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] =
        standard[i] === actual[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0,
    j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && standard[i] === actual[j]) {
      ops.push({ type: "match", step: standard[i] });
      i++;
      j++;
    } else if (j < m && (i === n || dp[i][j + 1] >= dp[i + 1][j])) {
      ops.push({ type: "extra", step: actual[j] });
      j++;
    } else {
      ops.push({ type: "skipped", step: standard[i] });
      i++;
    }
  }
  return {
    ops,
    skipped: ops.filter((o) => o.type === "skipped").length,
    extra: ops.filter((o) => o.type === "extra").length,
  };
}
export function sampleSize(baselinePct, deltaPts) {
  const p1 = baselinePct / 100,
    p2 = p1 + deltaPts / 100;
  if (!(p1 > 0 && p1 < 1 && p2 > 0 && p2 < 1) || deltaPts === 0) return null;
  const pBar = (p1 + p2) / 2,
    z = 1.96 + 0.84;
  return Math.ceil((2 * z ** 2 * pBar * (1 - pBar)) / (p2 - p1) ** 2);
}
export function heijunka(demands, capacity) {
  const d = demands.map(Number);
  if (!d.length || d.some((n) => !Number.isFinite(n) || n < 0)) return null;
  const total = d.reduce((a, b) => a + b, 0),
    level = total / d.length;
  // 平準生産で需要を満たすために期首に必要な在庫 = 累積不足の最大値
  let running = 0,
    minStock = 0;
  d.forEach((n) => {
    running += level - n;
    minStock = Math.min(minStock, running);
  });
  return {
    level,
    peak: Math.max(...d),
    buffer: Math.ceil(-minStock),
    overCapacityDays: d.filter((n) => n > capacity).length,
    levelFits: level <= capacity,
  };
}
export function kingman(utilization, ca, cs, serviceTime) {
  const rho = Number(utilization) / 100;
  if (!(rho >= 0 && rho < 1) || !(serviceTime > 0)) return null;
  return (rho / (1 - rho)) * ((ca ** 2 + cs ** 2) / 2) * serviceTime;
}
export function oee({ planned, downtime, idealCycle, count, defects }) {
  const v = [planned, downtime, idealCycle, count, defects].map(Number);
  if (v.some((n) => !Number.isFinite(n) || n < 0)) return null;
  const [p, d, c, n, x] = v;
  if (!(p > 0) || d > p || x > n) return null;
  const run = p - d;
  const availability = run / p,
    performance = run > 0 ? Math.min(1, (c * n) / 60 / run) : 0,
    quality = n > 0 ? (n - x) / n : 0;
  return {
    availability,
    performance,
    quality,
    oee: availability * performance * quality,
    run,
  };
}
export function brier(items) {
  // items: [{confidence: 0-100, correct: bool}]
  if (!items.length) return null;
  return (
    items.reduce(
      (s, it) => s + (it.confidence / 100 - (it.correct ? 1 : 0)) ** 2,
      0,
    ) / items.length
  );
}
export function wordDiff(a, b) {
  const A = String(a).split(/(\s+|[、。])/).filter((w) => w.trim()),
    B = String(b).split(/(\s+|[、。])/).filter((w) => w.trim());
  const { ops } = sequenceDiff(A, B);
  return {
    ops,
    changed: ops.filter((o) => o.type !== "match").length,
    ratio: A.length + B.length ? ops.filter((o) => o.type !== "match").length / Math.max(A.length, B.length) : 0,
  };
}
export function envelopeAllows(envelope, weight, offset) {
  // envelope: [[weight, maxOffset], ...] 昇順。線形補間で許容偏心を求める。
  const pts = envelope.map(([w, o]) => [Number(w), Number(o)]);
  if (weight < pts[0][0] || weight > pts[pts.length - 1][0]) return { allowed: false, limit: 0 };
  for (let i = 1; i < pts.length; i++) {
    const [w0, o0] = pts[i - 1],
      [w1, o1] = pts[i];
    if (weight <= w1) {
      const limit = w1 === w0 ? o1 : o0 + ((o1 - o0) * (weight - w0)) / (w1 - w0);
      return { allowed: offset <= limit, limit };
    }
  }
  return { allowed: false, limit: 0 };
}
export function canaryVerdict({ canaryErr, controlErr, tolerance, exposure, budget }) {
  const v = [canaryErr, controlErr, tolerance, exposure, budget].map(Number);
  if (v.some((n) => !Number.isFinite(n) || n < 0)) return null;
  const [ce, co, tol, ex, bud] = v;
  const blended = (ce * ex + co * (100 - ex)) / 100;
  const verdict = ce - co > tol ? "rollback" : ce > co ? "hold" : "proceed";
  return { blended, budgetUse: bud > 0 ? (blended / bud) * 100 : null, verdict };
}
export function costOfDelay(valuePerWeek, weeks) {
  return weeks > 0 ? valuePerWeek / weeks : null;
}
