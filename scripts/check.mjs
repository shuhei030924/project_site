import { sites, allPages } from "../src/data.js";
import assert from "node:assert/strict";
assert.equal(sites.length, 5);
assert.equal(allPages.length, 100);
const supported = new Set(
  "dashboard learning catalog editor stories people events booking assessment analytics checklist compare feed matrix calculator playbook form recognition report fleet board flow experiment timeline table review radar raci handoff a3".split(
    " ",
  ),
);
for (const site of sites) {
  assert.equal(site.pages.length, 20, site.name);
  assert.equal(new Set(site.pages.map((p) => p.id)).size, 20);
  assert.equal(new Set(site.pages.map((p) => p.title)).size, 20);
  assert(
    site.pages.some((p) => ["analytics", "radar"].includes(p.type)),
    `${site.id}: dashboard analysis target`,
  );
  for (const p of site.pages) {
    assert(supported.has(p.type), `${site.name}/${p.id}: unsupported type`);
    assert(p.title && p.description);
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
  "Validated: 5 workspaces, 100 distinct routes, all content types, tables, matrices, boards and dashboard links.",
);
