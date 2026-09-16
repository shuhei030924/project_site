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
