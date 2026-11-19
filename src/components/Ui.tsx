import React from "react";
import { C, SAFE, SAFE_CENTER_X } from "../theme";

export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; border?: string }> = ({
  style,
  children,
  border = C.cardBorder,
}) => (
  <div
    style={{
      position: "absolute",
      background: C.card,
      border: `2px solid ${border}`,
      borderRadius: 36,
      boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Balão de conversa (mensagem recebida). */
export const Bubble: React.FC<{
  text?: string;
  typing?: boolean;
  time?: string;
  scale?: number;
  opacity?: number;
  fontSize?: number;
  dotsPhase?: number;
}> = ({ text, typing, time, scale = 1, opacity = 1, fontSize = 44, dotsPhase = 0 }) => (
  <div
    style={{
      alignSelf: "flex-start",
      transform: `scale(${scale})`,
      transformOrigin: "0% 100%",
      opacity,
      background: C.bubble,
      borderRadius: "30px 30px 30px 8px",
      padding: typing ? "26px 34px" : "22px 30px 18px",
      color: C.text,
      fontSize,
      fontWeight: 500,
      lineHeight: 1.2,
      boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
    }}
  >
    {typing ? (
      <div style={{ display: "flex", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: "#bdbdbd",
              opacity: 0.4 + 0.6 * Math.max(0, Math.sin(dotsPhase * 2 * Math.PI - i * 0.9)),
            }}
          />
        ))}
      </div>
    ) : (
      <>
        <div>{text}</div>
        {time && <div style={{ fontSize: fontSize * 0.5, color: C.muted, marginTop: 6, textAlign: "right" }}>{time}</div>}
      </>
    )}
  </div>
);

/** Selo da série no topo. */
export const SeriesTag: React.FC<{ series: string; number: number; opacity?: number; y?: number }> = ({
  series,
  number,
  opacity = 1,
  y = SAFE.top + 30,
}) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: SAFE.left,
      width: SAFE.right - SAFE.left,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 18,
      opacity,
    }}
  >
    <div style={{ fontSize: 30, letterSpacing: 6, fontWeight: 600, color: C.muted, textTransform: "uppercase" }}>{series}</div>
    <div
      style={{
        fontSize: 30,
        fontWeight: 700,
        color: C.text,
        padding: "8px 22px",
        borderRadius: 999,
        border: `2px solid ${C.cardBorder}`,
      }}
    >
      EP. {number}
    </div>
  </div>
);

/** Título grande centralizado na zona segura. */
export const Headline: React.FC<{
  children: React.ReactNode;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
  scale?: number;
  weight?: number;
  glow?: string;
}> = ({ children, y, size = 96, color = C.text, opacity = 1, scale = 1, weight = 700, glow }) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: SAFE.left,
      width: SAFE.right - SAFE.left,
      textAlign: "center",
      fontSize: size,
      fontWeight: weight,
      letterSpacing: -size * 0.025,
      lineHeight: 1.08,
      color,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: `${SAFE_CENTER_X - SAFE.left}px 50%`,
      textShadow: glow ? `0 0 40px ${glow}` : undefined,
    }}
  >
    {children}
  </div>
);

/** Ponto de status (verde/vermelho) com brilho. */
export const Dot: React.FC<{ color: string; size?: number }> = ({ color, size = 26 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: color,
      boxShadow: `0 0 ${size}px ${color}`,
      flexShrink: 0,
    }}
  />
);

/** Indicador de toque na tela (dedo + onda). */
export const TapRing: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t < 0 || t > 1) return null;
  const r = 30 + 60 * t;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `4px solid rgba(255,255,255,${0.8 * (1 - t)})`,
        background: `rgba(255,255,255,${0.25 * (1 - t)})`,
        pointerEvents: "none",
      }}
    />
  );
};
