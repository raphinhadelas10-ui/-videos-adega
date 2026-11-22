import React from "react";
import { C } from "../theme";
import { progress } from "./Base";
import { brl } from "./Catalog";
import { Dot } from "./Ui";

/** Ícones simples de produto/categoria (formas genéricas, sem marcas). */
export const CategoryIcon: React.FC<{ kind: "cerveja" | "seda" | "gelo" | "combo"; size?: number }> = ({ kind, size = 120 }) => {
  const g = "linear-gradient(180deg,#f2f2f2,#a8a8a8)";
  const u = size / 120;
  const box = (l: number, t: number, w: number, h: number, r: number, extra: React.CSSProperties = {}) => (
    <div style={{ position: "absolute", left: l * u, top: t * u, width: w * u, height: h * u, borderRadius: r * u, background: g, ...extra }} />
  );
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {kind === "cerveja" && [0, 1, 2].map((i) => <React.Fragment key={i}>{box(20 + i * 28, 30, 22, 60, 6)}</React.Fragment>)}
      {kind === "seda" && (
        <>
          {box(24, 40, 72, 44, 8, { transform: "rotate(-8deg)", opacity: 0.6 })}
          {box(24, 36, 72, 44, 8)}
          {box(24, 36, 72, 10, 3, { background: "#7a7a7a" })}
        </>
      )}
      {kind === "gelo" &&
        [0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>{box(28 + (i % 2) * 34, 28 + Math.floor(i / 2) * 34, 28, 28, 7, { opacity: 0.9 })}</React.Fragment>
        ))}
      {kind === "combo" && (
        <>
          {[0, 1].map((i) => (
            <React.Fragment key={i}>{box(18 + i * 26, 34, 20, 54, 6)}</React.Fragment>
          ))}
          {box(72, 52, 30, 30, 7, { opacity: 0.9 })}
          {box(60, 20, 34, 18, 9, { background: C.green, boxShadow: `0 0 12px ${C.greenGlow}` })}
        </>
      )}
    </div>
  );
};

export const Field: React.FC<{ label: string; value: string; caret?: boolean; active?: number; y: number; w: number }> = ({
  label,
  value,
  caret,
  active = 0,
  y,
  w,
}) => (
  <div style={{ position: "absolute", left: 30, top: y, width: w - 60 }}>
    <div style={{ color: C.muted, fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{label}</div>
    <div
      style={{
        height: 78,
        borderRadius: 20,
        background: "#1b1b1d",
        border: `2px solid rgba(255,255,255,${0.12 + 0.6 * active})`,
        boxShadow: active ? `0 0 ${24 * active}px rgba(255,255,255,0.15)` : undefined,
        display: "flex",
        alignItems: "center",
        padding: "0 22px",
        color: C.text,
        fontSize: 30,
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {value}
      {caret && <span style={{ width: 3, height: 34, background: C.text, marginLeft: 3 }} />}
    </div>
  </div>
);

export const Btn: React.FC<{ label: React.ReactNode; y: number; w: number; press?: number; green?: boolean; h?: number }> = ({
  label,
  y,
  w,
  press = 0,
  green,
  h = 96,
}) => (
  <div
    style={{
      position: "absolute",
      left: 30,
      top: y,
      width: w - 60,
      height: h,
      borderRadius: h / 2,
      background: green ? C.green : C.text,
      color: "#0b0b0b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      fontSize: 34,
      fontWeight: 800,
      transform: `scale(${1 - 0.05 * press})`,
      boxShadow: green ? `0 0 40px ${C.greenGlow}` : "0 0 30px rgba(255,255,255,0.18)",
    }}
  >
    {label}
  </div>
);

export const Row: React.FC<{ a: React.ReactNode; b: React.ReactNode; bold?: boolean; size?: number; color?: string }> = ({
  a,
  b,
  bold,
  size = 28,
  color = C.text,
}) => (
  <div style={{ display: "flex", justifyContent: "space-between", color, fontSize: size, fontWeight: bold ? 800 : 500, lineHeight: 1.5 }}>
    <span>{a}</span>
    <span>{b}</span>
  </div>
);

/** Passos de status do pedido (lado do cliente). */
export const StatusSteps: React.FC<{ steps: { label: string; done: boolean; at?: number }[]; now: number }> = ({ steps, now }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
    {steps.map((s, i) => {
      const p = s.at !== undefined ? progress(now, s.at, s.at + 0.3) : s.done ? 1 : 0;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              border: `3px solid ${p > 0.5 ? C.green : "rgba(255,255,255,0.25)"}`,
              background: `rgba(61,220,114,${p})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: p > 0.5 ? `0 0 18px ${C.greenGlow}` : undefined,
            }}
          >
            {p > 0.5 && (
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M5 12.5l4.2 4.2L19 7" stroke="#062611" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ color: p > 0.5 ? C.text : C.muted, fontSize: 30, fontWeight: p > 0.5 ? 700 : 500 }}>{s.label}</span>
        </div>
      );
    })}
  </div>
);

/** Indicador do painel com valor contando. */
export const Stat: React.FC<{ label: string; from: number; to: number; now: number; at: number; money?: boolean; w: number }> = ({
  label,
  from,
  to,
  now,
  at,
  money,
  w,
}) => {
  const p = progress(now, at, at + 1.0);
  const v = from + (to - from) * p;
  const lit = p > 0 && p < 1 ? 1 : p >= 1 ? 0.6 : 0;
  return (
    <div
      style={{
        width: w,
        height: 128,
        borderRadius: 24,
        background: "#1b1b1d",
        border: `2px solid rgba(61,220,114,${0.08 + 0.5 * lit})`,
        boxShadow: lit ? `0 0 ${30 * lit}px rgba(61,220,114,0.18)` : undefined,
        padding: "16px 12px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ color: C.muted, fontSize: 19, fontWeight: 600, lineHeight: 1.15, height: 44 }}>{label}</div>
      <div style={{ color: p > 0 ? C.green : C.text, fontSize: 24, fontWeight: 800, marginTop: 6, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        {money ? brl(v) : Math.round(v)}
      </div>
    </div>
  );
};

export { Dot };
