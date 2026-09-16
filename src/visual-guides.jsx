import React, { useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Expand, Image as ImageIcon, X } from "lucide-react";
import { visualGuides, guideAssets, guideKinds } from "./visual-guides-data";
import { activityRoles } from "./activity-data";
import { illustratedPageGuides } from "./card-illustrations-data";
import { illustrationUrl } from "./card-illustrations";
const galleryGuides = [...visualGuides, ...illustratedPageGuides];
const galleryKinds = { ...guideKinds, cards: "画像カードで比べる" };
export const visualGalleryCount = galleryGuides.length;

const imageUrl = id => `${import.meta.env.BASE_URL}images/guides/${id}.png`;
const route = g => `#/${g.site}/${g.page}`;
const caption = "AI生成の説明用イメージ。実在の人物・施設・導入実績を示すものではありません。";

function GuideImage({ guide, children }) {
  const dialog = useRef(null);
  const open = useRef(null);
  const alt = guideAssets[guide.image].alt;
  return <figure className="guide-figure">
    <div className="guide-image-wrap">
      <img src={imageUrl(guide.image)} alt={alt} width="1536" height="1024" decoding="async" />
      {children}
      <button ref={open} className="guide-expand" onClick={() => dialog.current.showModal()} aria-label="ガイド画像を拡大"><Expand size={16} /><span>拡大</span></button>
    </div>
    <figcaption>{caption}</figcaption>
    <dialog ref={dialog} className="guide-lightbox" aria-label={`${guide.title}の拡大画像`} onClose={() => open.current?.focus()} onClick={e => { if(e.target === e.currentTarget) dialog.current.close(); }}>
      <div className="guide-lightbox-inner"><div><strong>{guide.title}</strong><button onClick={() => dialog.current.close()} aria-label="拡大画像を閉じる"><X size={22} /></button></div><img src={imageUrl(guide.image)} alt={alt} width="1536" height="1024" loading="lazy" /><p>{caption}</p></div>
    </dialog>
  </figure>;
}

function PointPicker({ guide, active, setActive, numbered = false }) {
  return <div className="guide-point-picker" aria-label="画像を見る観点">{guide.points.map((p, i) => <button key={p.title} aria-pressed={active === i} onClick={() => setActive(i)}>{numbered && <span>{String(i + 1).padStart(2, "0")}</span>}{p.title}</button>)}</div>;
}

function Focus({ guide, active }) {
  const p = guide.points[active];
  return <div className="guide-focus" aria-live="polite" aria-atomic="true"><small>LOOK CLOSER / {String(active + 1).padStart(2, "0")}</small><h3>{p.title}</h3><p>{p.text}</p></div>;
}

function Comparison({ guide, active, setActive }) {
  return <><GuideImage guide={guide} /><div className="guide-before-after"><div><span>BEFORE / 現状の例</span><p>{guide.before}</p></div><div><span>AFTER / 改善案</span><p>{guide.after}</p></div></div><div className="guide-comparison-footer"><PointPicker guide={guide} active={active} setActive={setActive} /><Focus guide={guide} active={active} /></div></>;
}

function Hotspots({ guide, active, setActive }) {
  return <div className="guide-inspection"><GuideImage guide={guide}>{guide.points.map((p, i) => <button className="guide-hotspot" style={{left:`${p.x}%`,top:`${p.y}%`}} aria-label={`注目点${i + 1}：${p.title}`} aria-pressed={active === i} key={p.title} onClick={() => setActive(i)}>{i + 1}</button>)}</GuideImage><div className="guide-inspection-notes"><p className="guide-hint">画像の番号から、確認する場所を選択</p><PointPicker guide={guide} active={active} setActive={setActive} numbered /><Focus guide={guide} active={active} /></div></div>;
}

function Story({ guide, active, setActive }) {
  return <div className={`guide-editorial ${guide.kind === "fieldnote" ? "guide-notebook" : ""}`}><GuideImage guide={guide} /><div className="guide-editorial-copy"><span className="eyebrow">{guide.kicker || "FIELD NOTES / 現場の言葉"}</span>{guide.quote && <blockquote>{guide.quote}</blockquote>}<PointPicker guide={guide} active={active} setActive={setActive} numbered /><Focus guide={guide} active={active} /></div></div>;
}

function Steps({ guide, active, setActive }) {
  return <><GuideImage guide={guide}><div className="guide-stage-indicators" aria-hidden="true">{guide.points.map((p, i) => <span key={p.title} className={active === i ? "active" : ""}>{String(i + 1).padStart(2, "0")}</span>)}</div></GuideImage><div className="guide-step-cards">{guide.points.map((p, i) => <button key={p.title} aria-pressed={active === i} onClick={() => setActive(i)}><small>STEP {String(i + 1).padStart(2, "0")}</small><strong>{p.title}</strong><span>{p.text}</span></button>)}</div><p className="guide-stage-status" role="status">選択中：{guide.points[active].title}</p></>;
}

export function VisualGuide({ site, page }) {
  const guide = visualGuides.find(g => g.site === site.id && g.page === page.id);
  const [active, setActive] = useState(0);
  if (!guide) return null;
  const Renderer = guide.kind === "comparison" ? Comparison : guide.kind === "hotspots" ? Hotspots : guide.kind === "steps" ? Steps : Story;
  const skip = () => { const target = document.getElementById("page-workbench"); target?.scrollIntoView({behavior:"smooth",block:"start"}); target?.focus({preventScroll:true}); };
  return <section className={`visual-guide guide-${guide.kind}`} aria-label="画像で理解する業務ガイド">
    <div className="guide-heading"><div><span className="eyebrow"><ImageIcon size={14} /> VISUAL FIELD GUIDE / {guideKinds[guide.kind]}</span><h2>{guide.title}</h2><p>{guide.lead}</p></div><button className="guide-skip" onClick={skip}>操作エリアへ<ArrowDown size={15} /></button></div>
    <Renderer guide={guide} active={active} setActive={setActive} />
    <div className="guide-next"><span>場面を理解したら、実際の条件で考える。</span><a href={route(guide.next)}>{guide.next.label}<ArrowUpRight size={16} /></a></div>
  </section>;
}

function GuideCard({ guide, onChoose }) {
  return <a className="guide-card" href={route(guide)} onClick={onChoose}><div><img src={guide.kind === "cards" ? illustrationUrl(guide.image) : imageUrl(guide.image)} alt="" width="1536" height="1024" loading="lazy" decoding="async" /><span>{galleryKinds[guide.kind]}</span></div><small>{activityRoles[guide.site].name}</small><h3>{guide.title}</h3><p>{guide.lead}</p><span className="guide-card-action">画像で理解する<ArrowUpRight size={15} /></span></a>;
}

export function VisualGuideShelf({ site }) {
  const guides = galleryGuides.filter(g => g.site === site.id);
  return <section className="guide-shelf"><div className="section-title-row"><div><span className="eyebrow">SEE THE WORK / 現場から考える</span><h2>場面が見えると、次の一歩がわかる。</h2></div><span className="guide-count">{guides.length} VISUAL GUIDES</span></div><div className="guide-card-grid">{guides.map(g => <GuideCard key={g.page} guide={g} />)}</div></section>;
}

export function VisualGuideGallery({ onChoose }) {
  const [site, setSite] = useState("all");
  const [kind, setKind] = useState("all");
  const guides = galleryGuides.filter(g => (site === "all" || g.site === site) && (kind === "all" || g.kind === kind));
  return <div className="guide-gallery"><p>改善前後、作業の注目点、現場の言葉、実証から展開まで。画像カードも含めた{visualGalleryCount}ページを、目的に合わせて案内します。</p><div className="guide-gallery-filters"><label>活動で選ぶ<select value={site} onChange={e => setSite(e.target.value)}><option value="all">すべての活動</option>{Object.entries(activityRoles).map(([id,r]) => <option value={id} key={id}>{r.name}</option>)}</select></label><label>見せ方で選ぶ<select value={kind} onChange={e => setKind(e.target.value)}><option value="all">すべての見せ方</option>{Object.entries(galleryKinds).map(([id,name]) => <option value={id} key={id}>{name}</option>)}</select></label><span role="status">{guides.length}ページ</span></div><div className="guide-card-grid">{guides.map(g => <GuideCard key={`${g.site}/${g.page}`} guide={g} onChoose={onChoose} />)}</div>{!guides.length && <p className="guide-empty">この組み合わせのガイドはありません。活動か見せ方を変更してください。</p>}</div>;
}
