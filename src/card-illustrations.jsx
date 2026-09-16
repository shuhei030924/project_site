import React from "react";
import { ArrowUpRight, Image as ImageIcon } from "lucide-react";
import { cardIllustrations, technologyAssets } from "./card-illustrations-data";

export const illustrationFor = (pageKey, title) =>
  cardIllustrations[pageKey]?.[title];
export const illustrationUrl = (id, original = false) =>
  `${import.meta.env.BASE_URL}images/${technologyAssets[id][original ? "original" : "file"]}`;

export function IllustrationNote({ pageKey }) {
  if (!cardIllustrations[pageKey]) return null;
  return (
    <p className="illustration-note">
      <ImageIcon size={16} />
      <span>
        画像はAI生成の概念図です。カードの詳細で、作業の対象・見る場所・確認条件を確かめられます。
      </span>
    </p>
  );
}
export function CardIllustration({ visual, number, compact = false }) {
  const asset = technologyAssets[visual.image];
  return (
    <div
      className={`card-illustration ${compact ? "card-illustration-story" : ""}`}
    >
      <img
        src={illustrationUrl(visual.image)}
        alt={asset.alt}
        width="1536"
        height="1024"
        loading="lazy"
        decoding="async"
      />
      <span className="illustration-number">
        {String(number).padStart(2, "0")}
      </span>
      <span className="illustration-label">CONCEPT / 概念図</span>
    </div>
  );
}
export function IllustrationDetail({ visual }) {
  if (!visual) return null;
  return (
    <section
      className="illustration-detail"
      aria-label="画像で確かめる作業と条件"
    >
      <figure>
        <img
          src={illustrationUrl(visual.image)}
          alt={technologyAssets[visual.image].alt}
          width="1536"
          height="1024"
        />
        <figcaption>
          AI生成の説明用イラスト。実際の製品仕様・設備構成・導入成果を示すものではありません。
          <a
            href={illustrationUrl(visual.image, true)}
            target="_blank"
            rel="noreferrer"
          >
            原寸画像を開く
            <ArrowUpRight size={14} />
          </a>
        </figcaption>
      </figure>
      <dl>
        <div>
          <dt>画像で見る場所</dt>
          <dd>{visual.look}</dd>
        </div>
        <div>
          <dt>対象になる仕事</dt>
          <dd>{visual.work}</dd>
        </div>
        <div>
          <dt>現場で確認する条件</dt>
          <dd>{visual.check}</dd>
        </div>
      </dl>
      <a className="illustration-next" href={visual.route}>
        {visual.action}
        <ArrowUpRight size={16} />
      </a>
    </section>
  );
}
