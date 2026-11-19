import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/** Fundo quase preto com leve vinheta e granulação estática. */
export const Background: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 80% 55% at 50% 42%, #151515 0%, #0a0a0a 55%, #040404 100%)",
      }}
    />
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "screen" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** Efeito sonoro posicionado em segundos absolutos. */
export const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.5 }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} durationInFrames={Math.round(2 * fps)} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
};

/**
 * Cena com entrada/saída suaves. `from`/`to` em segundos absolutos.
 * Os filhos recebem o frame local via useCurrentFrame().
 */
export const Scene: React.FC<{ from: number; to: number; fadeIn?: number; fadeOut?: number; children: React.ReactNode }> = ({
  from,
  to,
  fadeIn = 0.25,
  fadeOut = 0.25,
  children,
}) => {
  const { fps } = useVideoConfig();
  const start = Math.round(from * fps);
  const dur = Math.round((to - from) * fps);
  return (
    <Sequence from={start} durationInFrames={dur} name={`cena ${from}-${to}s`}>
      <SceneFade dur={dur} fadeIn={Math.round(fadeIn * fps)} fadeOut={Math.round(fadeOut * fps)}>
        {children}
      </SceneFade>
    </Sequence>
  );
};

const SceneFade: React.FC<{ dur: number; fadeIn: number; fadeOut: number; children: React.ReactNode }> = ({
  dur,
  fadeIn,
  fadeOut,
  children,
}) => {
  const f = useCurrentFrame();
  const o = Math.min(
    fadeIn > 0 ? interpolate(f, [0, fadeIn], [0, 1], { extrapolateRight: "clamp" }) : 1,
    fadeOut > 0 ? interpolate(f, [dur - fadeOut, dur], [1, 0], { extrapolateLeft: "clamp" }) : 1,
  );
  const y = fadeIn > 0 ? interpolate(f, [0, fadeIn], [24, 0], { extrapolateRight: "clamp" }) : 0;
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${y}px)`, fontFamily: FONT }}>{children}</AbsoluteFill>;
};

/** Converte segundos absolutos em frame relativo à cena. */
export const useLocal = (sceneFrom: number) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const now = frame / fps + sceneFrom; // segundos absolutos
  return { frame, fps, now };
};

/** 0→1 entre dois instantes (segundos absolutos), com easing suave. */
export const progress = (now: number, a: number, b: number) => {
  const x = interpolate(now, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return x * x * (3 - 2 * x);
};

/** Entrada com "pop" (leve overshoot) a partir de `at`. */
export const pop = (now: number, at: number, dur = 0.35) => {
  const x = interpolate(now, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = 1.70158 * 1.2;
  const eased = x === 0 ? 0 : 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
  return { opacity: Math.min(1, x * 2.5), scale: 0.6 + 0.4 * eased, x };
};
