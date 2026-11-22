import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { Background, Scene, Sfx, pop, progress, useLocal } from "../components/Base";
import { Camera, CamKey } from "../components/Camera";
import { Captions } from "../components/Captions";
import { brl } from "../components/Catalog";
import { Counter, MiniPhone, Person } from "../components/Figures";
import { ChatList, ChatRow, PhoneFrame } from "../components/Panels";
import { Btn, CategoryIcon, Field, Row, Stat, StatusSteps } from "../components/Store";
import { Bubble, Dot, TapRing } from "../components/Ui";
import { Cues, EpisodeProps, makeCues } from "../lib/timing";
import { C, SAFE, SAFE_CENTER_X } from "../theme";

// ——— Dados fictícios (os mesmos no cliente e no painel) ———
const STORE = "Adega da Esquina";
const ORDER = "#0127";
const ADDRESS = "Rua das Palmeiras, 245";
const BAIRRO = "Centro";
const COMBO = { name: "Combo Esquenta", desc: "12 latas + gelo 5 kg", price: 59.9, cost: 41.0 };
const FEE = 5.0;
const TOTAL = COMBO.price + FEE;
const MESSAGES = ["Tem gelo?", "Quanto fica o combo?", "Entregam aqui?"];

const PW = 560; // celular (coordenadas locais)
const PH = 1000;
const PX = SAFE_CENTER_X - PW / 2;
const PY = 255;
const CX = SAFE_CENTER_X;
const CY = PY + PH / 2;
const CENTER: Omit<CamKey, "t"> = { s: 1, x: PW / 2, y: PH / 2 };

const CHATS: ChatRow[] = [
  { name: "Cliente 1", text: "Tem gelo?", time: "21:42" },
  { name: "Cliente 2", text: "Quanto fica o combo?", time: "21:42" },
  { name: "Cliente 4", text: "vcs abrem amanhã?", time: "21:39" },
  { name: "Cliente 5", text: "manda a chave pix", time: "21:35" },
  { name: "Cliente 6", text: "obrigado!", time: "21:31" },
  { name: "Cliente 7", text: "tem seda?", time: "21:28" },
  { name: "Cliente 8", text: "2 fardos por favor", time: "21:20" },
  { name: "Cliente 3", text: "Rua das Palmeiras, 245", time: "21:12" },
  { name: "Cliente 9", text: "chegou certinho", time: "21:05" },
  { name: "Cliente 10", text: "quanto tá o gelo?", time: "20:58" },
  { name: "Cliente 11", text: "comprovante.jpg", time: "20:51" },
  { name: "Cliente 12", text: "valeu!", time: "20:44" },
];

// ——— 0–13 s: a correria no balcão ———
const Balcao: React.FC<{ from: number; cue: Cues; ep: EpisodeProps["episode"]; msgAt: number[]; chatAt: number; lostAt: number }> = ({
  from,
  cue,
  ep,
  msgAt,
  chatAt,
  lostAt,
}) => {
  const { now } = useLocal(from);
  const busy = Math.sin(now * 6);
  const partA = 1 - progress(now, chatAt - 0.25, chatAt + 0.05);
  const phoneIn = progress(now, chatAt, chatAt + 0.35);
  const scroll = interpolate(now, [chatAt + 0.3, cue.word("balcao", "perdido"), cue.word("balcao", "conversa.") + 0.3, cue.end("balcao") + 0.5], [0, 7 * 118 - 260, 4 * 118, 11 * 118 - 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => x * x * (3 - 2 * x),
  });
  const lost = pop(now, 9999, 0.4);
  const count = msgAt.filter((t) => now >= t).length;
  return (
    <AbsoluteFill>
      <div style={{ opacity: partA }}>
        <div style={{ position: "absolute", top: SAFE.top + 30, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", fontSize: 30, letterSpacing: 6, fontWeight: 600, color: C.muted, textTransform: "uppercase", opacity: progress(now, 0, 0.4) }}>
          {ep.series}
        </div>
        <div style={{ position: "absolute", top: 330, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity: pop(now, 0.2).opacity }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 28px", borderRadius: 999, background: C.bgLift, border: `2px solid ${C.cardBorder}`, color: C.text, fontSize: 36, fontWeight: 700 }}>
            <Dot color="#ffffff" size={18} />
            Sábado, 21:42
          </div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left + 10, top: 460, display: "flex", flexDirection: "column", gap: 18 }}>
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
        <Person x={660 + 40 * Math.sin(now * 3)} y={1060} size={220} lean={busy * 5} bob={Math.abs(busy) * -6} />
        <Counter x={170} y={1030} width={740} />
        <MiniPhone x={820} y={1030 - 104} w={58} lit={progress(now, msgAt[0], msgAt[0] + 0.15)} />
        {count > 0 && (
          <div style={{ position: "absolute", left: 855, top: 900, width: 48, height: 48, borderRadius: 24, background: C.text, color: "#0b0b0b", fontSize: 30, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 24px ${C.glow}` }}>
            {count}
          </div>
        )}
        <Person x={300} y={1225} size={220} dim />
        <Person x={470} y={1235} size={200} dim />
      </div>

      {/* o endereço perdido na conversa */}
      <div style={{ opacity: phoneIn, transform: `translateY(${(1 - phoneIn) * 50}px)` }}>
        <PhoneFrame x={SAFE_CENTER_X - 270} y={250} w={540} h={950}>
          <ChatList rows={CHATS} scroll={scroll} w={540} highlight={[7]} hi={progress(now, cue.word("balcao", "endereço"), cue.word("balcao", "endereço") + 0.3)} />
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.65 * lost.x})` }} />
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};


// ——— Conta: quanto custa demorar pra responder ———
const MoneyRow: React.FC<{ now: number; top: number; label: string; perDay: number; labelAt: number; fillA: number; fillB: number; valueAt: number }> = ({
  now,
  top,
  label,
  perDay,
  labelAt,
  fillA,
  fillB,
  valueAt,
}) => {
  const l = pop(now, labelAt - 0.05, 0.4);
  const v = pop(now, valueAt - 0.05, 0.45);
  const filled = Math.round(interpolate(now, [fillA, fillB], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ position: "absolute", left: SAFE.left + 10, width: SAFE.right - SAFE.left - 20, top, opacity: l.opacity, transform: `scale(${l.scale})`, transformOrigin: "50% 0" }}>
      <div style={{ background: C.card, border: `2px solid ${v.x > 0 ? "rgba(255,77,77,0.45)" : C.cardBorder}`, borderRadius: 34, padding: "30px 36px", boxShadow: v.x > 0 ? "0 0 60px rgba(255,77,77,0.12)" : undefined }}>
        <div style={{ color: C.text, fontSize: 40, fontWeight: 700, lineHeight: 1.15 }}>{label}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 20, width: 15 * 33 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 7, background: i < filled ? "#e6e6e6" : "#222", boxShadow: i < filled ? `0 0 10px ${C.glow}` : undefined }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 18, opacity: v.opacity, transform: `scale(${v.scale})`, transformOrigin: "0 50%" }}>
          <span style={{ color: C.red, fontSize: 112, fontWeight: 800, letterSpacing: -4, textShadow: `0 0 40px ${C.redGlow}` }}>{brl(perDay * 30).replace(",00", "")}</span>
          <span style={{ color: C.muted, fontSize: 38, fontWeight: 600 }}>em 30 dias</span>
        </div>
      </div>
    </div>
  );
};

const Conta: React.FC<{ from: number; cue: Cues; lostAt: number }> = ({ from, cue, lostAt }) => {
  const { now } = useLocal(from);
  const chatIn = pop(now, from + 0.1, 0.4);
  const waitA = cue.word("correria", "cinco") - 0.1;
  const mins = Math.round(interpolate(now, [waitA, cue.word("correria", "responder") + 0.3], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const lost = pop(now, lostAt - 0.1, 0.4);
  const isLost = now >= lostAt;
  const calcAt = cue.start("um") - 0.3;
  const partA = 1 - progress(now, calcAt - 0.2, calcAt + 0.1);
  const outAt = cue.start("imagina") - 0.2;
  const partB = progress(now, calcAt, calcAt + 0.3) * (1 - progress(now, outAt - 0.2, outAt + 0.1));
  const partC = progress(now, outAt, outAt + 0.35);
  const busy = Math.sin(now * 6);
  return (
    <AbsoluteFill>
      {/* conversa esperando */}
      <div style={{ opacity: partA }}>
        <div style={{ position: "absolute", left: SAFE.left + 10, top: 330, width: SAFE.right - SAFE.left - 20, opacity: chatIn.opacity, transform: `scale(${chatIn.scale})` }}>
          <div style={{ background: C.card, border: `2px solid ${isLost ? "rgba(255,77,77,0.55)" : C.cardBorder}`, borderRadius: 36, padding: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
              <div style={{ width: 62, height: 62, borderRadius: 31, background: "linear-gradient(180deg,#fff,#bbb)", boxShadow: `0 0 20px ${C.glow}` }} />
              <div>
                <div style={{ color: C.text, fontSize: 34, fontWeight: 700 }}>Cliente 3</div>
                <div style={{ color: C.muted, fontSize: 24 }}>WhatsApp</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
              <Bubble text="Tem gelo? Entrega na Rua das Palmeiras?" time="21:42" fontSize={42} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 24px", borderRadius: 999, background: "#1b1b1d", color: isLost ? C.red : C.text, fontSize: 32, fontWeight: 700, opacity: progress(now, waitA, waitA + 0.2), fontVariantNumeric: "tabular-nums" }}>
                <Dot color={isLost ? C.red : "#ffffff"} size={16} />
                {mins} {mins === 1 ? "minuto" : "minutos"} sem resposta
              </div>
              <div style={{ opacity: lost.opacity, filter: `drop-shadow(0 0 40px rgba(255,77,77,${0.3 * lost.x}))` }}>
                <Bubble text="Valeu, já pedi em outro lugar." time="21:47" scale={lost.scale} fontSize={48} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* a conta, em duas batidas */}
      <div style={{ opacity: partB }}>
        <MoneyRow
          now={now}
          top={250}
          label="1 pedido de R$ 30 perdido por dia"
          perDay={30}
          labelAt={cue.word("um", "escapar")}
          fillA={cue.word("um", "trinta")}
          fillB={cue.word("um", "novecentos") - 0.1}
          valueAt={cue.word("um", "novecentos")}
        />
        <MoneyRow
          now={now}
          top={700}
          label="2 pedidos de R$ 30 perdidos por dia"
          perDay={60}
          labelAt={cue.word("dois", "escaparem")}
          fillA={cue.word("dois", "escaparem") + 0.2}
          fillB={cue.word("dois", "mil") - 0.1}
          valueAt={cue.word("dois", "mil")}
        />
        <div style={{ position: "absolute", top: 1170, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", color: C.muted, fontSize: 26, fontWeight: 600, opacity: progress(now, cue.word("um", "novecentos"), cue.word("um", "novecentos") + 0.4) }}>
          Simulação com pedido médio de R$ 30
        </div>
      </div>

      {/* "agora imagina ter um site recebendo pedido…" */}
      <div style={{ opacity: partC }}>
        <Person x={600 + 40 * Math.sin(now * 3)} y={1000} size={230} lean={busy * 5} bob={Math.abs(busy) * -6} />
        <Counter x={170} y={970} width={740} />
        <MiniPhone x={800} y={970 - 104} w={58} lit={0.6 + 0.4 * Math.abs(Math.sin(now * 3))} />
        <Person x={330} y={1200} size={220} dim />
      </div>
    </AbsoluteFill>
  );
};

// ——— o pedido pelo olhar do cliente ———
const Cliente: React.FC<{ from: number; t: Record<string, number> }> = ({ from, t }) => {
  const { now } = useLocal(from);
  const s1 = progress(now, t.openLink + 0.1, t.openLink + 0.4); // catálogo
  const s2 = progress(now, t.tapCombos + 0.1, t.tapCombos + 0.4); // combos
  const s3 = progress(now, t.tapContinue + 0.1, t.tapContinue + 0.4); // entrega
  const s4 = progress(now, t.tapFinish + 0.15, t.tapFinish + 0.45); // status
  const added = now >= t.tapAdd + 0.05;
  const typed = ADDRESS.slice(0, Math.round(interpolate(now, [t.typeA, t.typeB], [0, ADDRESS.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const bairro = now >= t.typeB + 0.2 ? BAIRRO : "";
  const accepted = now >= t.accept;
  const confirm = pop(now, t.accept, 0.45);
  const keys: CamKey[] = [
    { t: from, ...CENTER },
    { t: t.openLink - 0.6, s: 1.35, x: PW / 2, y: 560 },
    { t: t.openLink + 0.2, s: 1.35, x: PW / 2, y: 560 },
    { t: t.openLink + 0.6, ...CENTER },
    { t: t.tapCombos - 0.5, s: 1.25, x: 410, y: 560 },
    { t: t.tapCombos + 0.25, s: 1.25, x: 410, y: 560 },
    { t: t.tapCombos + 0.55, s: 1.25, x: 370, y: 380 },
    { t: t.tapAdd + 0.3, s: 1.25, x: 370, y: 380 },
    { t: t.tapContinue - 0.2, s: 1.25, x: PW / 2, y: 900 },
    { t: t.tapContinue + 0.4, ...CENTER },
    { t: t.typeA - 0.1, s: 1.4, x: PW / 2, y: 300 },
    { t: t.typeB + 0.4, s: 1.4, x: PW / 2, y: 330 },
    { t: t.tapFinish - 0.4, s: 1.3, x: PW / 2, y: 880 },
    { t: t.tapFinish + 0.3, s: 1.3, x: PW / 2, y: 880 },
    { t: t.tapFinish + 0.7, ...CENTER },
    { t: t.accept + 0.3, ...CENTER },
    { t: t.accept + 0.9, s: 1.3, x: PW / 2, y: 430 },
    { t: t.phoneOut, s: 1.3, x: PW / 2, y: 430 },
    { t: t.phoneOut + 0.4, ...CENTER },
  ];
  const tapPress = (at: number) => progress(now, at - 0.05, at + 0.08) * (1 - progress(now, at + 0.12, at + 0.3));
  const screen = (o: number, dx = 0): React.CSSProperties => ({ position: "absolute", inset: 0, opacity: o, transform: `translateX(${dx}px)` });
  const tileW = (PW - 60 - 20) / 2;
  const cats = [
    { k: "cerveja", label: "Cervejas" },
    { k: "seda", label: "Sedas" },
    { k: "gelo", label: "Gelo" },
    { k: "combo", label: "Combos" },
  ] as const;
  const phoneIn = progress(now, from, from + 0.35);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 205, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity: phoneIn * (1 - progress(now, t.phoneOut - 0.2, t.phoneOut + 0.2)) }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, color: C.muted, padding: "6px 22px", borderRadius: 999, border: `2px solid ${C.cardBorder}` }}>CELULAR DO CLIENTE</div>
      </div>
      <div style={{ opacity: phoneIn, transform: `translateY(${(1 - phoneIn) * 60}px)` }}>
        <Camera keys={keys} now={now} cx={CX} cy={CY} w={PW} h={PH}>
          <PhoneFrame x={0} y={0} w={PW} h={PH}>
            {/* 0: conversa com o link da loja */}
            <div style={{ ...screen(1 - s1), padding: 30, paddingTop: 90 }}>
              <div style={{ color: C.muted, fontSize: 26, textAlign: "center", marginBottom: 30 }}>{STORE}</div>
              <div style={{ background: "#1d1d1f", borderRadius: "28px 28px 28px 8px", padding: 26, border: `2px solid ${C.cardBorder}`, transform: `scale(${1 - 0.04 * tapPress(t.openLink)})` }}>
                <div style={{ color: C.text, fontSize: 30, marginBottom: 18 }}>Faz teu pedido pela nossa loja 👇</div>
                <div style={{ borderRadius: 20, background: "#28282a", padding: 22, display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ width: 90, height: 90, borderRadius: 45, background: "linear-gradient(180deg,#fff,#c9c9c9)", color: "#0b0b0b", fontWeight: 800, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>AE</div>
                  <div>
                    <div style={{ color: C.text, fontSize: 32, fontWeight: 800 }}>{STORE}</div>
                    <div style={{ color: C.muted, fontSize: 26, marginTop: 4 }}>Catálogo e entrega</div>
                    <div style={{ color: "#8ab4ff", fontSize: 26, marginTop: 6 }}>Abrir loja ↗</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1: catálogo com categorias */}
            <div style={screen(s1 * (1 - s2), (1 - s1) * 60)}>
              <div style={{ padding: "60px 30px 0", display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 70, height: 70, borderRadius: 35, background: "linear-gradient(180deg,#fff,#c9c9c9)", color: "#0b0b0b", fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>AE</div>
                <div style={{ color: C.text, fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>{STORE}</div>
              </div>
              <div style={{ position: "absolute", left: 30, top: 180, color: C.text, fontSize: 44, fontWeight: 800 }}>Categorias</div>
              {cats.map((c, i) => {
                const glow = progress(now, t.see + i * 0.18, t.see + i * 0.18 + 0.25) * (1 - progress(now, t.see + 1.2, t.see + 1.5));
                const isCombo = c.k === "combo";
                return (
                  <div
                    key={c.k}
                    style={{
                      position: "absolute",
                      left: 30 + (i % 2) * (tileW + 20),
                      top: 260 + Math.floor(i / 2) * 300,
                      width: tileW,
                      height: 280,
                      borderRadius: 30,
                      background: "#1b1b1d",
                      border: `2px solid rgba(255,255,255,${0.08 + 0.5 * glow + (isCombo ? 0.6 * progress(now, t.tapCombos - 0.3, t.tapCombos) : 0)})`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 14,
                      transform: `scale(${1 - (isCombo ? 0.05 * tapPress(t.tapCombos) : 0)})`,
                    }}
                  >
                    <CategoryIcon kind={c.k} size={130} />
                    <div style={{ color: C.text, fontSize: 40, fontWeight: 800 }}>{c.label}</div>
                  </div>
                );
              })}
              <TapRing x={30 + tileW + 20 + tileW / 2} y={260 + 300 + 140} t={(now - t.tapCombos) / 0.45} />
            </div>

            {/* 2: combos */}
            <div style={screen(s2 * (1 - s3), (1 - s2) * 60)}>
              <div style={{ padding: "60px 30px 0", color: C.text, fontSize: 48, fontWeight: 800 }}>‹ Combos</div>
              {[COMBO, { name: "Combo Tabacaria", desc: "Seda + piteira + isqueiro", price: 24.9 }, { name: "Combo Churrasco", desc: "18 latas + carvão + gelo", price: 99.9 }].map((p, i) => (
                <div key={i} style={{ position: "absolute", left: 30, top: 170 + i * 250, width: PW - 60, height: 230, borderRadius: 30, background: "#1b1b1d", border: `2px solid rgba(255,255,255,${i === 0 ? 0.1 + 0.5 * progress(now, t.tapAdd - 0.4, t.tapAdd) : 0.08})`, display: "flex", gap: 22, padding: 22, boxSizing: "border-box" }}>
                  <div style={{ width: 150, height: 186, borderRadius: 22, background: "linear-gradient(160deg,#2c2c2e,#161618)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CategoryIcon kind={i === 1 ? "seda" : "combo"} size={120} />
                  </div>
                  <div style={{ flex: 1, position: "relative" }}>
                    <div style={{ color: C.text, fontSize: 32, fontWeight: 800 }}>{p.name}</div>
                    <div style={{ color: C.muted, fontSize: 24, marginTop: 4 }}>{p.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                      <div style={{ color: C.text, fontSize: 28, fontWeight: 800, whiteSpace: "nowrap" }}>{brl(p.price)}</div>
                      {i === 0 && (
                        <div style={{ padding: "10px 16px", borderRadius: 999, background: added ? C.text : "transparent", border: `3px solid ${C.text}`, color: added ? "#0b0b0b" : C.text, fontSize: 22, fontWeight: 800, whiteSpace: "nowrap", transform: `scale(${1 - 0.06 * tapPress(t.tapAdd)})` }}>
                          {added ? "✓ Adicionado" : "+ Adicionar"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <TapRing x={PW - 30 - 22 - 70} y={170 + 22 + 130} t={(now - t.tapAdd) / 0.45} />
              <div style={{ position: "absolute", left: 30, bottom: 40, width: PW - 60, height: 100, borderRadius: 50, background: C.text, color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px", boxSizing: "border-box", fontSize: 30, fontWeight: 800, opacity: progress(now, t.tapAdd + 0.1, t.tapAdd + 0.35), transform: `scale(${1 - 0.05 * tapPress(t.tapContinue)})` }}>
                <span>1 item · {brl(COMBO.price)}</span>
                <span>Continuar ›</span>
              </div>
              <TapRing x={PW / 2} y={PH - 90} t={(now - t.tapContinue) / 0.45} />
            </div>

            {/* 3: entrega */}
            <div style={screen(s3 * (1 - s4), (1 - s3) * 60)}>
              <div style={{ padding: "60px 30px 0", color: C.text, fontSize: 48, fontWeight: 800 }}>Entrega</div>
              <Field label="Endereço" value={typed} caret={now >= t.typeA - 0.2 && now < t.typeB + 0.2 && Math.floor(now * 3) % 2 === 0} active={progress(now, t.typeA - 0.3, t.typeA) * (1 - progress(now, t.typeB + 0.3, t.typeB + 0.5))} y={170} w={PW} />
              <Field label="Bairro" value={bairro} y={330} w={PW} />
              <div style={{ position: "absolute", left: 30, top: 520, width: PW - 60, borderRadius: 26, background: "#1b1b1d", padding: "22px 26px", boxSizing: "border-box" }}>
                <Row a={`1× ${COMBO.name}`} b={brl(COMBO.price)} />
                <Row a="Taxa de entrega" b={brl(FEE)} color={C.muted} />
                <div style={{ height: 2, background: C.cardBorder, margin: "10px 0" }} />
                <Row a="Total" b={brl(TOTAL)} bold size={32} />
              </div>
              <Btn label="Finalizar pedido" y={PH - 140} w={PW} press={tapPress(t.tapFinish)} />
              <TapRing x={PW / 2} y={PH - 92} t={(now - t.tapFinish) / 0.45} />
            </div>

            {/* 4: status do pedido */}
            <div style={{ ...screen(s4), padding: "60px 30px 0" }}>
              <div style={{ color: C.muted, fontSize: 26, fontWeight: 600 }}>Pedido {ORDER}</div>
              <div style={{ color: accepted ? C.green : C.text, fontSize: 50, fontWeight: 800, letterSpacing: -1, marginTop: 4, textShadow: accepted ? `0 0 30px ${C.greenGlow}` : undefined }}>
                {accepted ? "Pedido confirmado" : "Pedido enviado"}
              </div>
              <div style={{ color: C.muted, fontSize: 28, marginTop: 8, height: 36 }}>{accepted ? `${STORE} aceitou teu pedido` : "Aguardando a loja aceitar…"}</div>
              <div
                style={{
                  marginTop: 34,
                  height: 140,
                  borderRadius: 28,
                  background: `rgba(61,220,114,${0.12 * confirm.x})`,
                  border: `2px solid rgba(61,220,114,${0.6 * confirm.x})`,
                  boxShadow: `0 0 ${40 * confirm.x}px rgba(61,220,114,0.2)`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "0 28px",
                  opacity: confirm.opacity,
                  transform: `scale(${confirm.scale})`,
                }}
              >
                <div style={{ color: C.muted, fontSize: 26, fontWeight: 600 }}>Previsão de entrega</div>
                <div style={{ color: C.green, fontSize: 48, fontWeight: 800 }}>35 minutos</div>
              </div>
              <div style={{ marginTop: 40 }}>
                <StatusSteps
                  now={now}
                  steps={[
                    { label: "Pedido enviado", done: true },
                    { label: "Confirmado pela loja", done: false, at: t.accept },
                    { label: "Saiu para entrega", done: false },
                  ]}
                />
              </div>
              <div style={{ position: "absolute", left: 30, right: 30, bottom: 50, borderRadius: 24, background: "#1b1b1d", padding: "20px 24px" }}>
                <Row a={`1× ${COMBO.name}`} b={brl(TOTAL)} size={26} />
                <div style={{ color: C.muted, fontSize: 24 }}>
                  {ADDRESS} · {BAIRRO}
                </div>
              </div>
            </div>
          </PhoneFrame>
        </Camera>
      </div>
    </AbsoluteFill>
  );
};

// ——— 36–46 s: o pedido pelo olhar do dono ———
const Painel: React.FC<{ from: number; t: Record<string, number>; mini?: boolean }> = ({ from, t, mini }) => {
  const { now: realNow } = useLocal(from);
  const now = mini ? t.statsAt + 2 : realNow; // no fechamento, painel parado no estado final
  const arrive = progress(now, t.arrive, t.arrive + 0.4);
  const accepted = now >= t.ownerAccept + 0.05;
  const shipped = now >= t.ownerShip + 0.05;
  const registered = progress(now, t.ownerShip + 0.35, t.ownerShip + 0.65);
  const press = (at: number) => progress(now, at - 0.05, at + 0.08) * (1 - progress(now, at + 0.12, at + 0.3));
  const statW = (PW - 60 - 24) / 3;
  const cardTop = 330;
  const status = shipped ? "Saiu para entrega" : accepted ? "Confirmado" : "Novo pedido";
  const keys: CamKey[] = mini
    ? [{ t: 0, ...CENTER }]
    : [
        { t: from, ...CENTER },
        { t: t.arrive + 0.5, ...CENTER },
        { t: t.items - 0.1, s: 1.3, x: PW / 2, y: 520 },
        { t: t.addr + 0.6, s: 1.3, x: PW / 2, y: 640 },
        { t: t.ownerAccept - 0.35, s: 1.3, x: PW / 2, y: 800 },
        { t: t.ownerShip + 0.5, s: 1.3, x: PW / 2, y: 800 },
        { t: t.statsAt - 0.1, s: 1.25, x: PW / 2, y: 230 },
        { t: t.statsAt + 1.6, s: 1.25, x: PW / 2, y: 230 },
        { t: t.statsAt + 2.2, ...CENTER },
      ];
  const content = (
    <PhoneFrame x={0} y={0} w={PW} h={PH}>
      <div style={{ padding: "50px 30px 0" }}>
        <div style={{ color: C.muted, fontSize: 22, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>{STORE}</div>
        <div style={{ color: C.text, fontSize: 46, fontWeight: 800, letterSpacing: -1 }}>Painel</div>
      </div>
      <div style={{ position: "absolute", left: 30, top: 160, display: "flex", gap: 12 }}>
        <Stat label="Vendas de hoje" from={23} to={24} now={now} at={t.statsAt} w={statW} />
        <Stat label="Faturamento" from={1486.4} to={1486.4 + TOTAL} now={now} at={t.statsAt + 0.15} money w={statW} />
        <Stat label="Lucro de hoje" from={412.8} to={412.8 + COMBO.price - COMBO.cost} now={now} at={t.statsAt + 0.3} money w={statW} />
      </div>
      <div style={{ position: "absolute", left: 30, top: 310 - 10, color: C.muted, fontSize: 24, fontWeight: 700 }}>PEDIDOS</div>
      <div
        style={{
          position: "absolute",
          left: 30,
          right: 30,
          top: cardTop + 16,
          height: 600,
          borderRadius: 30,
          background: "#1b1b1d",
          border: `2px solid rgba(61,220,114,${0.15 + 0.4 * arrive})`,
          boxShadow: `0 0 ${50 * arrive}px rgba(61,220,114,0.15)`,
          opacity: arrive,
          transform: `translateY(${(1 - arrive) * -40}px)`,
          padding: 26,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: C.text, fontSize: 36, fontWeight: 800 }}>{ORDER}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10, color: C.green, fontSize: 24, fontWeight: 700, whiteSpace: "nowrap" }}>
            <Dot color={C.green} size={14} />
            {status}
          </span>
        </div>
        <div style={{ color: C.muted, fontSize: 24, marginTop: 2 }}>Cliente · via link</div>
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 18, background: `rgba(255,255,255,${0.06 * progress(now, t.items - 0.1, t.items + 0.2)})` }}>
          <Row a={`1× ${COMBO.name}`} b={brl(COMBO.price)} size={27} />
          <div style={{ color: C.muted, fontSize: 22 }}>{COMBO.desc}</div>
          <Row a="Taxa de entrega" b={brl(FEE)} size={25} color={C.muted} />
          <Row a="Total" b={brl(TOTAL)} bold size={29} />
        </div>
        <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 18, background: `rgba(255,255,255,${0.06 * progress(now, t.addr - 0.1, t.addr + 0.2)})` }}>
          <div style={{ color: C.muted, fontSize: 22, fontWeight: 600 }}>Entregar em</div>
          <div style={{ color: C.text, fontSize: 28, fontWeight: 700 }}>
            {ADDRESS} · {BAIRRO}
          </div>
        </div>
        <div style={{ marginTop: 10, height: 34, color: C.green, fontSize: 22, fontWeight: 600, opacity: registered }}>
          ✓ Venda registrada · lucro {brl(COMBO.price - COMBO.cost)}
        </div>
      </div>
      {/* botões do fluxo: aceitar → saiu para entrega */}
      <div style={{ opacity: arrive }}>
        {!accepted && <Btn label="Aceitar pedido" y={cardTop + 16 + 600 - 120} w={PW} press={press(t.ownerAccept)} green />}
        {accepted && !shipped && <Btn label="Saiu para entrega" y={cardTop + 16 + 600 - 120} w={PW} press={press(t.ownerShip)} />}
        {shipped && (
          <div style={{ position: "absolute", left: 30, right: 30, top: cardTop + 16 + 600 - 120, height: 96, borderRadius: 48, border: `2px solid ${C.green}`, background: "rgba(61,220,114,0.12)", color: C.green, fontSize: 32, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
            Em entrega ✓
          </div>
        )}
      </div>
      <TapRing x={PW / 2} y={cardTop + 16 + 600 - 120 + 48} t={(now - t.ownerAccept) / 0.45} />
      <TapRing x={PW / 2} y={cardTop + 16 + 600 - 120 + 48} t={(now - t.ownerShip) / 0.45} />
    </PhoneFrame>
  );
  if (mini) return content;
  const inP = progress(now, from, from + 0.4);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 205, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity: inP }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, color: C.muted, padding: "6px 22px", borderRadius: 999, border: `2px solid ${C.cardBorder}` }}>PAINEL DA ADEGA</div>
      </div>
      <div style={{ opacity: inP, transform: `translateX(${(1 - inP) * 120}px)` }}>
        <Camera keys={keys} now={now} cx={CX} cy={CY} w={PW} h={PH}>
          {content}
        </Camera>
      </div>
    </AbsoluteFill>
  );
};

/** Celular do cliente parado na tela "Pedido confirmado" (para o fechamento). */
const ClienteFinal: React.FC = () => (
  <PhoneFrame x={0} y={0} w={PW} h={PH}>
    <div style={{ padding: "60px 30px 0" }}>
      <div style={{ color: C.muted, fontSize: 26, fontWeight: 600 }}>Pedido {ORDER}</div>
      <div style={{ color: C.green, fontSize: 50, fontWeight: 800, letterSpacing: -1, marginTop: 4 }}>Pedido confirmado</div>
      <div style={{ color: C.muted, fontSize: 28, marginTop: 8 }}>{STORE} aceitou teu pedido</div>
      <div style={{ marginTop: 34, height: 140, borderRadius: 28, background: "rgba(61,220,114,0.12)", border: "2px solid rgba(61,220,114,0.6)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
        <div style={{ color: C.muted, fontSize: 26, fontWeight: 600 }}>Previsão de entrega</div>
        <div style={{ color: C.green, fontSize: 48, fontWeight: 800 }}>35 minutos</div>
      </div>
      <div style={{ marginTop: 40 }}>
        <StatusSteps now={0} steps={[{ label: "Pedido enviado", done: true }, { label: "Confirmado pela loja", done: true }, { label: "Saiu para entrega", done: true }]} />
      </div>
    </div>
  </PhoneFrame>
);

// ——— 46–53 s: fechamento ———
const Fechamento: React.FC<{ from: number; t: Record<string, number> }> = ({ from, t }) => {
  const { now } = useLocal(from);
  const sideIn = progress(now, from, from + 0.5);
  const logo = pop(now, t.logoAt, 0.5);
  const line = progress(now, t.logoAt + 0.4, t.logoAt + 0.8);
  const sc = 0.5;
  const mini = (x: number, label: string, child: React.ReactNode, dx: number) => (
    <div style={{ position: "absolute", left: x, top: 260, width: PW * sc, opacity: sideIn, transform: `translateX(${(1 - sideIn) * dx}px)` }}>
      <div style={{ textAlign: "center", color: C.muted, fontSize: 22, fontWeight: 700, letterSpacing: 3, marginBottom: 12 }}>{label}</div>
      <div style={{ width: PW * sc, height: PH * sc, position: "relative" }}>
        <div style={{ transform: `scale(${sc})`, transformOrigin: "0 0", width: PW, height: PH, position: "absolute" }}>{child}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      {mini(SAFE_CENTER_X - PW * sc - 20, "CLIENTE", <ClienteFinal />, -80)}
      {mini(SAFE_CENTER_X + 20, "TEU PAINEL", <Painel from={from} t={t} mini />, 80)}
      {/* logo (marca em texto até receber o arquivo oficial) */}
      <div style={{ position: "absolute", top: 860, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, opacity: logo.opacity, transform: `scale(${logo.scale})` }}>
        <div style={{ width: 92, height: 92, borderRadius: 26, background: C.green, boxShadow: `0 0 40px ${C.greenGlow}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 40, height: 60 }}>
            <div style={{ position: "absolute", left: 13, top: 0, width: 14, height: 18, borderRadius: 4, background: "#062611" }} />
            <div style={{ position: "absolute", left: 4, top: 14, width: 32, height: 46, borderRadius: "12px 12px 8px 8px", background: "#062611" }} />
          </div>
        </div>
        <div style={{ color: C.text, fontSize: 70, fontWeight: 800, letterSpacing: -2 }}>Adega no Digital</div>
      </div>
      <div style={{ position: "absolute", top: 990, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", color: C.muted, fontSize: 40, fontWeight: 600, opacity: line }}>
        Quer ver com a marca da tua loja?
      </div>
    </AbsoluteFill>
  );
};

export const Ep03DoLinkAoPainel: React.FC<EpisodeProps> = ({ episode, timings }) => {
  const cue = makeCues(timings);
  const end = episode.durationSec;

  const msgAt = [cue.word("balcao", "gelo,") - 0.1, cue.word("balcao", "outro") - 0.05, cue.word("balcao", "valor") - 0.05];
  const chatAt = cue.word("balcao", "endereço") - 0.25;
  const lostAt = cue.word("correria", "custar") - 0.05;

  const sConta = cue.start("correria") - 0.25;
  const s2 = cue.word("imagina", "enquanto") - 0.15;
  const t = {
    openLink: cue.end("imagina") - 0.05,
    see: cue.word("ve", "vê"),
    tapCombos: cue.word("escolhe", "escolhe") + 0.05,
    tapAdd: cue.word("escolhe", "combo,") + 0.15,
    tapContinue: cue.word("escolhe", "combo,") + 1.0,
    typeA: cue.word("endereco", "coloca"),
    typeB: cue.word("endereco", "endereço") + 1.0,
    tapFinish: cue.word("faz", "pedido."),
    accept: cue.end("toques") + 0.5, // loja aceita → "Pedido confirmado"
    phoneOut: cue.start("lado") - 0.6,
    arrive: cue.word("lado", "pedido") - 0.1,
    items: cue.word("lado", "itens"),
    addr: cue.word("lado", "endereço."),
    ownerAccept: cue.word("segue", "confere"),
    ownerShip: cue.word("segue", "segue"),
    statsAt: cue.word("segue", "segue") + 0.9,
    logoAt: cue.word("chama", "tabacaria,") + 0.2,
  };
  const s3 = cue.start("lado") - 0.3;
  const s4 = cue.start("chama") - 0.3;

  return (
    <AbsoluteFill>
      <Background />
      <Scene from={0} to={sConta} fadeIn={0}>
        <Balcao from={0} cue={cue} ep={episode} msgAt={msgAt} chatAt={chatAt} lostAt={lostAt} />
      </Scene>
      <Scene from={sConta} to={s2}>
        <Conta from={sConta} cue={cue} lostAt={lostAt} />
      </Scene>
      <Scene from={s2} to={s3}>
        <Cliente from={s2} t={t} />
      </Scene>
      <Scene from={s3} to={s4}>
        <Painel from={s3} t={t} />
      </Scene>
      <Scene from={s4} to={end} fadeOut={0}>
        <Fechamento from={s4} t={t} />
      </Scene>

      <Captions timings={timings} replace={episode.captionReplace} backdrop />

      <Audio src={staticFile(`episodes/${episode.id}/voice.wav`)} />
      {msgAt.map((m, i) => (
        <Sfx key={i} name="message" at={m} volume={0.3} />
      ))}
      <Sfx name="message" at={lostAt - 0.1} volume={0.3} />
      <Sfx name="lost" at={lostAt} volume={0.2} />
      <Sfx name="whoosh" at={sConta - 0.15} volume={0.25} />
      <Sfx name="reveal" at={cue.word("um", "novecentos") - 0.05} volume={0.3} />
      <Sfx name="reveal" at={cue.word("dois", "mil") - 0.05} volume={0.35} />
      {Array.from({ length: 10 }).map((_, i) => (
        <Sfx key={`d1${i}`} name="tick" at={cue.word("um", "trinta") + i * 0.12} volume={0.08} />
      ))}
      {[s2, s3, s4].map((s, i) => (
        <Sfx key={`w${i}`} name="whoosh" at={s - 0.15} volume={0.25} />
      ))}
      {(["openLink", "tapCombos", "tapAdd", "tapContinue", "tapFinish", "ownerAccept", "ownerShip"] as const).map((k) => (
        <Sfx key={k} name="tap" at={t[k]} volume={0.35} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <Sfx key={`k${i}`} name="tick" at={t.typeA + ((t.typeB - t.typeA) * i) / 10} volume={0.08} />
      ))}
      <Sfx name="success" at={t.accept} volume={0.3} />
      <Sfx name="message" at={t.arrive} volume={0.3} />
      <Sfx name="success" at={t.statsAt} volume={0.25} />
      <Sfx name="reveal" at={t.logoAt} volume={0.25} />
    </AbsoluteFill>
  );
};
