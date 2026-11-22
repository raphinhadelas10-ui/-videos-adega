import React from "react";

/** Quadro-chave de câmera: em `t` (s absolutos), o ponto (x, y) do conteúdo fica no centro, com zoom `s`. */
export type CamKey = { t: number; s: number; x: number; y: number };

const smooth = (x: number) => x * x * (3 - 2 * x);

export const cameraAt = (keys: CamKey[], now: number): CamKey => {
  if (now <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (now <= b.t) {
      const p = smooth((now - a.t) / Math.max(0.001, b.t - a.t));
      return { t: now, s: a.s + (b.s - a.s) * p, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
    }
  }
  return keys[keys.length - 1];
};

/**
 * Aproxima a "câmera" de um elemento. O conteúdo (ex.: um celular) é desenhado
 * em coordenadas locais (0..w, 0..h) e posicionado com o ponto focado em (cx, cy).
 */
export const Camera: React.FC<{
  keys: CamKey[];
  now: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  children: React.ReactNode;
}> = ({ keys, now, cx, cy, w, h, children }) => {
  const c = cameraAt(keys, now);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: h,
        transformOrigin: "0 0",
        transform: `translate(${cx - c.x * c.s}px, ${cy - c.y * c.s}px) scale(${c.s})`,
      }}
    >
      {children}
    </div>
  );
};
