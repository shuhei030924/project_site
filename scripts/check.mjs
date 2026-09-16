import { sites, allPages } from "../src/data.js";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { visualGuides, guideAssets, guideKinds } from "../src/visual-guides-data.js";
import { research } from "../src/research.js";
import { extraPages } from "../src/advanced-data.js";
import { frontierPages } from "../src/frontier-data.js";
import { technologyAssets, cardIllustrations, illustratedPageGuides } from "../src/card-illustrations-data.js";
import { replacementPages, newsItems, initialKnowledge, knowledgeGroups, pipelineGate, initialPipeline } from "../src/knowledge-data.js";
import {
  calculateModel,
  auditLog,
  conflicts,
  kanoCategory,
  littlesLaw,
  separationDistance,
  pathMetrics,
  busFactor,
  hhi,
  percentile,
  jaccard,
  sequenceDiff,
  sampleSize,
  heijunka,
  kingman,
  oee,
  brier,
  wordDiff,
  envelopeAllows,
  canaryVerdict,
  costOfDelay,
} from "../src/models.js";
assert.equal(sites.length, 5);
assert.equal(allPages.length, 200);
// 知見の関係先・ニュースの根拠・仕掛かり制限を検証する。
const routeSet = new Set(sites.flatMap(s => s.pages.map(p => `#/${s.id}/${p.id}`)));
for (const [key, cards] of Object.entries(cardIllustrations)) {
  const [siteId, pageId] = key.split("/");
  const page = sites.find(s => s.id === siteId)?.pages.find(p => p.id === pageId);
  assert(page && ["catalog", "stories"].includes(page.type), `Illustrated page: ${key}`);
  assert.equal(Object.keys(cards).length, page.items.length, `Every card illustrated: ${key}`);
  for (const [title, visual] of Object.entries(cards)) {
    assert(page.items.some(i => i[0] === title), `Illustrated item: ${key}/${title}`);
    assert(technologyAssets[visual.image]?.alt && visual.look && visual.work && visual.check);
    assert(routeSet.has(visual.route), `Illustrated next action: ${key}/${title}`);
  }
}
for (const asset of Object.values(technologyAssets)) {
  for (const file of [asset.file, asset.original]) assert(existsSync(new URL(`../public/images/${file}`, import.meta.url)), `Missing illustration: ${file}`);
}
for (const guide of illustratedPageGuides) {
  assert(routeSet.has(`#/${guide.site}/${guide.page}`));
  assert(cardIllustrations[`${guide.site}/${guide.page}`] && technologyAssets[guide.image]);
}
for (const n of initialKnowledge) {
  assert(knowledgeGroups.some(g => g.id === n.group));
  assert(n.relation && n.detail && n.evidence);
  assert(routeSet.has(n.route), `Knowledge route: ${n.id}`);
  assert(n.related.every(id => initialKnowledge.some(other => other.id === id)), `Knowledge relation: ${n.id}`);
}
for (const news of newsItems) {
  assert(new URL(news.url).protocol === "https:");
  assert(news.date <= "2026-09-17" && news.fact && news.hypothesis && news.caution);
  assert(routeSet.has(news.route));
}
assert(pipelineGate(initialPipeline, initialPipeline[0], 1, 4).includes("仕掛かり上限"));
assert.equal(pipelineGate(initialPipeline, initialPipeline[0], 1, 5), "");
assert(pipelineGate(initialPipeline, initialPipeline[1], 2, 5).includes("止まった理由"));
assert(pipelineGate(initialPipeline, initialPipeline[0], 2, 5).includes("順に"));
assert(pipelineGate(initialPipeline, initialPipeline[4], 4, 5).includes("確認済み"));
assert.equal(pipelineGate(initialPipeline, { ...initialPipeline[4], effectVerified: true }, 4, 5), "");
assert(pipelineGate(initialPipeline, { ...initialPipeline[0], stage: 4 }, 1, 4).includes("仕掛かり上限"));
const guideRoutes = new Set();
for (const guide of visualGuides) {
  const route = `${guide.site}/${guide.page}`;
  assert(!guideRoutes.has(route), `Duplicate visual guide: ${route}`);
  guideRoutes.add(route);
  assert(sites.find(s => s.id === guide.site)?.pages.some(p => p.id === guide.page), `Visual guide route: ${route}`);
  assert(sites.find(s => s.id === guide.next.site)?.pages.some(p => p.id === guide.next.page), `Visual guide next link: ${route}`);
  assert(guideKinds[guide.kind] && guideAssets[guide.image]?.alt, `Visual guide metadata: ${route}`);
  assert(existsSync(new URL(`../public/images/guides/${guide.image}.png`, import.meta.url)), `Missing image: ${guide.image}`);
  if (guide.kind === "hotspots") assert(guide.points.every(p => p.x > 0 && p.x < 100 && p.y > 0 && p.y < 100), `Hotspot positions: ${route}`);
}
const frontierTypes =
  "chain journey ladder tree spaced pairing claims editdiff pathbuilder calibration andon zone canary hierarchy replay waterfall queue heatmap envelope yamazumi premortem quadrant triangulate concentration split bipartite brieflint samplesize pricing milestonepay sipoc spaghetti heijunka busfactor daylog fieldaudit approvals conformance blueprint terms kano flowlaw pokayoke catchball cd3 changeload dedupe alignment issuetree sla".split(
    " ",
  );
const supported = new Set(
  "dashboard learning catalog editor stories people events booking assessment analytics checklist compare feed matrix calculator playbook form recognition report fleet board flow experiment timeline table review radar raci handoff a3 modelcalc benchmark cohort scenario quiz redaction scheduler risk evidence weighted logaudit variants valuestream rules control ledger"
    .split(" ")
    .concat(frontierTypes, replacementPages.map(p => p[3]), ["adoption-support", "workflow-layers", "execution-tracker", "technology-qbr", "automation-atlas"]),
);
for (const site of sites) {
  assert.equal(site.pages.length, 40, site.name);
  assert.equal(new Set(site.pages.map((p) => p.id)).size, 40);
  assert.equal(new Set(site.pages.map((p) => p.title)).size, 40);
  assert.equal(extraPages[site.id].length, 10);
  assert.equal(frontierPages[site.id].length, 10);
  // 第3期はサイト内で部品を使い回さない（同じようなページの禁止）
  assert.equal(
    new Set(frontierPages[site.id].map((p) => p.type)).size,
    10,
    `${site.id}: frontier types must be distinct`,
  );
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
    if (p.type === "calibration")
      p.questions.forEach(([, options, ans]) =>
        assert(ans >= 0 && ans < options.length),
      );
    if (p.type === "tree") {
      for (const [, yes, no] of Object.values(p.nodes))
        for (const id of [yes, no])
          assert(p.nodes[id] || p.leaves[id], `${site.id}/${p.id}: tree ${id}`);
    }
    if (p.type === "replay")
      assert(p.marks.every((m) => m >= 0 && m < p.events.length));
    if (p.type === "spaghetti")
      assert(p.sequence.every((i) => i >= 0 && i < p.stations.length));
    if (p.type === "bipartite")
      assert(
        p.edges.every(
          ([a, b]) => a < p.partners.length && b < p.techs.length,
        ),
      );
    if (p.type === "blueprint") {
      assert.equal(p.cells.length, p.steps.length);
      p.cells.forEach((c) => assert.equal(c.length, p.layers.length));
    }
    if (p.type === "kano")
      p.requests.forEach((r) => assert(kanoCategory(+r[1], +r[2])));
  }
}
// 第3期の部品は5サイトを通しても重複しない
assert.equal(
  new Set(Object.values(frontierPages).flat().map((p) => p.type)).size,
  50,
);
console.log(
  "Validated: 5 workspaces, 200 distinct routes, 100 research-backed additions (50 distinct frontier widgets), all schema and next-page links.",
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
// 第3期の計算
assert.equal(kanoCategory(0, 4).key, "O");
assert.equal(kanoCategory(1, 4).key, "M");
assert.equal(kanoCategory(0, 2).key, "A");
assert.equal(kanoCategory(2, 2).key, "I");
assert.equal(kanoCategory(4, 0).key, "R");
assert.equal(kanoCategory(0, 0).key, "Q");
assert.equal(littlesLaw(41, 5), 8.2);
assert.equal(littlesLaw(41, 0), null);
assert.equal(
  Math.round(separationDistance({ human: 1600, robot: 250, react: 0.2, stop: 0.4, margin: 200 }).total),
  1310,
);
assert.equal(separationDistance({ human: -1, robot: 0, react: 0, stop: 0, margin: 0 }), null);
const cross = pathMetrics([[0, 0], [2, 2], [2, 0], [0, 2]]);
assert.equal(cross.crossings, 1);
assert.equal(pathMetrics([[0, 0], [3, 4]]).distance, 5);
assert.deepEqual(busFactor([[1, 0], [1, 1]]), { counts: [1, 2], factor: 1 });
assert.equal(hhi([100]), 10000);
assert.equal(hhi([50, 50]), 5000);
assert.equal(hhi([0, 0]), null);
assert.equal(percentile([1, 2, 3, 4, 5], 0.5), 3);
assert.equal(percentile([], 0.9), null);
assert(jaccard("見積比較表の転記を自動化したい", "見積の数値を比較表へ自動で転記する仕組み") >= 0.2);
assert(jaccard("見積比較表の転記を自動化したい", "点検記録の検索を早くしたい") < 0.2);
const diff = sequenceDiff(["a", "b", "c", "d"], ["a", "c", "b", "x", "d"]);
assert.equal(diff.skipped + diff.extra, 3);
assert.equal(sequenceDiff(["a"], ["a"]).skipped, 0);
assert.equal(sampleSize(92, 3), 1059);
assert.equal(sampleSize(92, 0), null);
assert.equal(sampleSize(99, 3), null);
const lev = heijunka([20, 10, 5, 10, 5], 12);
assert.equal(lev.level, 10);
assert.equal(lev.buffer, 10);
assert.equal(lev.overCapacityDays, 1);
assert(kingman(80, 1, 1, 9) > kingman(50, 1, 1, 9));
assert.equal(kingman(100, 1, 1, 9), null);
const e = oee({ planned: 480, downtime: 62, idealCycle: 18, count: 1180, defects: 24 });
assert(e.oee > 0 && e.oee < 1);
assert.equal(oee({ planned: 480, downtime: 500, idealCycle: 18, count: 10, defects: 0 }), null);
assert.equal(brier([{ confidence: 100, correct: true }]), 0);
assert.equal(brier([{ confidence: 100, correct: false }]), 1);
assert.equal(wordDiff("a b c", "a b c").changed, 0);
assert.equal(envelopeAllows([[0, 300], [10, 300], [20, 100]], 15, 150).allowed, true);
assert.equal(envelopeAllows([[0, 300], [10, 300], [20, 100]], 15, 250).allowed, false);
assert.equal(envelopeAllows([[0, 300], [20, 100]], 25, 0).allowed, false);
assert.equal(canaryVerdict({ canaryErr: 2.1, controlErr: 1.2, tolerance: 0.5, exposure: 8, budget: 3 }).verdict, "rollback");
assert.equal(canaryVerdict({ canaryErr: 1.0, controlErr: 1.2, tolerance: 0.5, exposure: 8, budget: 3 }).verdict, "proceed");
assert.equal(costOfDelay(8, 2), 4);
assert.equal(costOfDelay(8, 0), null);
console.log(
  "Verified 10 formula examples, denominator/percent/integer guards, log defects, schedule boundaries, and 20 frontier calculations.",
);
