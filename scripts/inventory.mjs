import { writeFileSync } from "node:fs";
import { sites } from "../src/data.js";
const base = "https://shuhei030924.github.io/project_site/";
const text =
  "# 150ページの一覧\n\n各サイト30ページ（既存20＋追加10）。21〜30は追加調査に基づく深掘りページです。リンク先は公開サイトです。\n\n" +
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
