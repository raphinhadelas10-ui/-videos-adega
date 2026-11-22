import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { Background, Scene, Sfx, pop, progress, useLocal } from "../components/Base";
import { Captions } from "../components/Captions";
import { CatalogPhone, Product } from "../components/Catalog";
import { Counter, MiniPhone, Person, Shelf } from "../components/Figures";
import { ChatList, ChatRow, Clock, OrderPanel, PhoneFrame } from "../components/Panels";
import { Bubble, Card, Dot, Headline, SeriesTag } from "../components/Ui";
import { Cues, EpisodeProps, makeCues } from "../lib/timing";
import { C, SAFE, SAFE_CENTER_X } from "../theme";

// Dados fictícios usados nas demonstrações
const STORE = "Adega do Mar";
const LOGO = "AM";
const PRODUCTS: Product[] = [
  { name: "Cerveja pilsen", detail: "Lata 350 ml", price: 4.5, kind: "can" },
  { name: "Fardo pilsen", detail: "12 latas 350 ml", price: 48.9, kind: "pack" },
  { name: "Gelo", detail: "Pacote 5 kg", price: 11.1, kind: "ice" },
  { name: "Refrigerante", detail: "Garrafa 2 L", price: 9.9, kind: "bottle" },
];
const MESSAGES = ["Tem gelada?", "Entrega aqui?", "Quanto fica?"];
const CHATS: ChatRow[] = [
  { name: "Cliente 14", text: "manda 2 fardos e gelo", time: "23:48" },
  { name: "Cliente 13", text: "já fiz o pix", time: "23:31" },
  { name: "Cliente 12", text: "entrega na rua 7?", time: "23:10" },
  { name: "Cliente 11", text: "comprovante.jpg", time: "22:57" },
  { name: "Cliente 10", text: "quanto tá o litrão?", time: "22:40" },
  { name: "Cliente 9", text: "pode ser no cartão?", time: "22:22" },
  { name: "Cliente 8", text: "valeu, chegou!", time: "22:05" },
  { name: "Cliente 7", text: "tem carvão?", time: "21:48" },
  { name: "Cliente 6", text: "1 gelo e 6 latas", time: "21:30" },
  { name: "Cliente 5", text: "paguei na entrega", time: "21:12" },
  { name: "Cliente 4", text: "tá aberto ainda?", time: "20:59" },
  { name: "Cliente 3", text: "Quanto fica?", time: "20:41" },
  { name: "Cliente 2", text: "Entrega aqui?", time: "20:40" },
  { name: "Cliente 1", text: "Tem gelada?", time: "20:40" },
  { name: "Cliente 0", text: "obrigado!", time: "20:22" },
];

/** Etiqueta pequena acima de uma tela (de quem é a tela). */
const Tag: React.FC<{ text: string; y: number; opacity?: number }> = ({ text, y, opacity = 1 }) => (
  <div style={{ position: "absolute", top: y, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity }}>
    <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, color: C.muted, textTransform: "uppercase", padding: "8px 24px", borderRadius: 999, border: `2px solid ${C.cardBorder}` }}>
      {text}
    </div>
  </div>
);

// ——— 1. Sábado de temporada: balcão cheio e três mensagens ———
const Temporada: React.FC<{ from: number; cue: Cues; ep: EpisodeProps["episode"]; msgAt: number[] }> = ({ from, cue, ep, msgAt }) => {
  const { now } = useLocal(from);
  const chip = pop(now, cue.word("sabado", "sábado") - 0.05);
  const crowd = progress(now, cue.word("sabado", "gente") - 0.1, cue.word("sabado", "gente") + 0.3);
  const busy = Math.sin(now * 6);
  const count = msgAt.filter((t) => now >= t).length;
  const badge = pop(now, msgAt[0], 0.3);
  return (
    <AbsoluteFill>
      <SeriesTag series={ep.series} number={ep.number} opacity={progress(now, 0, 0.4)} />
      <div style={{ position: "absolute", top: 392, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity: chip.opacity, transform: `scale(${chip.scale})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 28px", borderRadius: 999, background: C.bgLift, border: `2px solid ${C.cardBorder}`, color: C.text, fontSize: 36, fontWeight: 700 }}>
          <Dot color="#ffffff" size={20} />
          Sábado de temporada
        </div>
      </div>

      {/* mensagens chegando uma atrás da outra */}
      <div style={{ position: "absolute", left: SAFE.left + 10, top: 500, display: "flex", flexDirection: "column", gap: 18 }}>
        {MESSAGES.map((m, i) => {
          const p = pop(now, msgAt[i]);
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 16, opacity: p.opacity, transform: `translateX(${(1 - p.x) * -30}px)` }}>
              <div style={{ width: 50, height: 50, borderRadius: 25, background: "linear-gradient(180deg,#fff,#b5b5b5)", boxShadow: `0 0 18px ${C.glow}`, flexShrink: 0 }} />
              <Bubble text={m} scale={p.scale} fontSize={46} />
            </div>
          );
        })}
      </div>

      {/* balcão cheio */}
      <Shelf x={560} y={560} width={360} rows={2} opacity={0.7} />
      <Person x={700 + 40 * Math.sin(now * 3)} y={1060} size={220} lean={busy * 5} bob={Math.abs(busy) * -6} />
      <Counter x={170} y={1030} width={740} />
      <MiniPhone x={810} y={1030 - 104} w={58} lit={progress(now, msgAt[0], msgAt[0] + 0.15)} />
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

// ——— 2. Estoque, relógio andando e a mensagem que fica sozinha ———
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

        {/* dono conferindo o estoque para um cliente */}
        <div style={{ position: "absolute", left: SAFE.left, top: 600, color: C.muted, fontSize: 26, fontWeight: 700, letterSpacing: 3 }}>ESTOQUE</div>
        <Shelf x={SAFE.left} y={640} width={440} rows={2} opacity={0.85} />
        <Person x={420 - 160 * toShelf} y={1110} size={230} lean={-6 * toShelf + busy * 3} bob={Math.abs(busy) * -4} />
        <Person x={470} y={1190} size={190} dim />

        {/* os outros esperando */}
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

      {/* a resposta que chega sozinha */}
      <div style={{ position: "absolute", left: SAFE.left + 40, top: 700, width: SAFE.right - SAFE.left - 80, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {now < valeuAt ? (
          <div style={{ opacity: typing }}>
            <Bubble typing dotsPhase={now * 1.6} />
          </div>
        ) : (
          <div style={{ filter: `drop-shadow(0 0 40px rgba(255,77,77,${0.25 * v.x}))` }}>
            <Bubble text="Valeu, já pedi em outro lugar." time="21:18" scale={v.scale} opacity={v.opacity} fontSize={60} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ——— 3. Fechamento da noite ———
const Fechamento: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const card = pop(now, cue.word("caixa", "fecha") - 0.05, 0.45);
  const rows = [
    { label: "Pix", at: cue.word("caixa", "Pix") },
    { label: "Cartão", at: cue.word("caixa", "cartão") },
    { label: "Entrega", at: cue.word("caixa", "entrega") },
  ];
  const lots = cue.word("caixa", "bastante");
  const totalIn = progress(now, cue.word("caixa", "Tu") - 0.05, cue.word("caixa", "Tu") + 0.3);
  const q = pop(now, lots + 0.1, 0.45);
  const chatAt = cue.start("conferir") - 0.25;
  const partA = 1 - progress(now, chatAt - 0.2, chatAt + 0.1);
  const phoneIn = progress(now, chatAt, chatAt + 0.35);
  const scroll = interpolate(now, [cue.word("conferir", "voltar"), cue.word("conferir", "vendeu") + 0.3], [0, 14 * 118 - 700], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => x * x * (3 - 2 * x),
  });
  const pw = 540;
  return (
    <AbsoluteFill>
      <div style={{ opacity: partA }}>
        <Headline y={250} size={84} opacity={card.opacity}>
          Fechou o caixa
        </Headline>
        <Card style={{ left: SAFE.left + 40, top: 420, width: SAFE.right - SAFE.left - 80, height: 640, padding: 40, boxSizing: "border-box", opacity: card.opacity, transform: `scale(${card.scale})` }}>
          <div style={{ color: C.muted, fontSize: 28, fontWeight: 700, letterSpacing: 3 }}>SÁBADO · 23:58</div>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {rows.map((r, i) => {
              const p = pop(now, r.at - 0.05);
              return (
                <div key={i} style={{ height: 96, borderRadius: 24, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", opacity: p.opacity, transform: `scale(${p.scale})` }}>
                  <span style={{ color: C.text, fontSize: 42, fontWeight: 700 }}>{r.label}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {Array.from({ length: 4 + i }).map((_, k) => (
                      <div key={k} style={{ width: 22, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.25)" }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 30, borderTop: `2px solid ${C.cardBorder}`, paddingTop: 26, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: totalIn }}>
            <span style={{ color: C.muted, fontSize: 40, fontWeight: 600 }}>Total do dia</span>
            <span style={{ color: C.text, fontSize: 96, fontWeight: 800, opacity: q.opacity, transform: `scale(${q.scale})`, display: "inline-block", textShadow: "0 0 30px rgba(255,255,255,0.3)" }}>?</span>
          </div>
        </Card>
      </div>

      {/* depois: voltar nas conversas para conferir */}
      <div style={{ opacity: phoneIn, transform: `translateY(${(1 - phoneIn) * 50}px)` }}>
        <PhoneFrame x={SAFE_CENTER_X - pw / 2} y={250} w={pw} h={950}>
          <ChatList rows={CHATS} scroll={scroll} w={pw} highlight={[0, 1, 3, 5, 8, 9]} hi={progress(now, cue.word("conferir", "conferir"), cue.word("conferir", "conferir") + 0.3)} />
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

// ——— 4. A solução: site da adega → pedido na tela do dono ———
const Solucao: React.FC<{ from: number; cue: Cues; t: Record<string, number> }> = ({ from, cue, t }) => {
  const { now } = useLocal(from);
  const pw = 540;
  const ph = 930;
  const swap = progress(now, t.panel - 0.35, t.panel);
  const clientIn = progress(now, from, from + 0.35);
  return (
    <AbsoluteFill>
      <Tag text="Celular do cliente" y={215} opacity={clientIn * (1 - swap)} />
      <Tag text="Tua tela" y={215} opacity={swap} />
      <div style={{ opacity: clientIn * (1 - swap), transform: `translateX(${-swap * 120}px)` }}>
        <CatalogPhone
          now={now}
          x={SAFE_CENTER_X - pw / 2}
          y={285}
          w={pw}
          h={ph}
          store={STORE}
          logo={LOGO}
          brandAt={cue.word("monto", "monto")}
          products={PRODUCTS}
          openAt={t.open}
          priceAt={cue.word("cliente", "vê") - 0.05}
          adds={[
            { index: 1, at: t.add1 },
            { index: 2, at: t.add2 },
          ]}
          sendAt={t.send}
        />
      </div>
      <div style={{ opacity: swap, transform: `translateX(${(1 - swap) * 120}px)` }}>
        <PhoneFrame x={SAFE_CENTER_X - pw / 2} y={285} w={pw} h={ph}>
          <OrderPanel
            now={now}
            w={pw}
            h={ph}
            store={STORE}
            orderNo="#042"
            customer="Cliente · via link"
            address="Rua das Gaivotas, 120"
            items={[
              { qty: 1, name: "Fardo pilsen", price: 48.9 },
              { qty: 1, name: "Gelo 5 kg", price: 11.1 },
            ]}
            arriveAt={t.arrive}
            confirmAt={t.confirm}
            deliveryAt={t.delivery}
            older={[
              { no: "Pedido #041", label: "3 itens", status: "Entregue" },
              { no: "Pedido #040", label: "1 item", status: "Entregue" },
            ]}
          />
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

// ——— 5. Chamada final ———
const Chamada: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const head = pop(now, cue.start("logo") - 0.05, 0.45);
  const nome = progress(now, cue.word("logo", "nome") - 0.05, cue.word("logo", "nome") + 0.25);
  const logo = progress(now, cue.word("logo", "logo") - 0.05, cue.word("logo", "logo") + 0.25);
  const ctaAt = cue.word("direct", "manda") - 0.1;
  const cta = pop(now, ctaAt, 0.5);
  const glow = 50 + 20 * Math.sin((now - ctaAt) * 3.5);
  const shrink = progress(now, ctaAt - 0.1, ctaAt + 0.4);
  return (
    <AbsoluteFill>
      <Headline y={240} size={80} opacity={head.opacity * (1 - 0.35 * shrink)} scale={head.scale}>
        Quer ver como ficaria com o nome e a logo da tua adega?
      </Headline>

      {/* prévia da marca */}
      <Card style={{ left: SAFE_CENTER_X - 330, top: 640, width: 660, height: 200, display: "flex", alignItems: "center", gap: 30, padding: "0 36px", boxSizing: "border-box", opacity: Math.max(nome, logo) * (1 - 0.5 * shrink) }}>
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 64,
            border: `4px dashed rgba(255,255,255,${0.3 + 0.6 * logo})`,
            color: C.text,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${40 * logo}px rgba(255,255,255,0.25)`,
            flexShrink: 0,
          }}
        >
          TUA LOGO
        </div>
        <div>
          <div style={{ color: C.text, fontSize: 44, fontWeight: 800, opacity: 0.35 + 0.65 * nome }}>Nome da tua adega</div>
          <div style={{ height: 18, width: 300, borderRadius: 9, background: "rgba(255,255,255,0.12)", marginTop: 16 }} />
        </div>
      </Card>

      {/* MANDA ADEGA NO DIRECT — fica até o fim */}
      <div style={{ position: "absolute", top: 900, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity: cta.opacity, transform: `scale(${cta.scale})` }}>
        <div
          style={{
            padding: "34px 50px",
            borderRadius: 48,
            background: C.green,
            color: "#04160a",
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -2,
            textAlign: "center",
            boxShadow: `0 0 ${glow}px ${C.greenGlow}`,
          }}
        >
          MANDA ADEGA
          <br />
          NO DIRECT
        </div>
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
  const s4 = cue.start("monto") - 0.3;
  const s5 = cue.start("logo") - 0.3;

  const msgAt = [cue.word("sabado", "três") - 0.05, cue.word("sabado", "te") - 0.05, cue.word("sabado", "mesmo") - 0.05];
  const aloneAt = cue.word("volta", "aparece");
  const valeuAt = cue.start("valeu");
  const t = {
    open: cue.word("cliente", "cliente"),
    add1: cue.word("cliente", "escolhe") + 0.05,
    add2: cue.word("cliente", "escolhe") + 0.4,
    send: cue.word("cliente", "pedido") + 0.05,
    panel: cue.start("chega") - 0.05,
    arrive: cue.word("chega", "chega") - 0.05,
    confirm: cue.word("chega", "confirmar") + 0.1,
    delivery: cue.word("chega", "marcar") + 0.1,
  };
  const ctaAt = cue.word("direct", "manda") - 0.1;

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
        <Solucao from={s4} cue={cue} t={t} />
      </Scene>
      <Scene from={s5} to={end} fadeOut={0}>
        <Chamada from={s5} cue={cue} />
      </Scene>

      <Captions timings={timings} replace={episode.captionReplace} green={["ADEGA"]} />

      <Audio src={staticFile(`episodes/${episode.id}/voice.wav`)} />
      {msgAt.map((m, i) => (
        <Sfx key={i} name="message" at={m} volume={0.5} />
      ))}
      {[s2, s3, s4, s5].map((s, i) => (
        <Sfx key={`w${i}`} name="whoosh" at={s - 0.15} volume={0.3} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <Sfx key={`c${i}`} name="tick" at={s2 + 0.4 + i * 0.3} volume={0.12} />
      ))}
      <Sfx name="message" at={valeuAt - 0.1} volume={0.5} />
      <Sfx name="lost" at={valeuAt + 0.05} volume={0.3} />
      {(["Pix", "cartão", "entrega"] as const).map((w) => (
        <Sfx key={w} name="tick" at={cue.word("caixa", w) - 0.05} volume={0.3} />
      ))}
      <Sfx name="tap" at={t.open} volume={0.5} />
      <Sfx name="tap" at={t.add1} volume={0.45} />
      <Sfx name="tap" at={t.add2} volume={0.45} />
      <Sfx name="tap" at={t.send} volume={0.5} />
      <Sfx name="success" at={t.arrive} volume={0.5} />
      <Sfx name="tap" at={t.confirm} volume={0.45} />
      <Sfx name="tap" at={t.delivery} volume={0.45} />
      <Sfx name="reveal" at={ctaAt} volume={0.4} />
    </AbsoluteFill>
  );
};
