import React from "react";
import { Info, RotateCcw } from "lucide-react";
import { useSaved } from "./storage";
export { useSaved };
export const fmt = (n, d = 1) =>
  new Intl.NumberFormat("ja-JP", { maximumFractionDigits: d }).format(n);
export const Panel = ({ title, aside, children, className = "" }) => (
  <section className={"panel " + className}>
    <div className="section-header">
      <h2>{title}</h2>
      {aside}
    </div>
    {children}
  </section>
);
export const Note = ({ children, warning = false }) => (
  <div className={"notice " + (warning ? "warning" : "")} role={warning ? "status" : undefined}>
    <Info size={19} />
    <div>{children}</div>
  </div>
);
export const Metric = ({ value, label, tone = "" }) => (
  <div className={"advanced-metric " + tone}>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);
export function SavedNote({ storageKey, initial = "", label = "検討メモ", rows = 3 }) {
  const [note, setNote] = useSaved(storageKey, initial);
  return (
    <label className="field">
      {label}
      <textarea rows={rows} value={note} onChange={(e) => setNote(e.target.value)} />
    </label>
  );
}
export function NumberField({ label, value, onChange, min = 0, step = "any", suffix }) {
  return (
    <label className="field">
      {label}
      <span className="field-inline">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <small>{suffix}</small>}
      </span>
    </label>
  );
}
export function ResetLink({ onClick, children = "初期の条件に戻す" }) {
  return (
    <button className="text-link" onClick={onClick}>
      <RotateCcw size={15} />
      {children}
    </button>
  );
}
export const isNum = (v) => String(v).trim() !== "" && Number.isFinite(Number(v));
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
