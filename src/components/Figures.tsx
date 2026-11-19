import React from "react";
import { C } from "../theme";

type Tint = "white" | "red" | "green";
const glowOf = (t: Tint) => (t === "red" ? C.redGlow : t === "green" ? C.greenGlow : C.glow);

/**
 * Personagem minimalista: cabeça redonda + corpo em cápsula, com brilho suave.
 * (x, y) = ponto da base do corpo. `size` = altura total aproximada.
 */
export const Person: React.FC<{
  x: number;
  y: number;
  size?: number;
  opacity?: number;
  tint?: Tint;
  lean?: number; // graus
  bob?: number; // deslocamento vertical (px)
  dim?: boolean;
  children?: React.ReactNode; // acessórios (ex.: celular)
}> = ({ x, y, size = 220, opacity = 1, tint = "white", lean = 0, bob = 0, dim = false, children }) => {
  const head = size * 0.27;
  const bodyW = size * 0.34;
  const bodyH = size * 0.6;
  const gap = size * 0.08;
  const grad = dim
    ? "linear-gradient(180deg, #8c8c8c 0%, #5a5a5a 100%)"
    : "linear-gradient(180deg, #ffffff 0%, #e4e4e4 55%, #b9b9b9 100%)";
  return (
    <div
      style={{
        position: "absolute",
        left: x - bodyW / 2,
        top: y - bodyH - gap - head + bob,
        width: bodyW,
        height: bodyH + gap + head,
        opacity,
        transform: `rotate(${lean}deg)`,
        transformOrigin: "50% 100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (bodyW - head) / 2,
          top: 0,
          width: head,
          height: head,
          borderRadius: "50%",
          background: grad,
          boxShadow: `0 0 ${size * 0.18}px ${glowOf(tint)}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: head + gap,
          width: bodyW,
          height: bodyH,
          borderRadius: `${bodyW / 2}px ${bodyW / 2}px ${bodyW * 0.22}px ${bodyW * 0.22}px`,
          background: grad,
          boxShadow: `0 0 ${size * 0.22}px ${glowOf(tint)}`,
        }}
      />
      {children}
    </div>
  );
};

/** Balcão: linha luminosa com tampo. */
export const Counter: React.FC<{ x: number; y: number; width: number; opacity?: number }> = ({ x, y, width, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width, opacity }}>
    <div
      style={{
        height: 6,
        borderRadius: 3,
        background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.55), rgba(255,255,255,0.05))",
        boxShadow: "0 0 24px rgba(255,255,255,0.15)",
      }}
    />
    <div
      style={{
        height: 150,
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
        borderRadius: "0 0 18px 18px",
      }}
    />
  </div>
);

/** Prateleira com garrafas estilizadas (formas genéricas). */
export const Shelf: React.FC<{ x: number; y: number; width: number; rows?: number; opacity?: number }> = ({
  x,
  y,
  width,
  rows = 2,
  opacity = 1,
}) => {
  const per = Math.floor(width / 58);
  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ position: "relative", height: 130 }}>
          {Array.from({ length: per }).map((__, i) => {
            const tall = (i + r) % 3 !== 1;
            const h = tall ? 92 : 64;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: i * 58 + 12,
                  bottom: 10,
                  width: 30,
                  height: h,
                  borderRadius: tall ? "12px 12px 6px 6px" : "8px",
                  background: "linear-gradient(180deg, #2e2e2e, #1a1a1a)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {tall && (
                  <div
                    style={{
                      position: "absolute",
                      left: 9,
                      top: -18,
                      width: 12,
                      height: 22,
                      borderRadius: 4,
                      background: "#262626",
                    }}
                  />
                )}
              </div>
            );
          })}
          <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, height: 4, borderRadius: 2, background: "#222" }} />
        </div>
      ))}
    </div>
  );
};

/** Pequeno celular deitado/na mão, com tela que acende. */
export const MiniPhone: React.FC<{ x: number; y: number; w?: number; lit?: number; rotate?: number }> = ({
  x,
  y,
  w = 70,
  lit = 0,
  rotate = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: w * 1.8,
      borderRadius: w * 0.18,
      background: "#151515",
      border: "2px solid #3a3a3a",
      transform: `rotate(${rotate}deg)`,
      boxShadow: `0 0 ${40 * lit}px rgba(255,255,255,${0.35 * lit})`,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 5,
        borderRadius: w * 0.13,
        background: `rgba(235,235,235,${0.08 + 0.75 * lit})`,
      }}
    />
  </div>
);
