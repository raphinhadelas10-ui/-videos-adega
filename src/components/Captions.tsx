import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, SAFE } from "../theme";
import type { Timings } from "../lib/timing";

type Token = { text: string; start: number; end: number };
type Chunk = { tokens: Token[]; start: number; end: number };

const clean = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
const trailingPunct = (s: string) => (s.match(/[.,;:!?…]+$/)?.[0] ?? "").replace("...", "…");

/** Aplica substituições de exibição (ex.: "sessenta reais" → "R$ 60") preservando os tempos. */
const applyReplace = (words: Token[], replace: Record<string, string>): Token[] => {
  const rules = Object.entries(replace).map(([k, v]) => ({ k: k.split(/\s+/).map(clean), v }));
  const out: Token[] = [];
  for (let i = 0; i < words.length; ) {
    const rule = rules.find((r) => r.k.every((kw, j) => words[i + j] && clean(words[i + j].text) === kw));
    if (rule) {
      const last = words[i + rule.k.length - 1];
      out.push({ text: rule.v + trailingPunct(last.text), start: words[i].start, end: last.end });
      i += rule.k.length;
    } else {
      out.push({ ...words[i], text: words[i].text.replace("...", "…") });
      i++;
    }
  }
  return out;
};

const MAX_CHARS = 20;
const MAX_WORDS = 4;

export const buildChunks = (t: Timings, replace: Record<string, string> = {}, maxChars = MAX_CHARS, maxWords = MAX_WORDS): Chunk[] => {
  const chunks: Chunk[] = [];
  t.lines.forEach((line, li) => {
    const toks = applyReplace(
      line.words.map((w) => ({ text: w.w, start: w.start, end: w.end })),
      replace,
    );
    let cur: Token[] = [];
    const flush = () => {
      if (cur.length) chunks.push({ tokens: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    };
    toks.forEach((tk) => {
      const len = cur.map((c) => c.text).join(" ").length + tk.text.length + 1;
      if (cur.length && (len > maxChars || cur.length >= maxWords)) flush();
      cur.push(tk);
      if (/[.,;:!?…]$/.test(tk.text)) flush();
    });
    flush();
    const nextLine = t.lines[li + 1];
    // fecha a última legenda da fala um pouco depois da voz
    const last = chunks[chunks.length - 1];
    last.end = Math.min(last.end + 0.45, nextLine ? nextLine.start - 0.05 : last.end + 0.45);
  });
  // cada legenda fica até a próxima começar (sem buracos curtos)
  for (let i = 0; i < chunks.length - 1; i++) {
    const gap = chunks[i + 1].start - chunks[i].end;
    if (gap > 0 && gap < 0.35) chunks[i].end = chunks[i + 1].start;
    else if (gap <= 0) chunks[i].end = chunks[i + 1].start;
  }
  return chunks;
};

export const Captions: React.FC<{
  timings: Timings;
  replace?: Record<string, string>;
  /** trechos exibidos em verde (resultado), ex.: ["R$ 1.800"] */
  green?: string[];
  /** agrupamento: até N caracteres / N palavras por legenda (2 linhas ≈ 34 caracteres) */
  maxChars?: number;
  maxWords?: number;
  /** fundo escuro atrás da legenda (quando passa por cima de telas) */
  backdrop?: boolean;
  y?: number;
  size?: number;
}> = ({
  timings,
  replace,
  green = [],
  backdrop = false,
  maxChars,
  maxWords,
  y = SAFE.captionsY,
  size = 66,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;
  const chunks = useMemo(() => buildChunks(timings, replace, maxChars, maxWords), [timings, replace, maxChars, maxWords]);
  const chunk = chunks.find((c) => now >= c.start - 0.06 && now < c.end);
  if (!chunk) return null;
  const inT = interpolate(now, [chunk.start - 0.06, chunk.start + 0.08], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: y,
        transform: `translateY(-50%) scale(${0.94 + 0.06 * inT})`,
        opacity: inT,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: -1,
        lineHeight: 1.15,
      }}
    >
      <span style={backdrop ? { display: "inline", background: "rgba(0,0,0,0.72)", padding: "6px 20px", borderRadius: 20, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" } : undefined}>
      {chunk.tokens.map((tk, i) => {
        const spoken = now >= tk.start - 0.03;
        const money = green.some((g) => tk.text.startsWith(g));
        return (
          <span
            key={i}
            style={{
              color: spoken ? (money ? C.green : C.text) : "rgba(255,255,255,0.38)",
              textShadow: "0 4px 18px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)",
            }}
          >
            {tk.text}
            {i < chunk.tokens.length - 1 ? " " : ""}
          </span>
        );
      })}
      </span>
    </div>
  );
};
