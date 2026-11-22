import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { Background, Scene, Sfx, pop, progress, useLocal } from "../components/Base";
import { Captions } from "../components/Captions";
import { Counter, MiniPhone, Person, Shelf } from "../components/Figures";
import { Clock } from "../components/Panels";
import { Bubble, Card, Dot, Headline, SeriesTag } from "../components/Ui";
import { Cues, EpisodeProps, makeCues } from "../lib/timing";
import { C, SAFE, SAFE_CENTER_X } from "../theme";

const MESSAGES = ["Tem gelada?", "Entrega aqui?", "Quanto fica?"];
const MSG_LINES = ["m1", "m2", "m3"];

const Chip: React.FC<{ text: string; y: number; now: number; at: number }> = ({ text, y, now, at }) => {
  const p = pop(now, at - 0.05);
  return (
    <div style={{ position: "absolute", top: y, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity: p.opacity, transform: `scale(${p.scale})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 28px", borderRadius: 999, background: C.bgLift, border: `2px solid ${C.cardBorder}`, color: C.text, fontSize: 36, fontWeight: 700 }}>
        <Dot color="#ffffff" size={20} />
        {text}
      </div>
    </div>
  );
};

/** Sol minimalista (círculo com brilho). */
const Sun: React.FC<{ x: number; y: number; size?: number; opacity?: number }> = ({ x, y, size = 150, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: "radial-gradient(circle, #ffffff 0%, #e9e9e9 60%, #bdbdbd 100%)",
      boxShadow: `0 0 ${size * 0.6}px rgba(255,255,255,0.35), 0 0 ${size * 1.4}px rgba(255,255,255,0.12)`,
      opacity,
    }}
  />
);

// ——— 1. Sábado de temporada: balcão cheio e o WhatsApp tocando ———
const Temporada: React.FC<{ from: number; cue: Cues; ep: EpisodeProps["episode"]; msgAt: number[] }> = ({ from, cue, ep, msgAt }) => {
  const { now } = useLocal(from);
  const crowd = progress(now, cue.word("zap", "gente") - 0.1, cue.word("zap", "gente") + 0.3);
  const ringAt = cue.word("zap", "uótsap");
  const ring = now >= ringAt && now < msgAt[2] + 0.6 ? Math.sin(now * 60) * 4 : 0;
  const busy = Math.sin(now * 6);
  const count = msgAt.filter((t) => now >= t).length;
  const badge = pop(now, msgAt[0], 0.3);
  const sun = progress(now, 0.2, 1.2);
  return (
    <AbsoluteFill>
      <SeriesTag series={ep.series} number={ep.number} opacity={progress(now, 0, 0.4)} />
      <Chip text="Sábado de temporada" y={392} now={now} at={cue.start("sabado")} />
      <Sun x={800} y={640 - 30 * sun} size={130} opacity={0.85 * sun} />

      {/* mensagens chegando uma atrás da outra */}
      <div style={{ position: "absolute", left: SAFE.left + 10, top: 500, display: "flex", flexDirection: "column", gap: 18 }}>
        {MESSAGES.map((m, i) => {
          const p = pop(now, msgAt[i]);
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 16, opacity: p.opacity, transform: `translateX(${(1 - p.x) * -30}px)` }}>
              <div style={{ width: 50, height: 50, borderRadius: 25, background: "linear-gradient(180deg,#fff,#b5b5b5)", boxShadow: `0 0 18px ${C.glow}`, flexShrink: 0 }} />
              <Bubble text={m} scale={p.scale} fontSize={48} />
            </div>
          );
        })}
      </div>

      {/* balcão cheio */}
      <Person x={640 + 40 * Math.sin(now * 3)} y={1060} size={220} lean={busy * 5} bob={Math.abs(busy) * -6} />
      <Counter x={170} y={1030} width={740} />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${ring}px)` }}>
        <MiniPhone x={810} y={1030 - 104} w={58} lit={progress(now, ringAt, ringAt + 0.15)} />
      </div>
      {count > 0 && (
        <div style={{ position: "absolute", left: 845, top: 900, width: 48, height: 48, borderRadius: 24, background: C.text, color: "#0b0b0b", fontSize: 30, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${badge.scale})`, boxShadow: `0 0 24px ${C.glow}` }}>
          {count}
        </div>
      )}
      <div style={{ opacity: crowd }}>
        <Person x={300} y={1225} size={220} dim />
        <Person x={470} y={1235} size={200} dim />
        <Person x={620} y={1245} size={180} dim opacity={0.8} />
      </div>
    </AbsoluteFill>
  );
};

// ——— 2. Estoque, relógio andando e o "valeu, pedi em outro lugar" ———
const Espera: React.FC<{ from: number; cue: Cues; aloneAt: number; valeuAt: number }> = ({ from, cue, aloneAt, valeuAt }) => {
  const { now } = useLocal(from);
  const clockA = cue.start("estoque") + 0.2;
  const clockB = aloneAt - 0.2;
  const minutes = interpolate(now, [clockA, clockB], [20 * 60 + 41, 21 * 60 + 18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const partA = 1 - progress(now, aloneAt - 0.25, aloneAt + 0.05);
  const waitMin = Math.round(minutes - (20 * 60 + 40));
  const toShelf = progress(now, cue.word("estoque", "confere"), cue.word("estoque", "estoque") + 0.2);
  const busy = Math.sin(now * 4);
  const others = cue.word("estoque", "outros");
  const typing = progress(now, aloneAt + 0.05, aloneAt + 0.3) * (1 - progress(now, valeuAt - 0.15, valeuAt));
  const v = pop(now, valeuAt - 0.1, 0.4);
  return (
    <AbsoluteFill>
      <div style={{ opacity: partA }}>
        <Clock x={SAFE_CENTER_X} y={230} size={230} minutes={minutes} />
        <div style={{ position: "absolute", left: SAFE.left, top: 600, color: C.muted, fontSize: 26, fontWeight: 700, letterSpacing: 3 }}>ESTOQUE</div>
        <Shelf x={SAFE.left} y={640} width={440} rows={2} opacity={0.85} />
        <Person x={420 - 160 * toShelf} y={1110} size={230} lean={-6 * toShelf + busy * 3} bob={Math.abs(busy) * -4} />
        <Person x={470} y={1190} size={190} dim />
        {MESSAGES.map((m, i) => {
          const fade = 1 - 0.55 * progress(now, others + i * 0.2, others + 0.8 + i * 0.2);
          return (
            <Card
              key={i}
              style={{ left: 610, top: 640 + i * 150, width: 320, height: 124, padding: "0 22px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 16, opacity: fade, borderRadius: 28 }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 24, background: "linear-gradient(180deg,#fff,#a9a9a9)", flexShrink: 0 }} />
              <div>
                <div style={{ color: C.text, fontSize: 28, fontWeight: 700 }}>{m}</div>
                <div style={{ color: C.muted, fontSize: 24, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>esperando {Math.max(1, waitMin - i)} min</div>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: SAFE.left + 40, top: 700, width: SAFE.right - SAFE.left - 80, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {now < valeuAt ? (
          <div style={{ opacity: typing }}>
            <Bubble typing dotsPhase={now * 1.6} />
          </div>
        ) : (
          <div style={{ filter: `drop-shadow(0 0 40px rgba(255,77,77,${0.25 * v.x}))` }}>
            <Bubble text="Valeu, pedi em outro lugar." time="21:18" scale={v.scale} opacity={v.opacity} fontSize={60} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ——— 3. Fechamento: "vendeu bem"… mas e o resto? ———
const Fechamento: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const card = pop(now, cue.word("caixa", "fecha") - 0.05, 0.45);
  const rows = [
    { label: "Pix", at: cue.word("caixa", "Pix") },
    { label: "Cartão", at: cue.word("caixa", "cartão") },
  ];
  const bem = cue.word("caixa", "hoje");
  const bars = [0.35, 0.55, 0.5, 0.8, 1];
  const qAt = cue.start("lucro") - 0.2;
  const partA = 1 - progress(now, qAt - 0.2, qAt + 0.1);
  const questions = [
    { label: "Lucro", at: cue.start("lucro") + 0.15 },
    { label: "O que mais saiu", at: cue.start("saiu") },
    { label: "O que ficou parado", at: cue.start("parado") },
    { label: "Unidades pra amanhã", at: cue.word("unidades", "unidades") },
  ];
  return (
    <AbsoluteFill>
      <Headline y={250} size={84} opacity={card.opacity * partA}>
        Fechou o caixa
      </Headline>
      <div style={{ opacity: partA }}>
        <Card style={{ left: SAFE.left + 40, top: 420, width: SAFE.right - SAFE.left - 80, height: 640, padding: 40, boxSizing: "border-box", opacity: card.opacity, transform: `scale(${card.scale})` }}>
          <div style={{ color: C.muted, fontSize: 28, fontWeight: 700, letterSpacing: 3 }}>SÁBADO · 23:58</div>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {rows.map((r, i) => {
              const p = pop(now, r.at - 0.05);
              return (
                <div key={i} style={{ height: 96, borderRadius: 24, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", opacity: p.opacity, transform: `scale(${p.scale})` }}>
                  <span style={{ color: C.text, fontSize: 42, fontWeight: 700 }}>{r.label}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {Array.from({ length: 5 + i }).map((_, k) => (
                      <div key={k} style={{ width: 22, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.25)" }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {/* "hoje vendeu bem" */}
          <div style={{ marginTop: 30, display: "flex", alignItems: "flex-end", justifyContent: "space-between", opacity: progress(now, bem - 0.1, bem + 0.2) }}>
            <span style={{ color: C.text, fontSize: 44, fontWeight: 800 }}>Vendeu bem</span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 150 }}>
              {bars.map((b, i) => (
                <div key={i} style={{ width: 34, borderRadius: 10, background: "linear-gradient(180deg,#fff,#bdbdbd)", boxShadow: `0 0 20px ${C.glow}`, height: 150 * b * progress(now, bem + i * 0.07, bem + 0.35 + i * 0.07) }} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* as perguntas que o caixa não responde */}
      <Headline y={250} size={84} opacity={progress(now, qAt, qAt + 0.3)}>
        Mas…
      </Headline>
      <div style={{ position: "absolute", left: SAFE.left + 30, top: 430, width: SAFE.right - SAFE.left - 60, display: "flex", flexDirection: "column", gap: 24 }}>
        {questions.map((q, i) => {
          const p = pop(now, q.at - 0.05);
          const pulse = now > q.at ? 0.75 + 0.25 * Math.sin((now - q.at) * 4) : 0;
          return (
            <div
              key={i}
              style={{
                height: 150,
                borderRadius: 32,
                background: C.card,
                border: `2px solid ${C.cardBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 40px",
                opacity: p.opacity,
                transform: `scale(${p.scale})`,
              }}
            >
              <span style={{ color: C.text, fontSize: 48, fontWeight: 700 }}>{q.label}</span>
              <span style={{ color: C.text, fontSize: 84, fontWeight: 800, textShadow: `0 0 ${30 * pulse}px rgba(255,255,255,0.45)` }}>?</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Prateleira com lugares vazios destacados (o que repor). */
const RestockShelf: React.FC<{ now: number; at: number; top: number }> = ({ now, at, top }) => {
  const cols = 8;
  const empty = new Set([2, 3, 6, 9, 13, 14]);
  const hi = progress(now, at, at + 0.4);
  const w = 74;
  const left = SAFE_CENTER_X - (cols * w) / 2;
  return (
    <div style={{ position: "absolute", left, top, width: cols * w }}>
      {[0, 1].map((r) => (
        <div key={r} style={{ position: "relative", height: 170 }}>
          {Array.from({ length: cols }).map((_, c) => {
            const i = r * cols + c;
            const isEmpty = empty.has(i);
            return (
              <div
                key={c}
                style={{
                  position: "absolute",
                  left: c * w + 14,
                  bottom: 14,
                  width: 44,
                  height: 118,
                  borderRadius: "16px 16px 8px 8px",
                  background: isEmpty ? "transparent" : "linear-gradient(180deg, #303030, #1b1b1b)",
                  border: isEmpty ? `3px dashed rgba(255,255,255,${0.15 + 0.7 * hi})` : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isEmpty ? `0 0 ${30 * hi}px rgba(255,255,255,0.25)` : undefined,
                }}
              />
            );
          })}
          <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, height: 5, borderRadius: 3, background: "#262626" }} />
        </div>
      ))}
    </div>
  );
};

// ——— 4. Amanhã a praia enche de novo ———
const Amanha: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const rise = progress(now, from, from + 1.4);
  const enche = cue.word("amanha", "praia") - 0.2;
  const reporAt = cue.start("repor") - 0.2;
  const partA = 1 - progress(now, reporAt - 0.2, reporAt + 0.1);
  const partB = progress(now, reporAt, reporAt + 0.3);
  const gelada = pop(now, cue.word("repor", "tem") - 0.05, 0.4);
  const people = [180, 300, 420, 540, 660, 780, 360, 600];
  return (
    <AbsoluteFill>
      <div style={{ opacity: partA }}>
        <Chip text="Domingo" y={240} now={now} at={from + 0.1} />
        {/* sol nascendo atrás do horizonte */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 860, overflow: "hidden" }}>
          <Sun x={SAFE_CENTER_X} y={860 - 260 * rise} size={260} />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 858, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }} />
        {people.map((x, i) => {
          const p = progress(now, enche + i * 0.12, enche + 0.3 + i * 0.12);
          return <Person key={i} x={x} y={i < 6 ? 1110 : 1220} size={i < 6 ? 150 : 170} opacity={p} bob={(1 - p) * 30} dim={i >= 6} />;
        })}
      </div>

      <div style={{ opacity: partB }}>
        <Headline y={250} size={84}>
          O que repor?
        </Headline>
        <RestockShelf now={now} at={cue.word("repor", "repor") - 0.05} top={420} />
        <div style={{ position: "absolute", left: SAFE.left + 30, top: 860, display: "flex", alignItems: "flex-end", gap: 16, opacity: gelada.opacity }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: "linear-gradient(180deg,#fff,#b5b5b5)", boxShadow: `0 0 18px ${C.glow}` }} />
          <Bubble text="Tem gelada?" time="09:02" scale={gelada.scale} fontSize={56} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ——— 5. Pergunta final (fica até o fim) ———
const Pergunta: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const head = pop(now, cue.start("pergunta") - 0.05, 0.45);
  const opts = [
    { label: "Dar conta dos pedidos", at: cue.word("opcoes", "dar") - 0.05, icon: "msgs" },
    { label: "Fechar o caixa", at: cue.word("opcoes", "fechar") - 0.05, icon: "caixa" },
  ];
  const ou = progress(now, cue.word("opcoes", "ou") - 0.05, cue.word("opcoes", "ou") + 0.2);
  return (
    <AbsoluteFill>
      <Headline y={260} size={92} opacity={head.opacity} scale={head.scale}>
        Qual parte mais te pega na temporada?
      </Headline>
      {opts.map((o, i) => {
        const p = pop(now, o.at, 0.45);
        return (
          <Card
            key={i}
            style={{
              left: SAFE.left + 30,
              top: 660 + i * 260,
              width: SAFE.right - SAFE.left - 60,
              height: 190,
              display: "flex",
              alignItems: "center",
              gap: 34,
              padding: "0 44px",
              boxSizing: "border-box",
              opacity: p.opacity,
              transform: `scale(${p.scale})`,
              boxShadow: `0 0 50px rgba(255,255,255,${0.08 * p.x})`,
            }}
          >
            <div style={{ width: 100, height: 100, borderRadius: 30, background: "#2a2a2c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {o.icon === "msgs" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[46, 60, 36].map((w, k) => (
                    <div key={k} style={{ width: w, height: 14, borderRadius: 7, background: "#e6e6e6", opacity: 1 - k * 0.2 }} />
                  ))}
                </div>
              ) : (
                <div style={{ color: C.text, fontSize: 60, fontWeight: 800 }}>?</div>
              )}
            </div>
            <span style={{ color: C.text, fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>{o.label}</span>
          </Card>
        );
      })}
      <div style={{ position: "absolute", top: 870, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", color: C.muted, fontSize: 40, fontWeight: 700, opacity: ou }}>
        ou
      </div>
    </AbsoluteFill>
  );
};

export const Ep02AdegaTemporada: React.FC<EpisodeProps> = ({ episode, timings }) => {
  const cue = makeCues(timings);
  const end = episode.durationSec;

  // cenas derivadas da narração
  const s2 = cue.start("estoque") - 0.15;
  const s3 = cue.start("caixa") - 0.25;
  const s4 = cue.start("amanha") - 0.3;
  const s5 = cue.start("pergunta") - 0.3;

  const msgAt = MSG_LINES.map((id) => cue.start(id) - 0.08);
  const aloneAt = cue.word("volta", "já") - 0.1;
  const valeuAt = cue.word("volta", "valeu") - 0.05;

  return (
    <AbsoluteFill>
      <Background />
      <Scene from={0} to={s2} fadeIn={0}>
        <Temporada from={0} cue={cue} ep={episode} msgAt={msgAt} />
      </Scene>
      <Scene from={s2} to={s3}>
        <Espera from={s2} cue={cue} aloneAt={aloneAt} valeuAt={valeuAt} />
      </Scene>
      <Scene from={s3} to={s4}>
        <Fechamento from={s3} cue={cue} />
      </Scene>
      <Scene from={s4} to={s5}>
        <Amanha from={s4} cue={cue} />
      </Scene>
      <Scene from={s5} to={end} fadeOut={0}>
        <Pergunta from={s5} cue={cue} />
      </Scene>

      <Captions timings={timings} replace={episode.captionReplace} />

      <Audio src={staticFile(`episodes/${episode.id}/voice.wav`)} />
      <Sfx name="message" at={cue.word("zap", "uótsap")} volume={0.35} />
      {msgAt.map((m, i) => (
        <Sfx key={i} name="message" at={m} volume={0.5} />
      ))}
      {[s2, s3, s4, s5].map((s, i) => (
        <Sfx key={`w${i}`} name="whoosh" at={s - 0.15} volume={0.3} />
      ))}
      {Array.from({ length: Math.floor((aloneAt - s2 - 0.6) / 0.3) }).map((_, i) => (
        <Sfx key={`c${i}`} name="tick" at={s2 + 0.4 + i * 0.3} volume={0.12} />
      ))}
      <Sfx name="message" at={valeuAt - 0.1} volume={0.5} />
      <Sfx name="lost" at={valeuAt + 0.05} volume={0.3} />
      <Sfx name="tick" at={cue.word("caixa", "Pix") - 0.05} volume={0.3} />
      <Sfx name="tick" at={cue.word("caixa", "cartão") - 0.05} volume={0.3} />
      {(["lucro", "saiu", "parado", "unidades"] as const).map((id) => (
        <Sfx key={id} name="tap" at={cue.start(id)} volume={0.35} />
      ))}
      <Sfx name="message" at={cue.word("repor", "tem") - 0.05} volume={0.5} />
      <Sfx name="tap" at={cue.word("opcoes", "dar") - 0.05} volume={0.4} />
      <Sfx name="tap" at={cue.word("opcoes", "fechar") - 0.05} volume={0.4} />
    </AbsoluteFill>
  );
};
