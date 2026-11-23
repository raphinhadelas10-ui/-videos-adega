import { createContext, useContext } from "react";

export type Word = { w: string; start: number; end: number };
export type Line = { id: string; text: string; start: number; end: number; words: Word[] };
export type Timings = { episode: string; source: string; duration: number; lines: Line[] };

export type EpisodeConfig = {
  id: string;
  number: number;
  series: string;
  title: string;
  output: string;
  durationSec: number;
  scenes?: { id: string; from: number; to: number }[];
  captionReplace?: Record<string, string>;
  lines: { id: string; at?: number; gap?: number; text: string }[];
};

export type EpisodeProps = { episode: EpisodeConfig; timings: Timings };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Acesso aos tempos da narração (em segundos). */
export const makeCues = (t: Timings) => {
  const line = (id: string) => {
    const l = t.lines.find((x) => x.id === id);
    if (!l) throw new Error(`Fala '${id}' não existe em timings.json`);
    return l;
  };
  const findWord = (id: string, word: string, nth = 0) => {
    const l = line(id);
    const hits = l.words.filter((w) => norm(w.w) === norm(word));
    const hit = hits[nth];
    if (!hit) throw new Error(`Palavra '${word}' não encontrada na fala '${id}'`);
    return hit;
  };
  const all = t.lines.flatMap((l) => l.words);
  /** procura uma palavra ou sequência ("tu fecha") no texto inteiro; nth = ocorrência */
  const find = (phrase: string, nth = 0) => {
    const ws = phrase.split(/\s+/).map(norm);
    let hit = -1;
    for (let i = 0, k = 0; i <= all.length - ws.length; i++) {
      if (ws.every((w, j) => norm(all[i + j].w) === w)) {
        if (k === nth) {
          hit = i;
          break;
        }
        k++;
      }
    }
    if (hit < 0) throw new Error(`'${phrase}' não encontrado na narração`);
    return { start: all[hit].start, end: all[hit + ws.length - 1].end };
  };
  return {
    /** início de uma palavra/sequência em qualquer fala */
    at: (phrase: string, nth = 0) => find(phrase, nth).start,
    /** fim de uma palavra/sequência em qualquer fala */
    atEnd: (phrase: string, nth = 0) => find(phrase, nth).end,
    line,
    /** início da fala */
    start: (id: string) => line(id).start,
    /** fim da fala */
    end: (id: string) => line(id).end,
    /** início de uma palavra da fala (pelo texto, n-ésima ocorrência) */
    word: (id: string, word: string, nth = 0) => findWord(id, word, nth).start,
    wordEnd: (id: string, word: string, nth = 0) => findWord(id, word, nth).end,
  };
};

export type Cues = ReturnType<typeof makeCues>;

export const TimingContext = createContext<Timings | null>(null);
export const useTimings = () => {
  const t = useContext(TimingContext);
  if (!t) throw new Error("TimingContext ausente");
  return t;
};
