import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { Background, Scene, Sfx, pop, progress, useLocal } from "../components/Base";
import { Calendar, spread } from "../components/Calendar";
import { Captions } from "../components/Captions";
import { CatalogPhone, Product, brl } from "../components/Catalog";
import { Counter, MiniPhone, Person, Shelf } from "../components/Figures";
import { Bubble, Card, Dot, Headline, SeriesTag } from "../components/Ui";
import { Cues, EpisodeProps, makeCues } from "../lib/timing";
import { C, SAFE, SAFE_CENTER_X } from "../theme";

// ——— Cena 1 (0–3s): mensagem chegando enquanto o dono atende no balcão ———
const Balcao: React.FC<{ from: number; ep: EpisodeProps["episode"] }> = ({ from, ep }) => {
  const { now } = useLocal(from);
  const ping = 0.9;
  const lit = progress(now, ping, ping + 0.15);
  const b = pop(now, ping + 0.05);
  const busy = Math.sin(now * 5.5);
  return (
    <AbsoluteFill>
      <SeriesTag series={ep.series} number={ep.number} opacity={progress(now, 0, 0.4)} />
      <Shelf x={170} y={500} width={700} rows={2} opacity={0.85} />
      <Person x={560 + 50 * Math.sin(now * 2.6)} y={1010} size={250} lean={busy * 4} bob={Math.abs(busy) * -6} />
      <Counter x={150} y={975} width={740} />
      <MiniPhone x={770} y={975 - 104} w={58} lit={lit} />
      <div style={{ position: "absolute", left: 640, top: 740, display: "flex" }}>
        <Bubble typing scale={b.scale} opacity={b.opacity} dotsPhase={now * 1.6} />
      </div>
      {/* cliente no balcão, de costas para a câmera */}
      <Person x={330} y={1200} size={230} dim />
    </AbsoluteFill>
  );
};

// ——— Cena 2 (3–10s): conversa sem resposta, cliente compra em outro lugar ———
const Conversa: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const m1 = pop(now, cue.start("msg1") - 0.1);
  const m2 = pop(now, cue.start("msg2") - 0.1);
  const noAnswer = cue.word("perdido", "Ninguém");
  const goAway = cue.word("perdido", "cliente");
  const lostAt = cue.word("perdido", "compra");
  const lost = progress(now, lostAt, lostAt + 0.3);
  const waitStart = cue.end("msg2");
  const minutes = Math.max(1, Math.round(interpolate(now, [waitStart, lostAt], [1, 23], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const busy = Math.sin(now * 5.5);
  const walk = progress(now, goAway, goAway + 1.1);
  const custX = 250 + walk * 520;
  const custOpacity = progress(now, from, from + 0.3) * (1 - progress(now, goAway + 1.05, goAway + 1.35));
  const door = progress(now, goAway - 0.4, goAway - 0.1);
  const label = pop(now, noAnswer - 0.05, 0.4);
  const borderCol = lost > 0 ? `rgba(255,77,77,${0.15 + 0.6 * lost})` : C.cardBorder;
  return (
    <AbsoluteFill>
      <Headline y={250} size={100} opacity={label.opacity} scale={label.scale}>
        Sem resposta
      </Headline>

      <Card style={{ left: SAFE.left + 10, top: 430, width: 610, height: 500, padding: 34, boxSizing: "border-box" }} border={borderCol}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 30 }}>
          <div style={{ width: 58, height: 58, borderRadius: 29, background: "linear-gradient(180deg,#fff,#bbb)", boxShadow: `0 0 20px ${C.glow}` }} />
          <div>
            <div style={{ color: C.text, fontSize: 32, fontWeight: 700 }}>Cliente</div>
            <div style={{ color: C.muted, fontSize: 24 }}>WhatsApp</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Bubble text="Tem gelada?" time="20:41" scale={m1.scale} opacity={m1.opacity} />
          <Bubble text="Quanto fica a entrega?" time="20:41" scale={m2.scale} opacity={m2.opacity} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 34,
            bottom: 30,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 30,
            fontWeight: 600,
            color: lost > 0.5 ? C.red : C.muted,
            opacity: progress(now, waitStart, waitStart + 0.3),
          }}
        >
          <Dot color={lost > 0.5 ? C.red : C.dim} size={18} />
          {lost > 0.5 ? "Pedido perdido" : `Aguardando há ${minutes} min`}
        </div>
      </Card>

      {/* dono ocupado no balcão */}
      <Person x={815} y={880} size={210} lean={busy * 5} bob={Math.abs(busy) * -5} />
      <Counter x={705} y={870} width={225} />
      <div style={{ position: "absolute", left: 700, top: 905, width: 235, textAlign: "center", color: C.muted, fontSize: 26, fontWeight: 600 }}>
        no balcão
      </div>

      {/* outra adega */}
      <div style={{ position: "absolute", left: 720, top: 990, width: 190, opacity: door }}>
        <div style={{ color: C.muted, fontSize: 24, fontWeight: 700, letterSpacing: 2, textAlign: "center", marginBottom: 10 }}>OUTRA ADEGA</div>
        <div
          style={{
            height: 170,
            borderRadius: "22px 22px 0 0",
            border: "3px solid rgba(255,255,255,0.18)",
            borderBottom: "none",
            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))",
          }}
        />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 1200, height: 3, background: "rgba(255,255,255,0.07)" }} />

      {/* cliente com o celular */}
      <Person x={custX} y={1200} size={190} opacity={custOpacity} tint={lost > 0.5 ? "red" : "white"} bob={walk > 0 && walk < 1 ? -Math.abs(Math.sin(now * 14)) * 8 : 0}>
        <MiniPhone x={-14} y={86} w={34} lit={1 - walk} rotate={-12} />
      </Person>
    </AbsoluteFill>
  );
};

// ——— Cena 3 (10–22s): calendário de 30 dias ———
const Calendario: React.FC<{ from: number; cue: Cues; fills: number[] }> = ({ from, cue, fills }) => {
  const { now } = useLocal(from);
  const filled = fills.filter((t) => now >= t).length;
  const revealAt = cue.word("conta3", "mil");
  const reveal = pop(now, revealAt - 0.05, 0.45);
  const isFinal = now >= revealAt - 0.05;
  const chip = pop(now, cue.word("conta1", "sessenta") - 0.05);
  const numberIn = progress(now, fills[0] - 0.1, fills[0] + 0.15);
  const breathe = isFinal ? 0.85 + 0.15 * Math.sin((now - revealAt) * 2.4) : 0;
  const value = isFinal ? 1800 : filled * 60;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 228,
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          display: "flex",
          justifyContent: "center",
          opacity: chip.opacity,
          transform: `scale(${chip.scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 30px",
            borderRadius: 999,
            border: `2px solid ${C.cardBorder}`,
            background: C.bgLift,
            color: C.text,
            fontSize: 38,
            fontWeight: 700,
          }}
        >
          1 pedido de {brl(60).replace(",00", "")} por dia
        </div>
      </div>

      <Calendar now={now} fillAt={fills} top={340} />

      <div
        style={{
          position: "absolute",
          top: 935,
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          textAlign: "center",
          opacity: numberIn,
        }}
      >
        <div
          style={{
            fontSize: isFinal ? 176 : 120,
            fontWeight: 800,
            letterSpacing: -6,
            lineHeight: 1,
            color: isFinal ? C.green : C.text,
            transform: `scale(${isFinal ? reveal.scale : 1})`,
            textShadow: isFinal ? `0 0 ${50 * breathe}px ${C.greenGlow}` : "0 0 30px rgba(255,255,255,0.15)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {brl(value).replace(",00", "")}
        </div>
        <div style={{ marginTop: 14, fontSize: 44, fontWeight: 500, color: C.muted, opacity: progress(now, revealAt + 0.2, revealAt + 0.5) }}>
          em vendas potenciais
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1205,
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          display: "flex",
          justifyContent: "center",
          opacity: progress(now, revealAt + 0.5, revealAt + 0.8),
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, color: C.muted, padding: "8px 22px", borderRadius: 999, border: `2px solid ${C.cardBorder}` }}>
          Exemplo de faturamento potencial
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ——— Cena 4 (22–32s): catálogo → pedido recebido → chamada ———
const PRODUCTS: Product[] = [
  { name: "Cerveja pilsen", detail: "Lata 350 ml", price: 4.5, kind: "can" },
  { name: "Fardo pilsen", detail: "12 latas 350 ml", price: 48.9, kind: "pack" },
  { name: "Gelo", detail: "Pacote 5 kg", price: 11.1, kind: "ice" },
  { name: "Refrigerante", detail: "Garrafa 2 L", price: 9.9, kind: "bottle" },
];

const Catalogo: React.FC<{ from: number; cue: Cues; ep: EpisodeProps["episode"] }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const openAt = cue.word("catalogo", "abre") + 0.05;
  const priceAt = cue.word("catalogo", "preço") - 0.05;
  const adds = [
    { index: 1, at: cue.wordEnd("catalogo", "preço") - 0.05 },
    { index: 2, at: cue.wordEnd("catalogo", "preço") + 0.3 },
  ];
  const sendAt = cue.word("catalogo", "pedido") + 0.1;
  const receivedAt = sendAt + 1.0; // dono recebe o pedido
  const ctaAt = cue.start("cta");
  const meChama = cue.word("cta", "Me");

  const phoneIn = progress(now, from, from + 0.35);
  const phoneOut = progress(now, receivedAt - 0.35, receivedAt + 0.05);
  const ownerIn = pop(now, receivedAt, 0.45);
  const settle = progress(now, ctaAt - 0.2, ctaAt + 0.35);
  const cta = pop(now, ctaAt - 0.05, 0.45);
  const btn = pop(now, meChama - 0.08, 0.4);
  const w = 540;
  const h = 960;

  return (
    <AbsoluteFill>
      {/* celular do cliente */}
      <div style={{ opacity: phoneIn * (1 - phoneOut), transform: `translateY(${(1 - phoneIn) * 60 + phoneOut * 80}px) scale(${1 - 0.06 * phoneOut})` }}>
        <CatalogPhone
          now={now}
          x={SAFE_CENTER_X - w / 2}
          y={250}
          w={w}
          h={h}
          store="Tua Adega"
          products={PRODUCTS}
          openAt={openAt}
          priceAt={priceAt}
          adds={adds}
          sendAt={sendAt}
        />
      </div>

      {/* chamada final */}
      <Headline y={280} size={92} opacity={cta.opacity} scale={cta.scale}>
        Quer ver como ficaria o site da tua adega?
      </Headline>
      <div
        style={{
          position: "absolute",
          top: 650,
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          display: "flex",
          justifyContent: "center",
          opacity: btn.opacity,
          transform: `scale(${btn.scale})`,
        }}
      >
        <div
          style={{
            padding: "26px 64px",
            borderRadius: 999,
            background: C.green,
            color: "#04160a",
            fontSize: 64,
            fontWeight: 800,
            boxShadow: `0 0 ${60 + 20 * Math.sin(now * 4)}px ${C.greenGlow}`,
          }}
        >
          Me chama
        </div>
      </div>

      {/* dono recebendo o pedido */}
      <div style={{ opacity: ownerIn.opacity, transform: `translateY(${(1 - settle) * -330}px) scale(${ownerIn.scale * (1 + 0.2 * (1 - settle))})`, transformOrigin: "50% 1000px" }}>
        <Person x={SAFE_CENTER_X} y={1075} size={200} tint="green" />
        <Card style={{ left: SAFE_CENTER_X - 300, top: 1060, width: 600, height: 150, display: "flex", alignItems: "center", gap: 22, padding: "0 36px", boxSizing: "border-box" }}>
          <Dot color={C.green} />
          <div>
            <div style={{ color: C.text, fontSize: 38, fontWeight: 800 }}>Pedido recebido</div>
            <div style={{ color: C.muted, fontSize: 28, marginTop: 2 }}>2 itens · {brl(60)}</div>
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

export const Ep01PedidoPerdido: React.FC<EpisodeProps> = ({ episode, timings }) => {
  const cue = makeCues(timings);
  const [s1, s2, s3, s4] = episode.scenes;

  // calendário: dia 1 acende em "dia", dias 2–30 no ritmo de "em trinta dias…"
  const fills = [cue.word("conta1", "dia"), ...spread(29, cue.word("conta2", "trinta"), cue.start("conta3") - 0.25)];
  const revealAt = cue.word("conta3", "mil");
  const catalogo = {
    open: cue.word("catalogo", "abre") + 0.05,
    add1: cue.wordEnd("catalogo", "preço") - 0.05,
    add2: cue.wordEnd("catalogo", "preço") + 0.3,
    send: cue.word("catalogo", "pedido") + 0.1,
  };

  return (
    <AbsoluteFill>
      <Background />
      <Scene from={s1.from} to={s1.to} fadeIn={0}>
        <Balcao from={s1.from} ep={episode} />
      </Scene>
      <Scene from={s2.from} to={s2.to}>
        <Conversa from={s2.from} cue={cue} />
      </Scene>
      <Scene from={s3.from} to={s3.to}>
        <Calendario from={s3.from} cue={cue} fills={fills} />
      </Scene>
      <Scene from={s4.from} to={s4.to} fadeOut={0}>
        <Catalogo from={s4.from} cue={cue} ep={episode} />
      </Scene>

      <Captions timings={timings} replace={episode.captionReplace} green={["R$ 1.800"]} />

      {/* áudio */}
      <Audio src={staticFile(`episodes/${episode.id}/voice.wav`)} />
      <Sfx name="message" at={0.9} volume={0.5} />
      <Sfx name="whoosh" at={s2.from - 0.15} volume={0.35} />
      <Sfx name="message" at={cue.start("msg1") - 0.1} volume={0.5} />
      <Sfx name="message" at={cue.start("msg2") - 0.1} volume={0.5} />
      <Sfx name="steps" at={cue.word("perdido", "cliente")} volume={0.35} />
      <Sfx name="lost" at={cue.word("perdido", "compra")} volume={0.55} />
      <Sfx name="whoosh" at={s3.from - 0.15} volume={0.35} />
      {fills.map((t, i) => (
        <Sfx key={i} name="tick" at={t} volume={i === 0 ? 0.35 : 0.16} />
      ))}
      <Sfx name="reveal" at={revealAt - 0.05} volume={0.45} />
      <Sfx name="whoosh" at={s4.from - 0.15} volume={0.35} />
      <Sfx name="tap" at={catalogo.open} volume={0.5} />
      <Sfx name="tap" at={catalogo.add1} volume={0.45} />
      <Sfx name="tap" at={catalogo.add2} volume={0.45} />
      <Sfx name="tap" at={catalogo.send} volume={0.5} />
      <Sfx name="success" at={catalogo.send + 1.0} volume={0.5} />
      <Sfx name="tap" at={cue.word("cta", "Me") - 0.08} volume={0.4} />
    </AbsoluteFill>
  );
};
