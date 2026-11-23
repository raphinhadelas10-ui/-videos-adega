import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { Background, Scene, Sfx, pop, progress, useLocal } from "../components/Base";
import { Captions } from "../components/Captions";
import { brl } from "../components/Catalog";
import { Counter, MiniPhone, Person } from "../components/Figures";
import { PhoneFrame } from "../components/Panels";
import { Dot, TapRing } from "../components/Ui";
import { Cues, EpisodeProps, makeCues } from "../lib/timing";
import { C, SAFE, SAFE_CENTER_X } from "../theme";

// ——— dados fictícios ———
const LOJA1 = "Adega Central";
const LOJA2 = "Adega Brisa";
const ADDRESS = "Rua das Gaivotas, 88";
const ORDER = "#0420";
const ITEMS = [
  { name: "Long neck 6 un", price: 42.0, icon: "bottle" as const },
  { name: "Gelo 5 kg", price: 18.0, icon: "ice" as const },
];
const TOTAL = 60; // conecta com a simulação
const G = "#1c1c1e";
const G2 = "#2a2a2d";
const BR = { accent: "#7fd3ff" }; // identidade da Adega Brisa (azul-brisa)

const ease = (now: number, a: number, b: number) => progress(now, a, b);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const press = (now: number, at: number) => progress(now, at - 0.05, at + 0.08) * (1 - progress(now, at + 0.12, at + 0.3));
const typeOut = (text: string, now: number, a: number, b: number) =>
  text.slice(0, Math.round(interpolate(now, [a, b], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
const blink = (now: number) => Math.floor(now * 2.5) % 2 === 0;

// ——— peças ———
const Caret: React.FC<{ h: number }> = ({ h }) => <span style={{ display: "inline-block", width: 4, height: h, background: C.text, marginLeft: 4, verticalAlign: "middle", borderRadius: 2 }} />;

const ChatInput: React.FC<{ text: string; caret: boolean; style?: React.CSSProperties; size?: number }> = ({ text, caret, style, size = 64 }) => (
  <div style={{ height: size * 2.1, borderRadius: size * 1.05, background: G2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${size * 0.3}px 0 ${size * 0.6}px`, boxSizing: "border-box", ...style }}>
    <div style={{ color: text ? C.text : C.muted, fontSize: size, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden" }}>
      {text || "Mensagem"}
      {caret && <Caret h={size * 1.0} />}
    </div>
    <div style={{ width: size * 1.45, height: size * 1.45, borderRadius: size, background: text ? "#e6e6e6" : "#3a3a3d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill={text ? "#111" : "#777"}>
        <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
      </svg>
    </div>
  </div>
);

const Thought: React.FC<{ text: string; x: number; y: number; p: { opacity: number; scale: number } }> = ({ text, x, y, p }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: p.opacity, transform: `scale(${p.scale})`, transformOrigin: "0 100%" }}>
    <div style={{ padding: "18px 32px", borderRadius: 46, background: G, border: "2px solid rgba(255,255,255,0.22)", color: C.text, fontSize: 46, fontWeight: 700, whiteSpace: "nowrap" }}>{text}</div>
    <div style={{ position: "absolute", left: -18, bottom: -16, width: 22, height: 22, borderRadius: 11, background: G, border: "2px solid rgba(255,255,255,0.22)" }} />
    <div style={{ position: "absolute", left: -40, bottom: -36, width: 12, height: 12, borderRadius: 6, background: G, border: "2px solid rgba(255,255,255,0.22)" }} />
  </div>
);

const BeachIcon: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 220, height: 160, opacity: o }}>
    <div style={{ position: "absolute", left: 60, top: 0, width: 100, height: 100, borderRadius: 50, background: "radial-gradient(circle,#fff,#d8d8d8)", boxShadow: "0 0 50px rgba(255,255,255,0.35)" }} />
    {[0, 1].map((i) => (
      <svg key={i} width="220" height="30" viewBox="0 0 220 30" style={{ position: "absolute", left: 0, top: 104 + i * 26 }}>
        <path d="M0 15 Q 27 0 55 15 T 110 15 T 165 15 T 220 15" stroke="rgba(255,255,255,0.6)" strokeWidth="5" fill="none" />
      </svg>
    ))}
  </div>
);

const Bottle: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.5} height={size} viewBox="0 0 50 100">
    <path d="M19 4h12v18c0 4 9 9 9 20v50c0 4-3 6-6 6H16c-3 0-6-2-6-6V42c0-11 9-16 9-20z" fill="#f2f2f2" />
  </svg>
);
const Cubes: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80">
    {[
      [30, 4],
      [10, 38],
      [50, 38],
    ].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`} stroke="#111" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M20 0l20 9v20l-20 9-20-9V9z" fill="#f2f2f2" />
        <path d="M0 9l20 9 20-9M20 18v20" fill="none" />
      </g>
    ))}
  </svg>
);
const CheckCircle: React.FC<{ size: number; on: number }> = ({ size, on }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: on > 0.5 ? C.green : G2, boxShadow: on > 0.5 ? `0 0 ${size * 0.5}px ${C.greenGlow}` : undefined, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${1 + 0.15 * Math.sin(Math.PI * Math.min(1, on))})` }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
      <path d="M5 12.5l4.2 4.2L19 7" stroke={on > 0.5 ? "#062611" : "#666"} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const BrisaLogo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: BR.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 40 40">
      <path d="M17 4h6v8c0 2 5 4 5 10v10H12V22c0-6 5-8 5-10z" fill="#08202e" />
      <path d="M4 34 Q 10 29 16 34 T 28 34 T 40 34" stroke="#08202e" strokeWidth="3" fill="none" />
    </svg>
  </div>
);

/** O cartão do pedido (o MESMO no celular e no painel). */
const OrderCard: React.FC<{ w: number; check: number; hi?: { itens: number; pag: number; end: number } }> = ({ w, check, hi = { itens: 0, pag: 0, end: 0 } }) => {
  const u = w / 760;
  const row = (on: number): React.CSSProperties => ({ borderRadius: 18 * u, padding: `${10 * u}px ${16 * u}px`, margin: `0 ${-16 * u}px`, background: `rgba(255,255,255,${0.09 * on})` });
  return (
    <div style={{ width: w, borderRadius: 40 * u, background: G, border: `${3 * u}px solid rgba(61,220,114,${0.15 + 0.55 * check})`, boxShadow: `0 ${20 * u}px ${60 * u}px rgba(0,0,0,0.6), 0 0 ${80 * u * check}px rgba(61,220,114,0.22)`, padding: `${34 * u}px ${42 * u}px`, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: C.muted, fontSize: 28 * u, fontWeight: 600 }}>Pedido {ORDER}</div>
          <div style={{ color: check > 0.5 ? C.green : C.text, fontSize: 50 * u, fontWeight: 800, letterSpacing: -1 * u }}>{check > 0.5 ? "Pedido confirmado" : "Resumo do pedido"}</div>
        </div>
        <CheckCircle size={86 * u} on={check} />
      </div>
      <div style={{ height: 2 * u, background: "rgba(255,255,255,0.1)", margin: `${22 * u}px 0` }} />
      <div style={row(hi.itens)}>
        {ITEMS.map((it, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 38 * u, fontWeight: 600, lineHeight: 1.5 }}>
            <span>1× {it.name}</span>
            <span>{brl(it.price)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 44 * u, fontWeight: 800, marginTop: 4 * u }}>
          <span>Total</span>
          <span>{brl(TOTAL)}</span>
        </div>
      </div>
      <div style={{ ...row(hi.pag), marginTop: 12 * u, display: "flex", justifyContent: "space-between", color: C.text, fontSize: 36 * u }}>
        <span style={{ color: C.muted }}>Pagamento</span>
        <span style={{ fontWeight: 700 }}>Pix</span>
      </div>
      <div style={{ ...row(hi.end), marginTop: 6 * u, color: C.text, fontSize: 36 * u }}>
        <div style={{ color: C.muted }}>Entrega</div>
        <div style={{ fontWeight: 700 }}>{ADDRESS}</div>
      </div>
    </div>
  );
};

/** Cartão compacto de pedido (para a conta). */
const MiniOrder: React.FC<{ w?: number; ghost?: boolean }> = ({ w = 300, ghost }) => (
  <div style={{ width: w, height: w * 0.62, borderRadius: w * 0.11, background: ghost ? "transparent" : G, border: ghost ? "3px dashed rgba(255,255,255,0.35)" : "2px solid rgba(255,255,255,0.14)", display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${w * 0.1}px`, boxSizing: "border-box" }}>
    <div style={{ color: C.muted, fontSize: w * 0.095, fontWeight: 600 }}>Pedido</div>
    <div style={{ color: C.text, fontSize: w * 0.19, fontWeight: 800, letterSpacing: -1 }}>R$ 60</div>
  </div>
);

// ——— 1. gancho ———
const Gancho: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const oi = cue.at("oi");
  const text = now < 0.22 ? "" : now < 0.47 ? "O" : now < oi ? "Oi" : now < oi + 0.09 ? "O" : "";
  const fieldOut = ease(now, cue.at("3.600") - 0.35, cue.at("3.600"));
  const notSent = ease(now, oi + 0.3, oi + 0.6);
  const v = pop(now, cue.at("3.600"), 0.5);
  const sub = ease(now, cue.at("3.600") + 0.5, cue.at("3.600") + 0.9);
  const ghosts = [cue.at("três"), cue.at("vezes"), cue.at("dia")];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 700, opacity: 1 - fieldOut, transform: `translateY(${-fieldOut * 60}px)` }}>
        <ChatInput text={text} caret={blink(now)} size={70} />
        <div style={{ marginTop: 26, textAlign: "center", color: C.muted, fontSize: 38, fontWeight: 600, opacity: notSent }}>Mensagem não enviada</div>
      </div>
      {ghosts.map((g, i) => {
        const p = ease(now, g, g + 0.25) * (1 - ease(now, g + 0.6, g + 1.1));
        return (
          <div key={i} style={{ position: "absolute", left: 180 + i * 250, top: 470, opacity: p * (1 - fieldOut), transform: `translateY(${(1 - p) * 20}px)`, padding: "16px 34px", borderRadius: 40, border: "3px dashed rgba(255,255,255,0.4)", color: C.muted, fontSize: 46, fontWeight: 700 }}>
            Oi
          </div>
        );
      })}
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 560, textAlign: "center", opacity: v.opacity, transform: `scale(${v.scale})` }}>
        <div style={{ color: C.green, fontSize: 200, fontWeight: 800, letterSpacing: -8, textShadow: `0 0 60px ${C.greenGlow}` }}>R$ 3.600</div>
        <div style={{ color: C.text, fontSize: 44, fontWeight: 600, marginTop: 10, opacity: sub }}>3 pedidos de R$ 60 por dia · 20 dias</div>
      </div>
    </AbsoluteFill>
  );
};

// ——— 2. João procura ———
const RESULT_RECT = [
  { x: SAFE.left + 10, y: 470, w: SAFE.right - SAFE.left - 20, h: 180 },
  { x: SAFE.left + 10, y: 680, w: SAFE.right - SAFE.left - 20, h: 180 },
];
const CHAT_RECT = { x: SAFE.left + 10, y: 230, w: SAFE.right - SAFE.left - 20, h: 640 };

const ResultCard: React.FC<{ name: string; info: string; btn: string; white: boolean; dim?: number; hi?: number; small?: boolean }> = ({ name, info, btn, white, dim = 0, hi = 0, small }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: G, border: `2px solid rgba(255,255,255,${0.1 + 0.45 * hi})`, boxShadow: hi ? `0 0 ${40 * hi}px rgba(255,255,255,0.12)` : undefined, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", boxSizing: "border-box", opacity: 1 - 0.6 * dim }}>
    <div>
      <div style={{ color: C.text, fontSize: 46, fontWeight: 800 }}>{name}</div>
      <div style={{ color: C.muted, fontSize: 30, marginTop: 4 }}>
        {info}
        {small ? " · loja pequena" : ""}
      </div>
    </div>
    <div style={{ padding: "20px 30px", borderRadius: 999, background: white ? C.text : G2, color: white ? "#0b0b0b" : C.text, fontSize: 34, fontWeight: 800 }}>{btn}</div>
  </div>
);

const SearchBar: React.FC<{ text: string; caret: boolean; o: number }> = ({ text, caret, o }) => (
  <div style={{ position: "absolute", left: SAFE.left + 10, width: SAFE.right - SAFE.left - 20, top: 250, height: 140, borderRadius: 44, background: G, border: "2px solid rgba(255,255,255,0.16)", display: "flex", alignItems: "center", gap: 24, padding: "0 34px", boxSizing: "border-box", opacity: o }}>
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#f2f2f2" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
    <div style={{ color: C.text, fontSize: 54, fontWeight: 700, whiteSpace: "nowrap" }}>
      {text}
      {caret && <Caret h={56} />}
    </div>
  </div>
);

const Joao: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const searchAt = cue.at("Procurou") - 0.1;
  const s = ease(now, searchAt - 0.3, searchAt + 0.1); // 0 = cena da praia; 1 = busca
  const friends = ease(now, cue.at("amigos") - 0.2, cue.at("amigos") + 0.2);
  const beach = ease(now, cue.at("praia") - 0.2, cue.at("praia") + 0.2);
  const typed = typeOut("adega perto de mim", now, cue.at("Procurou"), cue.atEnd("mim,") - 0.1);
  const r1 = pop(now, cue.atEnd("mim,") - 0.05, 0.35);
  const r2 = pop(now, cue.atEnd("mim,") + 0.15, 0.35);
  const open = ease(now, cue.at("abriu a primeira") + 0.2, cue.at("caiu") + 0.1); // resultado vira chat
  const close = ease(now, cue.at("desistiu"), cue.at("desistiu") + 0.35);
  const chatP = open * (1 - close);
  const rect = {
    x: lerp(RESULT_RECT[0].x, CHAT_RECT.x, chatP),
    y: lerp(RESULT_RECT[0].y, CHAT_RECT.y, chatP),
    w: lerp(RESULT_RECT[0].w, CHAT_RECT.w, chatP),
    h: lerp(RESULT_RECT[0].h, CHAT_RECT.h, chatP),
  };
  const thoughts = [
    { text: "O que tem?", at: cue.at("o que tinha") - 0.05, x: 330, y: 960 },
    { text: "Quanto custa?", at: cue.at("quanto custava") - 0.05, x: 420, y: 1075 },
    { text: "Entrega aqui?", at: cue.at("se entregava") - 0.05, x: 330, y: 1190 },
  ];
  const thoughtsOut = ease(now, cue.at("Começou") - 0.2, cue.at("Começou") + 0.1);
  const draft = "Oi, vocês têm gelo?";
  const wStart = cue.at("Começou") + 0.15;
  const wEnd = cue.at("aí apagou") - 0.05;
  const draftText = now < cue.at("apagou") ? typeOut(draft, now, wStart, wEnd) : draft.slice(0, Math.round(interpolate(now, [cue.at("apagou"), cue.at("apagou") + 0.45], [draft.length, 0], { extrapolateRight: "clamp" })));
  const busy = Math.sin(now * 2);
  // João: grande no início; depois menor, no canto inferior
  const jx = lerp(380, 190, s);
  const jy = lerp(1150, 1300, s);
  const js = lerp(360, 250, s);
  return (
    <AbsoluteFill>
      <BeachIcon x={lerp(760, 430, s)} y={lerp(300, 1110, s)} o={beach * lerp(1, 0.5, s)} />
      <div style={{ opacity: friends * lerp(1, 0.5, s) }}>
        <Person x={lerp(640, 800, s)} y={lerp(1160, 1300, s)} size={lerp(300, 200, s)} dim />
        <Person x={lerp(810, 900, s)} y={lerp(1170, 1305, s)} size={lerp(280, 190, s)} dim />
      </div>
      <Person x={jx} y={jy} size={js} bob={busy * 3} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, opacity: lerp(1, 0, s), transform: `translateY(${-s * 40}px)` }}>
        <div style={{ position: "absolute", top: 420, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", color: C.text, fontSize: 64, fontWeight: 800, opacity: ease(now, from + 0.2, from + 0.6) }}>
          João
        </div>
      </div>

      <SearchBar text={typed} caret={now < cue.at("abriu") && blink(now)} o={s} />

      {/* resultado 2 */}
      <div style={{ position: "absolute", left: RESULT_RECT[1].x, top: RESULT_RECT[1].y, width: RESULT_RECT[1].w, height: RESULT_RECT[1].h, opacity: r2.opacity * (1 - 0.85 * open * (1 - close)), transform: `scale(${r2.scale})` }}>
        <ResultCard name={LOJA2} info="★ 4,9 · 900 m" btn="Ver site" white small />
      </div>
      {/* resultado 1 → vira o WhatsApp */}
      <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: r1.opacity, transform: `scale(${r1.scale})` }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - chatP }}>
          <ResultCard name={LOJA1} info="★ 4,4 · 300 m" btn="WhatsApp" white={false} dim={close} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: chatP, borderRadius: 40, background: G, border: "2px solid rgba(255,255,255,0.14)", overflow: "hidden" }}>
          <div style={{ height: 130, display: "flex", alignItems: "center", gap: 20, padding: "0 30px", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: G2 }} />
            <div>
              <div style={{ color: C.text, fontSize: 42, fontWeight: 800 }}>{LOJA1}</div>
              <div style={{ color: C.muted, fontSize: 28 }}>WhatsApp</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 26, right: 26, bottom: 26 }}>
            <ChatInput text={draftText} caret={blink(now)} size={46} />
          </div>
        </div>
      </div>

      {thoughts.map((t, i) => (
        <Thought key={i} text={t.text} x={t.x} y={t.y} p={{ opacity: pop(now, t.at, 0.35).opacity * (1 - thoughtsOut), scale: pop(now, t.at, 0.35).scale }} />
      ))}
    </AbsoluteFill>
  );
};

// ——— 3. o balcão ———
const Balcao: React.FC<{ from: number; cue: Cues; buzz: number[] }> = ({ from, cue, buzz }) => {
  const { now } = useLocal(from);
  const openWa = cue.at("finalmente") - 0.1;
  const list = ease(now, openWa, openWa + 0.4);
  const responded = cue.at("respondeu");
  const preview = cue.at("já tinha pedido") - 0.1;
  const pv = ease(now, preview, preview + 0.3) * (1 - ease(now, cue.atEnd("lugar.", 0) + 0.1, cue.atEnd("lugar.", 0) + 0.45));
  const shake = buzz.some((b) => now >= b && now < b + 0.4) ? Math.sin(now * 90) * 5 : 0;
  const pills = ["Tem carvão?", "Aceita pix?"];
  const busy = Math.sin(now * 5);
  const rows = [
    { n: "Tem carvão?", at: responded },
    { n: "Aceita pix?", at: responded + 0.25 },
    { n: "Até que horas?", at: responded + 0.5 },
  ];
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - list * 0.85 }}>
        <Person x={690 + 30 * Math.sin(now * 3)} y={930} size={270} lean={busy * 5} bob={Math.abs(busy) * -5} />
        <Counter x={320} y={910} width={620} />
        <div style={{ transform: `translateX(${shake}px)` }}>
          <MiniPhone x={860} y={910 - 110} w={62} lit={buzz.some((b) => now >= b && now < b + 1.2) ? 1 : 0.2} />
        </div>
        {pills.map((p, i) => {
          const q = pop(now, buzz[i] + 0.05, 0.3);
          return (
            <div key={i} style={{ position: "absolute", left: 560, top: 540 + i * 100, opacity: q.opacity, transform: `scale(${q.scale})`, padding: "14px 26px", borderRadius: "24px 24px 24px 6px", background: G2, color: C.text, fontSize: 40, fontWeight: 700 }}>
              {p}
            </div>
          );
        })}
        {[200, 330, 450].map((x, i) => (
          <Person key={i} x={x} y={1250 - i * 6} size={240 - i * 18} dim />
        ))}
      </div>
      {/* o WhatsApp do dono: quem está ali — sem o João */}
      <div style={{ position: "absolute", left: SAFE.left + 10, width: SAFE.right - SAFE.left - 20, top: 300, opacity: list * (1 - 0.7 * pv), transform: `translateY(${(1 - list) * 40}px)` }}>
        <div style={{ borderRadius: 40, background: G, border: "2px solid rgba(255,255,255,0.12)", padding: "30px 34px" }}>
          <div style={{ color: C.text, fontSize: 46, fontWeight: 800, marginBottom: 18 }}>Conversas</div>
          {rows.map((r, i) => {
            const done = now >= r.at;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0", borderTop: "2px solid rgba(255,255,255,0.06)" }}>
                <div style={{ width: 70, height: 70, borderRadius: 35, background: G2, flexShrink: 0 }} />
                <div style={{ flex: 1, color: C.text, fontSize: 38, fontWeight: 600 }}>{r.n}</div>
                <div style={{ color: done ? C.text : C.muted, fontSize: 30, fontWeight: 700, opacity: done ? 1 : 0.5 }}>{done ? "✓✓" : "nova"}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* antecipa o cartão com check verde (revelado na próxima cena) */}
      <div style={{ position: "absolute", left: SAFE_CENTER_X - 330, top: 760, opacity: pv, transform: `scale(${0.92 + 0.08 * pv})`, filter: `blur(${(1 - pv) * 6}px)` }}>
        <OrderCard w={660} check={1} />
      </div>
    </AbsoluteFill>
  );
};

// ——— 4. a adega menor ———
const PW = 600;
const PH = 1060;
const PX = SAFE_CENTER_X - PW / 2;
const PY = 210;
const SiteBrisa: React.FC<{ now: number; cue: Cues; t: Record<string, number> }> = ({ now, cue, t }) => {
  const brand = pop(now, t.marca, 0.5);
  const priceHi = ease(now, t.precos, t.precos + 0.3) * (1 - ease(now, t.prazo - 0.1, t.prazo + 0.2));
  const prazoHi = ease(now, t.prazo, t.prazo + 0.3) * (1 - ease(now, t.add1 - 0.3, t.add1));
  const q = [now >= t.add1 + 0.05 ? 1 : 0, now >= t.add2 + 0.05 ? 1 : 0];
  const checkout = ease(now, t.add2 + 0.35, t.add2 + 0.5);
  const catOut = ease(now, t.add2 + 0.3, t.add2 + 0.4);
  const pix = now >= t.pix + 0.05;
  const tileW = (PW - 60 - 20) / 2;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0d0f12" }}>
      {/* cabeçalho: marca revelada em "marca" */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "50px 30px 0", height: 110 }}>
        <div style={{ opacity: brand.opacity, transform: `scale(${brand.scale})` }}>
          <BrisaLogo size={86} />
        </div>
        <div style={{ opacity: Math.max(0.15, brand.opacity) }}>
          <div style={{ color: C.text, fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>{LOJA2}</div>
          <div style={{ color: BR.accent, fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>ADEGA · DELIVERY</div>
        </div>
        {/* carrinho com contador 0 → 1 → 2 */}
        <div style={{ marginLeft: "auto", position: "relative", width: 86, height: 86, borderRadius: 24, background: G, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#f2f2f2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2.5l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.3" />
            <circle cx="9.5" cy="19.5" r="1.4" />
            <circle cx="17" cy="19.5" r="1.4" />
          </svg>
          <div style={{ position: "absolute", right: -10, top: -10, width: 44, height: 44, borderRadius: 22, background: q[0] + q[1] ? C.text : G2, color: q[0] + q[1] ? "#0b0b0b" : C.muted, fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.35 * (press(now, t.add1 + 0.1) + press(now, t.add2 + 0.1))})` }}>
            {q[0] + q[1]}
          </div>
        </div>
      </div>
      {/* catálogo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, bottom: 0, opacity: 1 - catOut }}>
        {ITEMS.map((it, i) => (
          <div key={i} style={{ position: "absolute", left: 30 + i * (tileW + 20), top: 0, width: tileW, height: 450, borderRadius: 32, background: G, border: `2px solid rgba(255,255,255,${q[i] ? 0.4 : 0.08})`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30, boxSizing: "border-box" }}>
            <div style={{ height: 170, display: "flex", alignItems: "center" }}>{it.icon === "bottle" ? <Bottle size={160} /> : <Cubes size={160} />}</div>
            <div style={{ color: C.text, fontSize: 32, fontWeight: 800, marginTop: 14 }}>{it.name}</div>
            <div style={{ color: C.text, fontSize: 44, fontWeight: 800, marginTop: 4, padding: "0 12px", borderRadius: 12, background: `rgba(127,211,255,${0.25 * priceHi})` }}>{brl(it.price)}</div>
            <div style={{ position: "absolute", bottom: 22, left: 18, right: 18, height: 80, borderRadius: 40, background: q[i] ? C.text : G2, color: q[i] ? "#0b0b0b" : C.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, transform: `scale(${1 - 0.06 * press(now, i ? t.add2 : t.add1)})` }}>
              {q[i] ? "✓ 1" : "+ Adicionar"}
            </div>
          </div>
        ))}
        <TapRing x={30 + tileW / 2} y={450 - 62} t={(now - t.add1) / 0.45} />
        <TapRing x={30 + tileW + 20 + tileW / 2} y={450 - 62} t={(now - t.add2) / 0.45} />
        <div style={{ position: "absolute", left: 30, right: 30, top: 480, borderRadius: 28, background: G, border: `2px solid rgba(127,211,255,${0.1 + 0.6 * prazoHi})`, padding: "24px 28px" }}>
          <div style={{ color: BR.accent, fontSize: 34, fontWeight: 800 }}>Entrega em 30–45 min</div>
          <div style={{ color: C.text, fontSize: 30, marginTop: 6 }}>até {ADDRESS}</div>
        </div>
      </div>
      {/* pagamento e confirmação */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 190, bottom: 40, opacity: checkout }}>
        <div style={{ color: C.text, fontSize: 44, fontWeight: 800 }}>Pagamento</div>
        <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
          {["Pix", "Cartão", "Dinheiro"].map((p, i) => (
            <div key={p} style={{ flex: 1, height: 96, borderRadius: 24, background: i === 0 && pix ? C.text : G, color: i === 0 && pix ? "#0b0b0b" : C.text, border: "2px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, transform: `scale(${i === 0 ? 1 - 0.06 * press(now, t.pix) : 1})` }}>
              {p}
            </div>
          ))}
        </div>
        <TapRing x={(PW - 60 - 28) / 6} y={20 + 64 + 48} t={(now - t.pix) / 0.45} />
        {(() => {
          const m = ease(now, t.confirm + 0.08, t.confirm + 0.25); // botão → check
          const draw = ease(now, t.confirm + 0.15, t.checkDone); // traço do check
          return (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, borderRadius: 60, background: m > 0.5 ? C.green : C.text, boxShadow: m > 0.5 ? `0 0 ${60 * draw}px ${C.greenGlow}` : undefined, color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontSize: 38, fontWeight: 800, transform: `scale(${1 - 0.05 * press(now, t.confirm)})` }}>
              {m <= 0.5 ? (
                <>Confirmar pedido · {brl(TOTAL)}</>
              ) : (
                <>
                  <svg width="56" height="56" viewBox="0 0 24 24">
                    <path d="M5 12.5l4.2 4.2L19 7" stroke="#062611" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" strokeDashoffset={24 * (1 - draw)} />
                  </svg>
                  <span style={{ color: "#062611" }}>Pedido confirmado</span>
                </>
              )}
            </div>
          );
        })()}
        <TapRing x={(PW - 60) / 2} y={PH - 190 - 40 - 60} t={(now - t.confirm) / 0.45} />
      </div>
    </div>
  );
};

const Menor: React.FC<{ from: number; cue: Cues; t: Record<string, number> }> = ({ from, cue, t }) => {
  const { now } = useLocal(from);
  const hi2 = ease(now, cue.at("achou") - 0.1, cue.at("achou") + 0.3);
  const openSite = ease(now, cue.at("site próprio") - 0.1, cue.at("site próprio") + 0.4);
  // depois do "confirmar": o resumo vira o cartão do pedido e desliza até o painel
  const cardShow = ease(now, t.cardOut, t.cardOut + 0.25);
  const phoneOut = ease(now, t.fly - 0.15, t.fly + 0.3);
  const fly = ease(now, t.fly, t.snap);
  const panelIn = ease(now, t.fly - 0.2, t.fly + 0.3);
  const snap = ease(now, t.snap, t.snap + 0.15);
  // retângulos
  const r2 = RESULT_RECT[1];
  const phoneRect = {
    x: lerp(r2.x, PX, openSite),
    y: lerp(r2.y, PY, openSite),
    w: lerp(r2.w, PW, openSite),
    h: lerp(r2.h, PH, openSite),
  };
  // cartão: no celular (sobre a tela) → no painel
  const cardFrom = { x: PX + 30, y: PY + 230, w: PW - 60 };
  const cardTo = { x: SAFE.left + 20, y: 430, w: SAFE.right - SAFE.left - 40 };
  const cx = lerp(cardFrom.x, cardTo.x, fly);
  const cy = lerp(cardFrom.y, cardTo.y, fly) - Math.sin(Math.PI * fly) * 60;
  const cw = lerp(cardFrom.w, cardTo.w, fly);
  const hi = {
    itens: ease(now, cue.at("os itens") - 0.05, cue.at("os itens") + 0.2) * (1 - ease(now, cue.at("o pagamento") - 0.1, cue.at("o pagamento") + 0.1)),
    pag: ease(now, cue.at("o pagamento") - 0.05, cue.at("o pagamento") + 0.2) * (1 - ease(now, cue.at("o endereço") - 0.1, cue.at("o endereço") + 0.1)),
    end: ease(now, cue.at("o endereço") - 0.05, cue.at("o endereço") + 0.2),
  };
  return (
    <AbsoluteFill>
      {/* busca com os dois resultados */}
      <div style={{ opacity: 1 - openSite }}>
        <SearchBar text="adega perto de mim" caret={false} o={1} />
        <div style={{ position: "absolute", left: RESULT_RECT[0].x, top: RESULT_RECT[0].y, width: RESULT_RECT[0].w, height: RESULT_RECT[0].h }}>
          <ResultCard name={LOJA1} info="★ 4,4 · 300 m" btn="WhatsApp" white={false} dim={1} />
        </div>
        <Person x={190} y={1300} size={250} />
      </div>
      {/* resultado 2 → site no celular */}
      <div style={{ position: "absolute", left: phoneRect.x, top: phoneRect.y, width: phoneRect.w, height: phoneRect.h, opacity: 1 - phoneOut, transform: `scale(${1 - 0.08 * phoneOut})` }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - openSite }}>
          <ResultCard name={LOJA2} info="★ 4,9 · 900 m" btn="Ver site" white hi={hi2} small />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: openSite }}>
          <PhoneFrame x={0} y={0} w={phoneRect.w} h={phoneRect.h}>
            <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, transform: `scale(${phoneRect.w / PW})`, transformOrigin: "0 0" }}>
              <SiteBrisa now={now} cue={cue} t={t} />
            </div>
          </PhoneFrame>
        </div>
      </div>
      {/* painel do dono */}
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 230, height: 1080, opacity: panelIn, borderRadius: 44, background: "#0e0e10", border: "3px solid #2c2c2e", transform: `translateX(${(1 - panelIn) * 80}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "40px 40px 0" }}>
          <BrisaLogo size={70} />
          <div>
            <div style={{ color: C.text, fontSize: 46, fontWeight: 800 }}>Painel</div>
            <div style={{ color: C.muted, fontSize: 26 }}>{LOJA2} · pedidos</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 40, top: 150, display: "flex", alignItems: "center", gap: 14, color: snap > 0.5 ? C.green : C.muted, fontSize: 36, fontWeight: 800 }}>
          <Dot color={snap > 0.5 ? C.green : "#444"} size={22} />
          Novo pedido
        </div>
        <div style={{ position: "absolute", left: 20, right: 20, top: 200, height: 640, borderRadius: 40, border: `3px dashed rgba(255,255,255,${0.15 * (1 - snap)})` }} />
        {["#0419 · entregue", "#0418 · entregue"].map((r, i) => (
          <div key={i} style={{ position: "absolute", left: 30, right: 30, top: 870 + i * 92, height: 76, borderRadius: 20, background: G, color: C.muted, fontSize: 30, display: "flex", alignItems: "center", padding: "0 24px" }}>
            Pedido {r}
          </div>
        ))}
      </div>
      {/* O MESMO cartão: celular → painel */}
      <div style={{ position: "absolute", left: cx, top: cy, opacity: cardShow }}>
        <OrderCard w={cw} check={1} hi={hi} />
      </div>
    </AbsoluteFill>
  );
};

// ——— 5. a conta ———
const Cal: React.FC<{ n: number; filled: number; top: number; cols: number; cell?: number }> = ({ n, filled, top, cols, cell = 120 }) => {
  const gap = 16;
  const w = cols * cell + (cols - 1) * gap;
  return (
    <div style={{ position: "absolute", left: SAFE_CENTER_X - w / 2, top, width: w, display: "flex", flexWrap: "wrap", gap }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ width: cell, height: cell * 0.78, borderRadius: 18, background: i < filled ? "linear-gradient(180deg,#fff,#d6d6d6)" : G, border: "2px solid rgba(255,255,255,0.08)", boxShadow: i < filled ? "0 0 20px rgba(255,255,255,0.25)" : undefined, color: i < filled ? "#111" : "#555", fontSize: 24, fontWeight: 800, padding: "8px 12px", boxSizing: "border-box" }}>
          {i + 1}
        </div>
      ))}
    </div>
  );
};

const Conta: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const two = cue.at("dois pedidos");
  const perDay1 = cue.at("120");
  const toCell1 = cue.at("Em 15") - 0.35;
  const fill1A = cue.at("15 dias");
  const fill1B = cue.at("1.800") - 0.15;
  const res1 = cue.at("1.800");
  const scen2 = cue.at("escaparem") - 0.1;
  const fill2A = cue.at("durante") + 0.05;
  const fill2B = cue.at("3.600", 1) - 0.15;
  const res2 = cue.at("3.600", 1);
  const caixa = cue.at("quando tu fecha") - 0.15;
  const caixaP = ease(now, caixa, caixa + 0.4);
  const scen2P = ease(now, scen2, scen2 + 0.35);

  // cenário 1
  const c1 = pop(now, from + 0.15, 0.4);
  const c2 = ease(now, two - 0.05, two + 0.35);
  const perDay = pop(now, perDay1 - 0.05, 0.35);
  const cellP = ease(now, toCell1, toCell1 + 0.5);
  const filled1 = Math.round(interpolate(now, [fill1A, fill1B], [1, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const r1 = pop(now, res1 - 0.05, 0.45);
  // cenário 2
  const filled2 = Math.round(interpolate(now, [fill2A, fill2B], [1, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const r2 = pop(now, res2 - 0.05, 0.45);
  const three = ease(now, scen2 + 0.2, scen2 + 0.6);
  const perDay2 = pop(now, cue.at("3 por dia") + 0.1, 0.35);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 210, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", color: C.muted, fontSize: 34, fontWeight: 700, letterSpacing: 2, opacity: ease(now, two - 0.3, two) * (1 - caixaP) }}>
        SIMULAÇÃO DE VENDAS PERDIDAS
      </div>

      {/* ——— cenário 1 ——— */}
      <div style={{ opacity: (1 - scen2P) * (1 - caixaP) }}>
        {/* cartões de R$ 60 → célula do calendário */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - cellP }}>
          <div style={{ position: "absolute", left: lerp(SAFE_CENTER_X - 160, SAFE_CENTER_X - 340, c2), top: 420, opacity: c1.opacity, transform: `scale(${c1.scale})` }}>
            <MiniOrder w={320} />
          </div>
          <div style={{ position: "absolute", left: SAFE_CENTER_X + 20, top: 420, opacity: c2, transform: `translateX(${(1 - c2) * 120}px)` }}>
            <MiniOrder w={320} />
          </div>
          <div style={{ position: "absolute", top: 660, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", opacity: perDay.opacity, transform: `scale(${perDay.scale})`, color: C.text, fontSize: 84, fontWeight: 800 }}>R$ 120 por dia</div>
        </div>
        <div style={{ opacity: cellP }}>
          <div style={{ position: "absolute", top: 300, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", color: C.text, fontSize: 44, fontWeight: 700 }}>2 pedidos × R$ 60 · 15 dias</div>
          <Cal n={15} filled={filled1} top={400} cols={5} />
        </div>
        <div style={{ position: "absolute", top: 770, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", opacity: r1.opacity, transform: `scale(${r1.scale})` }}>
          <div style={{ color: C.green, fontSize: 190, fontWeight: 800, letterSpacing: -7, textShadow: `0 0 60px ${C.greenGlow}` }}>R$ 1.800</div>
          <div style={{ color: C.text, fontSize: 40, fontWeight: 600 }}>em 15 dias de temporada</div>
        </div>
      </div>

      {/* resultado 1 fica visível em cima no cenário 2 */}
      <div style={{ position: "absolute", top: 280, left: SAFE.left + 20, width: SAFE.right - SAFE.left - 40, opacity: scen2P * (1 - caixaP), display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 30px", boxSizing: "border-box", borderRadius: 26, background: G }}>
        <span style={{ color: C.muted, fontSize: 32, fontWeight: 600 }}>2 por dia · 15 dias</span>
        <span style={{ color: C.green, fontSize: 52, fontWeight: 800 }}>R$ 1.800</span>
      </div>

      {/* ——— cenário 2 ——— */}
      <div style={{ opacity: scen2P * (1 - caixaP) }}>
        <div style={{ position: "absolute", top: 420, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", color: C.text, fontSize: 44, fontWeight: 700, opacity: three }}>
          3 pedidos × R$ 60 · 20 dias
        </div>
        <div style={{ position: "absolute", top: 480, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", opacity: perDay2.opacity, color: C.muted, fontSize: 36, fontWeight: 700 }}>R$ 180 por dia</div>
        <Cal n={20} filled={filled2} top={550} cols={5} cell={108} />
        <div style={{ position: "absolute", top: 1010, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", opacity: r2.opacity, transform: `scale(${r2.scale})` }}>
          <div style={{ color: C.green, fontSize: 170, fontWeight: 800, letterSpacing: -6, lineHeight: 1, textShadow: `0 0 60px ${C.greenGlow}` }}>R$ 3.600</div>
          <div style={{ color: C.text, fontSize: 38, fontWeight: 600, marginTop: 8 }}>em 20 dias de temporada</div>
        </div>
      </div>

      {/* ——— fechamento do caixa: as vendas perdidas somem antes de entrar ——— */}
      <Fechamento now={now} at={caixa} p={caixaP} />
    </AbsoluteFill>
  );
};

const Fechamento: React.FC<{ now: number; at: number; p: number }> = ({ now, at, p }) => {
  const sales = ["Venda · R$ 48,00", "Venda · R$ 75,50", "Venda · R$ 32,00", "Venda · R$ 60,00"];
  return (
    <div style={{ opacity: p }}>
      <div style={{ position: "absolute", left: SAFE.left + 10, width: SAFE.right - SAFE.left - 20, top: 520, borderRadius: 40, background: G, border: "2px solid rgba(255,255,255,0.12)", padding: "32px 36px", boxSizing: "border-box" }}>
        <div style={{ color: C.text, fontSize: 46, fontWeight: 800 }}>Fechamento do caixa</div>
        {sales.map((s, i) => (
          <div key={i} style={{ color: C.text, fontSize: 38, fontWeight: 600, padding: "16px 0", borderTop: "2px solid rgba(255,255,255,0.06)", marginTop: i ? 0 : 16 }}>
            {s}
          </div>
        ))}
      </div>
      {/* pedidos que escaparam: vão em direção à lista e somem antes de entrar */}
      {[0, 1, 2].map((i) => {
        const a = at + 0.5 + i * 0.25;
        const move = ease(now, a, a + 0.7);
        const gone = ease(now, a + 0.45, a + 0.8);
        return (
          <div key={i} style={{ position: "absolute", left: 140 + i * 280, top: lerp(260, 420, move), opacity: (1 - gone) * ease(now, at + 0.2, at + 0.45), transform: `scale(${1 - 0.3 * gone})` }}>
            <MiniOrder w={240} ghost />
          </div>
        );
      })}
    </div>
  );
};

// ——— 6. o pitch ———
const Pitch: React.FC<{ from: number; cue: Cues; t: Record<string, number> }> = ({ from, cue, t }) => {
  const { now } = useLocal(from);
  const cta = pop(now, t.cta, 0.5);
  const clear = ease(now, t.cta - 0.2, t.cta + 0.3);
  const buy = cue.at("consiga comprar");
  const fly = ease(now, t.pitchFly, t.pitchSnap);
  const snap = ease(now, t.pitchSnap, t.pitchSnap + 0.15);
  const busy = Math.sin(now * 5);
  const cardFrom = { x: 650, y: 330, w: 300 };
  const cardTo = { x: 130, y: 340, w: 400 };
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - 0.85 * clear, filter: `blur(${clear * 4}px)` }}>
        {/* dono atendendo no balcão */}
        <Person x={360 + 20 * Math.sin(now * 3)} y={1180} size={230} lean={busy * 4} />
        <Counter x={130} y={1160} width={460} />
        <Person x={220} y={1310} size={180} dim />
        {/* painel da loja */}
        <div style={{ position: "absolute", left: 100, top: 250, width: 460, height: 600, borderRadius: 34, background: "#0e0e10", border: "3px solid #2c2c2e", opacity: ease(now, from + 0.2, from + 0.5) }}>
          <div style={{ color: C.text, fontSize: 34, fontWeight: 800, padding: "22px 28px" }}>Painel</div>
        </div>
        {/* outro cliente comprando pelo site */}
        <div style={{ position: "absolute", left: 610, top: 250, opacity: ease(now, buy - 0.3, buy) }}>
          <PhoneFrame x={0} y={0} w={330} h={580}>
            <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, transform: `scale(${330 / PW})`, transformOrigin: "0 0" }}>
              <SiteBrisa now={0} cue={cue} t={{ marca: -10, precos: 9e9, prazo: 9e9, add1: -10, add2: 9e9, pix: 9e9, confirm: 9e9, checkDone: 9.1e9 }} />
            </div>
          </PhoneFrame>
          <Person x={420} y={760} size={200} />
        </div>
        <div style={{ position: "absolute", left: lerp(cardFrom.x, cardTo.x, fly), top: lerp(cardFrom.y, cardTo.y, fly) - Math.sin(Math.PI * fly) * 80, opacity: ease(now, t.pitchFly - 0.2, t.pitchFly) }}>
          <OrderCard w={lerp(cardFrom.w, cardTo.w, fly)} check={snap} />
        </div>
      </div>
      {/* chamada final */}
      <div style={{ position: "absolute", top: 640, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity: cta.opacity, transform: `scale(${cta.scale})` }}>
        <div style={{ padding: "40px 54px", borderRadius: 50, background: C.text, color: "#0b0b0b", fontSize: 100, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02, textAlign: "center", boxShadow: "0 0 90px rgba(255,255,255,0.2)" }}>
          Me chama aqui
          <br />
          no TikTok
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep06AntesDoOi: React.FC<EpisodeProps> = ({ episode, timings, stem }) => {
  const cue = makeCues(timings);
  const end = episode.durationSec;

  const t = {
    marca: cue.at("marca,"),
    precos: cue.at("os preços"),
    prazo: cue.at("prazo"),
    add1: cue.at("a bebida", 1),
    add2: cue.at("gelo", 1),
    pix: cue.atEnd("gelo", 1) + 0.25,
    confirm: cue.at("dois minutos"),
    checkDone: cue.at("dois minutos") + 0.45, // check verde completo no celular → "tim-tim"
    cardOut: cue.at("dois minutos") + 0.75,
    fly: Math.max(cue.at("dois minutos") + 1.1, cue.at("o pedido já")),
    snap: cue.at("painel do dono"), // encaixa sob "Novo pedido" → "ding"
    openSite: cue.at("site próprio") - 0.1,
    openChat: cue.at("abriu a primeira") + 0.2,
    pitchFly: cue.at("cada pedido") - 0.1,
    pitchSnap: cue.at("organizado no painel") + 0.6,
    cta: cue.at("Me chama"),
  };
  const s2 = cue.at("O João") - 0.35;
  const s3 = cue.at("Enquanto isso") - 0.1;
  const s4 = cue.at("João foi procurar") - 0.2;
  const s5 = cue.at("Agora faz") - 0.25;
  const s6 = cue.at("Quer que") - 0.1;
  const buzz = [cue.at("gente na fila") + 0.1, cue.at("mensagem pra") - 0.2];

  // ——— efeitos sonoros (cada um preso a uma ação visível) ———
  const oi = cue.at("oi");
  const spread = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / Math.max(1, n - 1));
  const typeSearchA = cue.at("Procurou");
  const typeSearchB = cue.atEnd("mim,") - 0.1;
  const draftA = cue.at("Começou") + 0.15;
  const draftB = cue.at("aí apagou") - 0.05;
  const delA = cue.at("apagou");
  const fill1A = cue.at("15 dias");
  const fill1B = cue.at("1.800") - 0.15;
  const fill2A = cue.at("durante") + 0.05;
  const fill2B = cue.at("3.600", 1) - 0.15;
  const sfx: { name: string; at: number; vol: number }[] = [
    // 1. abertura: "O", "Oi" → apaga na palavra "oi" (depois, silêncio)
    { name: "key", at: 0.22, vol: 0.55 },
    { name: "key", at: 0.47, vol: 0.55 },
    { name: "backspace", at: oi, vol: 0.5 },
    // busca: digitação rápida + clique seco ao abrir o 1º resultado (abre a conversa)
    ...spread(typeSearchA, typeSearchB, 18).map((at) => ({ name: "key", at, vol: 0.22 })),
    { name: "click", at: t.openChat, vol: 0.55 },
    // 2. WhatsApp: teclado leve escrevendo; apagar junto com as letras sumindo
    ...spread(draftA, draftB, 12).map((at) => ({ name: "key", at, vol: 0.16 })),
    ...spread(delA, delA + 0.4, 6).map((at) => ({ name: "backspace", at, vol: 0.22 })),
    // balcão: duas vibrações curtas (outras conversas)
    ...buzz.map((at) => ({ name: "buzz", at, vol: 0.32 })),
    // 3. site e carrinho
    { name: "click", at: t.openSite, vol: 0.5 },
    { name: "pop", at: t.add1 + 0.05, vol: 0.5 }, // contador 0 → 1
    { name: "pop", at: t.add2 + 0.05, vol: 0.5 }, // contador 1 → 2
    { name: "tap", at: t.pix, vol: 0.18 },
    { name: "click_firm", at: t.confirm, vol: 0.55 },
    // 4. confirmação: tim-tim no celular; ding (outro timbre) no painel
    { name: "timtim", at: t.checkDone, vol: 0.55 },
    { name: "ding_panel", at: t.snap, vol: 0.55 },
    // 5. conta: poucos tics no calendário + batida grave em cada resultado
    ...spread(fill1A, fill1B, 3).map((at) => ({ name: "tick", at, vol: 0.18 })),
    { name: "hit", at: cue.at("1.800"), vol: 0.45 },
    ...spread(fill2A, fill2B, 3).map((at) => ({ name: "tick", at, vol: 0.18 })),
    { name: "hit", at: cue.at("3.600", 1), vol: 0.5 },
    // 6. chamada final
    { name: "soft", at: t.cta, vol: 0.4 },
  ];
  // trilha baixa: entra depois do campo vazio, abaixa sob as frases importantes,
  // quase some na confirmação e some em "essas vendas não aparecem em lugar nenhum"
  const silentA = cue.at("essas vendas") - 0.2;
  const silentB = cue.atEnd("nenhum.") + 0.3;
  const bedVolume = (sec: number) => {
    const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
    const base = interpolate(sec, [oi + 0.7, oi + 1.8, end - 1.5, end], [0, 0.09, 0.09, 0], clamp);
    const dip = (a: number, b: number, to: number) => {
      const x = interpolate(sec, [a - 0.4, a, b, b + 0.4], [0, 1, 1, 0], clamp);
      return 1 - (1 - to) * x;
    };
    return (
      base *
      dip(cue.at("R$"), cue.atEnd("3.600"), 0.5) *
      dip(t.confirm - 0.4, t.snap + 1.0, 0.25) *
      dip(cue.at("Se tu perder"), cue.atEnd("3.600", 1), 0.55) *
      dip(silentA, silentB, 0)
    );
  };

  return (
    <AbsoluteFill>
      <Background />
      <Scene from={0} to={s2} fadeIn={0} fadeOut={0.15}>
        <Gancho from={0} cue={cue} />
      </Scene>
      <Scene from={s2} to={s3} fadeIn={0.15} fadeOut={0.12}>
        <Joao from={s2} cue={cue} />
      </Scene>
      <Scene from={s3} to={s4} fadeIn={0.12} fadeOut={0.15}>
        <Balcao from={s3} cue={cue} buzz={buzz} />
      </Scene>
      <Scene from={s4} to={s5} fadeIn={0.15} fadeOut={0.15}>
        <Menor from={s4} cue={cue} t={t} />
      </Scene>
      <Scene from={s5} to={s6} fadeIn={0.15} fadeOut={0.15}>
        <Conta from={s5} cue={cue} />
      </Scene>
      <Scene from={s6} to={end} fadeIn={0.15} fadeOut={0}>
        <Pitch from={s6} cue={cue} t={t} />
      </Scene>

      <Captions timings={timings} replace={episode.captionReplace} backdrop y={1395} size={56} maxChars={34} maxWords={7} />

      {/* voz em primeiro plano; sons só nas ações que contam a história */}
      <Audio src={staticFile(`episodes/${episode.id}/voice.wav`)} volume={stem === "sfx" ? 0 : 1} />
      {stem !== "sfx" && <Audio src={staticFile("sfx/bed_soft.wav")} volume={(f) => bedVolume(f / 30)} />}
      {sfx.map((x, i) => (
        <Sfx key={i} name={x.name} at={x.at} volume={x.vol} />
      ))}
    </AbsoluteFill>
  );
};
