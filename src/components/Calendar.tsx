import React from "react";
import { C, SAFE_CENTER_X } from "../theme";
import { progress } from "./Base";

/**
 * Calendário de N dias que se preenche. `fillAt[i]` = instante (s absolutos)
 * em que o dia i+1 acende.
 */
export const Calendar: React.FC<{
  now: number;
  fillAt: number[];
  top: number;
  cols?: number;
  cell?: number;
  gap?: number;
  label?: (day: number) => string;
  accent?: "white" | "green";
}> = ({ now, fillAt, top, cols = 6, cell = 104, gap = 18, label = (d) => String(d), accent = "white" }) => {
  const rows = Math.ceil(fillAt.length / cols);
  const width = cols * cell + (cols - 1) * gap;
  const left = SAFE_CENTER_X - width / 2;
  return (
    <div style={{ position: "absolute", left, top, width, height: rows * cell + (rows - 1) * gap }}>
      {fillAt.map((t, i) => {
        const p = progress(now, t, t + 0.18);
        const r = Math.floor(i / cols);
        const c = i % cols;
        const glow = accent === "green" ? C.greenGlow : "rgba(255,255,255,0.35)";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c * (cell + gap),
              top: r * (cell + gap),
              width: cell,
              height: cell,
              borderRadius: 20,
              background: C.cell,
              border: "2px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 18,
                background:
                  accent === "green"
                    ? `linear-gradient(180deg, #7ef0a4, ${C.green})`
                    : "linear-gradient(180deg, #ffffff, #d6d6d6)",
                opacity: p,
                transform: `scale(${0.7 + 0.3 * p})`,
                boxShadow: `0 0 30px ${glow}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 10,
                fontSize: 28,
                fontWeight: 700,
                color: p > 0.5 ? "#1a1a1a" : "#4a4a4a",
              }}
            >
              {label(i + 1)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Distribui `n` instantes entre a e b (inclusive). */
export const spread = (n: number, a: number, b: number) =>
  Array.from({ length: n }, (_, i) => (n === 1 ? a : a + ((b - a) * i) / (n - 1)));
