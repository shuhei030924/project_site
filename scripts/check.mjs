import { sites, allPages } from "../src/data.js";
import assert from "node:assert/strict";
import { research } from "../src/research.js";
import { extraPages } from "../src/advanced-data.js";
import { calculateModel, auditLog, conflicts } from "../src/models.js";
assert.equal(sites.length, 5);
assert.equal(allPages.length, 150);
const supported = new Set(
  "dashboard learning catalog editor stories people events booking assessment analytics checklist compare feed matrix calculator playbook form recognition report fleet board flow experiment timeline table review radar raci handoff a3 modelcalc benchmark cohort scenario quiz redaction scheduler risk evidence weighted logaudit variants valuestream rules control ledger".split(
    " ",
  ),
);
for (const site of sites) {
  assert.equal(site.pages.length, 30, site.name);
  assert.equal(new Set(site.pages.map((p) => p.id)).size, 30);
  assert.equal(new Set(site.pages.map((p) => p.title)).size, 30);
  assert.equal(extraPages[site.id].length, 10);
  assert(
    site.pages.some((p) => ["analytics", "radar"].includes(p.type)),
    `${site.id}: dashboard analysis target`,
  );
  for (const p of site.pages) {
    assert(supported.has(p.type), `${site.name}/${p.id}: unsupported type`);
    assert(p.title && p.description);
    if (p.advanced) {
      assert(research[p.source], `${site.id}/${p.id}: research source`);
      assert(
        site.pages.some((x) => x.id === p.next),
        `${site.id}/${p.id}: next action`,
      );
    }
    if (p.type === "modelcalc") {
      assert.equal(p.labels.length, p.values.length);
      assert(
        !calculateModel(p.model, p.values).error,
        `${site.id}/${p.id}: model inputs`,
      );
    }
    if (["benchmark", "weighted"].includes(p.type)) {
      assert.equal(p.scores.length, p.candidates.length);
      p.scores.forEach((r) => {
        assert.equal(r.length, p.criteria.length);
        assert(r.every((n) => n >= 1 && n <= 5));
      });
    }
    if (p.type === "quiz")
      p.questions.forEach((q) =>
        assert(q.answer >= 0 && q.answer < q.options.length),
      );
    if (p.type === "scenario")
      p.cases.forEach((c) =>
        assert(c.correct >= 0 && c.correct < c.options.length),
      );
    if (p.target && p.type === "dashboard")
      assert(site.pages.some((x) => x.id === p.target));
    if (p.rows)
      for (const row of p.rows)
        assert.equal(
          row.length,
          p.headers.length,
          `${site.id}/${p.id}: columns`,
        );
    if (p.type === "board")
      for (const row of p.items)
        assert(+row[2] >= 0 && +row[2] < p.stages.length);
    if (["matrix", "raci"].includes(p.type)) {
      assert.equal(p.values.length, p.y.length);
      for (const row of p.values) assert.equal(row.length, p.x.length);
    }
  }
}
console.log(
  "Validated: 5 workspaces, 150 distinct routes, 50 research-backed additions, all schema and next-page links.",
);
const cases = [
  ["support", [6, 4, 30, 60], "48"],
  ["capacity", [420, 80, 11, 2], "76"],
  ["tco", [1200, 120, 180, 100], "1,880"],
  ["reliability", [720, 6, 9, 12], "120"],
  ["reorder", [12, 20, 4, 10], "12"],
  ["staffing", [45, 18, 6, 2], "-1.5"],
  ["difference", [40, 68, 42, 50], "20"],
  ["funnel", [32, 18, 7, 3], "9.4"],
  ["normalized", [180, 1200, 120, 1000], "30"],
  ["realized", [100, 65, 18, 3500], "47"],
];
for (const [model, v, expected] of cases)
  assert.equal(calculateModel(model, v).value, expected, model);
assert(calculateModel("normalized", [180, 0, 120, 1000]).error);
assert(calculateModel("realized", [100, 110, 18, 3500]).error);
assert(calculateModel("funnel", [2, 3, 1, 0]).error);
assert(calculateModel("support", [2.5, 4, 30, 5]).error);
assert(calculateModel("support", ["", 4, 30, 5]).error);
assert.equal(calculateModel("reliability", [720, 0, 0, 12]).value, "—");
const log = auditLog(
  extraPages.workflow.find((p) => p.type === "logaudit").input,
);
assert.equal(log.issues.length, 3);
assert.equal(log.events.length, 4);
assert.equal(log.cases, 2);
for (const invalid of [
  "2026-02-30T09:00:00+09:00",
  "2026-09-16T24:00:00Z",
  "2026-09-16T09:00:00",
]) {
  assert.equal(
    auditLog(`case_id,activity,timestamp\nX,受付,${invalid}`).issues.length,
    1,
  );
}
assert.equal(
  auditLog("case_id,activity,timestamp\nX,受付,2024-02-29T09:00:00+09:00")
    .issues.length,
  0,
);
assert.equal(
  conflicts([
    ["A", "12:00", 30],
    ["B", "12:30", 40],
  ]).pairs.length,
  0,
);
assert.equal(
  conflicts([
    ["A", "12:00", 45],
    ["B", "12:30", 40],
  ]).pairs.length,
  1,
);
assert.equal(conflicts([["A", "25:00", 30]]).parsed[0].valid, false);
console.log(
  "Verified 10 formula examples, denominator/percent/integer guards, log defects, and schedule boundaries.",
);
