import React from "react";
import { Img, staticFile } from "remotion";
import { CamKey, cameraAt } from "./Camera";

/** Janela da foto no quadro vertical (o resto é fundo desfocado da mesma foto). */
export const WIN = { top: 150, height: 1245, width: 1080 } as const;
const PLANE = 1080; // coordenadas da foto recortada

/**
 * Plano fotográfico com zoom/pan suave. `keys` usam coordenadas da foto (0..1080).
 * Filhos são desenhados por cima, nas mesmas coordenadas (acompanham o zoom).
 */
export const PhotoPlane: React.FC<{ src: string; now: number; keys: CamKey[]; children?: React.ReactNode; dim?: number }> = ({
  src,
  now,
  keys,
  children,
  dim = 0,
}) => {
  const c = cameraAt(keys, now);
  const k = WIN.height / PLANE; // a foto cobre a altura da janela
  const sc = k * c.s;
  const cx = WIN.width / 2;
  const cy = WIN.height / 2;
  const url = staticFile(src);
  return (
    <>
      {/* fundo: mesma foto desfocada */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Img src={url} style={{ position: "absolute", left: -420, top: -40, width: 1920, height: 2000, objectFit: "cover", filter: "blur(40px) brightness(0.35)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: WIN.top, width: WIN.width, height: WIN.height, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: PLANE,
            height: PLANE,
            transformOrigin: "0 0",
            transform: `translate(${cx - c.x * sc}px, ${cy - c.y * sc}px) scale(${sc})`,
          }}
        >
          <Img src={url} style={{ width: PLANE, height: PLANE, display: "block" }} />
          {children}
        </div>
        {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dim})` }} />}
        {/* bordas suaves da janela */}
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 120px rgba(0,0,0,0.55)", pointerEvents: "none" }} />
      </div>
    </>
  );
};

type Pt = [number, number];

/** Homografia (retângulo w×h → quadrilátero) como matrix3d do CSS. */
const homography = (w: number, h: number, dst: [Pt, Pt, Pt, Pt]) => {
  const src: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  // eliminação de Gauss
  const n = 8;
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    [A[col], A[piv]] = [A[piv], A[col]];
    [b[col], b[piv]] = [b[piv], b[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      for (let c2 = col; c2 < n; c2++) A[r][c2] -= f * A[col][c2];
      b[r] -= f * b[col];
    }
  }
  const p = b.map((v, i) => v / A[i][i]);
  const [a, b1, c, d, e, f, g, hh] = p;
  // matrix3d em ordem de colunas
  return `matrix3d(${a},${d},0,${g},${b1},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
};

/** Desenha uma tela (w×h px lógicos) encaixada em perspectiva nos 4 cantos da tela da foto. */
export const QuadScreen: React.FC<{ w: number; h: number; corners: [Pt, Pt, Pt, Pt]; radius?: number; children: React.ReactNode }> = ({
  w,
  h,
  corners,
  radius = 36,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: w,
      height: h,
      transformOrigin: "0 0",
      transform: homography(w, h, corners),
      borderRadius: radius,
      overflow: "hidden",
    }}
  >
    {children}
    {/* reflexo leve de vidro */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 35%)", pointerEvents: "none" }} />
  </div>
);
