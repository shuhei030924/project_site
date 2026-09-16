import { writeFileSync } from "node:fs";
import { sites } from "../src/data.js";
const base = "https://shuhei030924.github.io/project_site/";
const text =
  "# 200ページの一覧\n\n各サイト40ページ（初版20＋第2期10＋第3期10）。21〜30は根拠・例外・実現条件を深掘りするページ、31〜40はリーン・品質工学・安全・ソフトウェア運用の定石をこの仕事に当てはめたページです。第3期の50ページはすべて別々の操作部品でできています。リンク先は公開サイトです。\n\n" +
  sites
    .map(
      (s) =>
        "## " +
        s.name +
        "\n\n| # | ページ | 具体的な用途 |\n| --- | --- | --- |\n" +
        s.pages
          .map(
            (p, i) =>
              `| ${i + 1} | [${p.title}](${base}#/${s.id}/${p.id}) | ${p.description} |`,
          )
          .join("\n"),
    )
    .join("\n\n") +
  "\n";
writeFileSync("PAGES.md", text);
