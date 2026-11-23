import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { Background, Scene, Sfx, pop, progress, useLocal } from "../components/Base";
import { Camera, CamKey } from "../components/Camera";
import { Captions } from "../components/Captions";
import { brl } from "../components/Catalog";
import { Counter, Person } from "../components/Figures";
import { PhoneFrame } from "../components/Panels";
import { Dot, TapRing } from "../components/Ui";
import { Cues, EpisodeProps, makeCues } from "../lib/timing";
import { C, SAFE, SAFE_CENTER_X } from "../theme";

// ——— dados fictícios ———
const LOJA1 = "Adega Maré Alta";
const LOJA2 = "Adega do Litoral";
const ADDRESS = "Rua das Gaivotas, 88";
const BAIRRO = "Pitangueiras";
const ITEMS = [
  { name: "Combo Réveillon", price: 89.9, icon: "bottle" as const },
  { name: "Gelo 5 kg", price: 12.0, icon: "ice" as const },
];
const TOTAL = ITEMS.reduce((s, i) => s + i.price, 0);
const G = "#1c1c1e"; // grafite
const G2 = "#2a2a2d";

const press = (now: number, at: number) => progress(now, at - 0.05, at + 0.08) * (1 - progress(now, at + 0.12, at + 0.3));
const Tap: React.FC<{ x: number; y: number; at: number; now: number }> = ({ x, y, at, now }) => <TapRing x={x} y={y} t={(now - at) / 0.45} />;
const typeOut = (text: string, now: number, a: number, b: number) =>
  text.slice(0, Math.round(interpolate(now, [a, b], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

// ícones brancos (garrafa e cubos de gelo)
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
const Cart: React.FC<{ size: number; color?: string }> = ({ size, color = "#f2f2f2" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h2.5l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.3" />
    <circle cx="9.5" cy="19.5" r="1.4" />
    <circle cx="17" cy="19.5" r="1.4" />
  </svg>
);
const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5l4.2 4.2L19 7" stroke="#062611" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ——— cenas ———
const SearchBar: React.FC<{ text: string; caret: boolean; x: number; y: number; w: number }> = ({ text, caret, x, y, w }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 128, borderRadius: 40, background: G, border: "2px solid rgba(255,255,255,0.16)", display: "flex", alignItems: "center", gap: 22, padding: "0 30px", boxSizing: "border-box", boxShadow: "0 0 50px rgba(255,255,255,0.06)" }}>
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#f2f2f2" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
    <div style={{ width: 2, height: 54, background: "rgba(255,255,255,0.25)" }} />
    <div style={{ color: C.text, fontSize: 48, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: -0.5 }}>
      {text}
      {caret && <span style={{ display: "inline-block", width: 3, height: 50, background: C.text, marginLeft: 4, verticalAlign: "middle" }} />}
    </div>
  </div>
);

const Result: React.FC<{ y: number; name: string; info: string; btn: string; white: boolean; o: number; s: number; dim?: number; pressed?: number }> = ({ y, name, info, btn, white, o, s, dim = 0, pressed = 0 }) => (
  <div style={{ position: "absolute", left: SAFE.left + 10, width: SAFE.right - SAFE.left - 20, top: y, height: 190, borderRadius: 34, background: G, border: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", boxSizing: "border-box", opacity: o * (1 - 0.55 * dim), transform: `scale(${s})` }}>
    <div>
      <div style={{ color: C.text, fontSize: 46, fontWeight: 800, letterSpacing: -0.5 }}>{name}</div>
      <div style={{ color: C.muted, fontSize: 30, marginTop: 6 }}>{info}</div>
    </div>
    <div style={{ padding: "22px 30px", borderRadius: 999, background: white ? C.text : G2, color: white ? "#0b0b0b" : C.text, fontSize: 34, fontWeight: 800, whiteSpace: "nowrap", transform: `scale(${1 - 0.06 * pressed})` }}>{btn}</div>
  </div>
);

const Busca: React.FC<{ from: number; cue: Cues; t: Record<string, number> }> = ({ from, cue, t }) => {
  const { now } = useLocal(from);
  const hook = pop(now, 0.05, 0.5);
  const joao = pop(now, cue.word("joao", "João.") - 0.15, 0.4);
  const bar = progress(now, cue.word("joao", "João.") + 0.1, cue.word("joao", "João.") + 0.4);
  const typed = typeOut("Adega perto de mim", now, t.typeA, t.typeB);
  const r1 = pop(now, t.results, 0.4);
  const r2 = pop(now, t.results + 0.25, 0.4);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: "center", color: C.text, fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.08, opacity: hook.opacity, transform: `scale(${hook.scale})` }}>
        Essa adega perdeu um pedido antes do “oi”
      </div>
      <div style={{ opacity: joao.opacity, transform: `scale(${joao.scale})`, transformOrigin: "190px 800px" }}>
        <Person x={190} y={810} size={300} />
      </div>
      <div style={{ opacity: bar, transform: `translateX(${(1 - bar) * 30}px)` }}>
        <SearchBar text={typed} caret={now < t.typeB + 0.4 && Math.floor(now * 3) % 2 === 0} x={300} y={600} w={SAFE.right - 300} />
      </div>
      <Result y={880} name={LOJA1} info="★ 4,5 · 400 m" btn="WhatsApp" white={false} o={r1.opacity} s={r1.scale} />
      <Result y={1100} name={LOJA2} info="★ 4,8 · 700 m" btn="Ver site" white o={r2.opacity} s={r2.scale} />
    </AbsoluteFill>
  );
};

const WhatsChat: React.FC<{ from: number; t: Record<string, number> }> = ({ from, t }) => {
  const { now } = useLocal(from);
  const msg = "Tem gelo?";
  const typed = now < t.delA ? typeOut(msg, now, t.typeMsgA, t.typeMsgB) : msg.slice(0, Math.round(interpolate(now, [t.delA, t.delB], [msg.length, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const inCard = pop(now, from + 0.05, 0.4);
  const closing = progress(now, t.closeWa + 0.1, t.closeWa + 0.35);
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - closing }}>
        <Person x={200} y={980} size={300} />
        <div style={{ position: "absolute", left: 330, top: 470, width: SAFE.right - 330, height: 620, borderRadius: 40, background: G, border: "2px solid rgba(255,255,255,0.12)", opacity: inCard.opacity, transform: `scale(${inCard.scale})`, overflow: "hidden" }}>
          <div style={{ height: 120, display: "flex", alignItems: "center", gap: 18, padding: "0 28px", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
            <div style={{ color: C.text, fontSize: 60, fontWeight: 300, transform: `scale(${1 + 0.3 * press(now, t.closeWa)})` }}>‹</div>
            <div style={{ width: 62, height: 62, borderRadius: 31, background: G2 }} />
            <div>
              <div style={{ color: C.text, fontSize: 36, fontWeight: 800 }}>{LOJA1}</div>
              <div style={{ color: C.muted, fontSize: 24 }}>WhatsApp</div>
            </div>
          </div>
          <div style={{ padding: 30, color: C.muted, fontSize: 28, textAlign: "center" }}>Nenhuma mensagem ainda</div>
          {/* campo de digitação */}
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 26, height: 110, borderRadius: 55, background: G2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px 0 34px" }}>
            <div style={{ color: typed ? C.text : C.muted, fontSize: 50, fontWeight: 700 }}>
              {typed || "Mensagem"}
              {now > t.typeMsgA - 0.2 && now < t.delB + 0.3 && Math.floor(now * 3) % 2 === 0 && <span style={{ display: "inline-block", width: 3, height: 48, background: C.text, marginLeft: 4, verticalAlign: "middle" }} />}
            </div>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: typed ? "#e6e6e6" : "#3a3a3d", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill={typed ? "#111" : "#777"}>
                <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
              </svg>
            </div>
          </div>
          {/* apagando */}
          {now >= t.delA && now < t.delB + 0.3 && (
            <div style={{ position: "absolute", right: 120, bottom: 150, padding: "8px 18px", borderRadius: 14, background: "#3a3a3d", color: C.text, fontSize: 28, fontWeight: 800 }}>⌫</div>
          )}
          <TapRing x={46} y={60} t={(now - t.closeWa) / 0.45} />
        </div>
      </div>
      {/* volta pra busca e escolhe o site */}
      <div style={{ opacity: closing }}>
        <Person x={190} y={810} size={300} />
        <SearchBar text="Adega perto de mim" caret={false} x={300} y={600} w={SAFE.right - 300} />
        <Result y={880} name={LOJA1} info="★ 4,5 · 400 m" btn="WhatsApp" white={false} o={1} s={1} dim={1} />
        <Result y={1100} name={LOJA2} info="★ 4,8 · 700 m" btn="Ver site" white o={1} s={1} pressed={press(now, t.tapSite)} />
        <TapRing x={SAFE.right - 140} y={1195} t={(now - t.tapSite) / 0.45} />
      </div>
    </AbsoluteFill>
  );
};

const DonoFila: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const { now } = useLocal(from);
  const msgs = ["Tem gelo?", "Qual o valor?", "Entrega aqui?", "Aceita pix?", "Oi??"];
  const count = Math.round(interpolate(now, [from, to], [4, 15], { extrapolateRight: "clamp" }));
  const busy = Math.sin(now * 7);
  return (
    <AbsoluteFill>
      {msgs.map((m, i) => {
        const p = pop(now, from + 0.1 + i * 0.28, 0.3);
        return (
          <div key={i} style={{ position: "absolute", left: i % 2 ? 520 : 140, top: 250 + i * 105, opacity: p.opacity, transform: `scale(${p.scale})`, padding: "16px 28px", borderRadius: "26px 26px 26px 8px", background: G2, color: C.text, fontSize: 42, fontWeight: 700 }}>
            {m}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: SAFE.right - 170, top: 230, padding: "10px 24px", borderRadius: 999, background: C.text, color: "#0b0b0b", fontSize: 40, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{count}</div>
      <Person x={720 + 30 * Math.sin(now * 4)} y={1010} size={260} lean={busy * 5} />
      <Counter x={480} y={990} width={460} />
      {[200, 330, 450].map((x, i) => (
        <Person key={i} x={x} y={1290 - i * 8} size={230 - i * 20} dim />
      ))}
    </AbsoluteFill>
  );
};

/** Site da Adega do Litoral (tela lógica 560×1000). */
const SW = 560;
const SH = 1000;
const LitoralSite: React.FC<{ now: number; t: Record<string, number> }> = ({ now, t }) => {
  const q = [now >= t.add1 + 0.05 ? 1 : 0, now >= t.add2 + 0.05 ? 1 : 0];
  const total = ITEMS.reduce((s, it, i) => s + it.price * q[i], 0);
  const n = q[0] + q[1];
  const checkout = progress(now, t.cart + 0.1, t.cart + 0.4);
  const done = progress(now, t.confirm + 0.1, t.confirm + 0.35);
  const priceHi = progress(now, t.prices, t.prices + 0.25) * (1 - progress(now, t.prices + 1.2, t.prices + 1.5));
  const typed = typeOut(ADDRESS, now, t.addrA, t.addrB);
  const tileW = (SW - 60 - 20) / 2;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0e0e10" }}>
      {/* catálogo */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - checkout }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "54px 30px 0" }}>
          <Bottle size={64} />
          <div style={{ width: 2, height: 48, background: "rgba(255,255,255,0.25)" }} />
          <div style={{ color: C.text, fontSize: 38, fontWeight: 800, letterSpacing: -1, flex: 1 }}>{LOJA2}</div>
          <div style={{ position: "relative" }}>
            <Cart size={52} />
            {n > 0 && <div style={{ position: "absolute", right: -8, top: -8, width: 30, height: 30, borderRadius: 15, background: C.text, color: "#0b0b0b", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>}
          </div>
        </div>
        <div style={{ padding: "26px 30px 0", color: C.muted, fontSize: 26, fontWeight: 600 }}>Entrega no Guarujá</div>
        {ITEMS.map((it, i) => (
          <div key={i} style={{ position: "absolute", left: 30 + i * (tileW + 20), top: 220, width: tileW, height: 470, borderRadius: 32, background: G, border: `2px solid rgba(255,255,255,${q[i] ? 0.35 : 0.08})`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 34, boxSizing: "border-box" }}>
            <div style={{ height: 170, display: "flex", alignItems: "center" }}>{it.icon === "bottle" ? <Bottle size={150} /> : <Cubes size={150} />}</div>
            <div style={{ color: C.text, fontSize: 30, fontWeight: 800, marginTop: 18, textAlign: "center" }}>{it.name}</div>
            <div style={{ color: C.text, fontSize: 36, fontWeight: 800, marginTop: 6, padding: "0 10px", borderRadius: 10, background: `rgba(255,255,255,${0.14 * priceHi})` }}>{brl(it.price)}</div>
            <div style={{ position: "absolute", bottom: 24, left: 18, right: 18, height: 74, borderRadius: 37, background: G2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", color: C.text, fontSize: 40, fontWeight: 700 }}>
              <span>−</span>
              <span>{q[i]}</span>
              <span style={{ display: "inline-block", transform: `scale(${1 + 0.4 * press(now, i === 0 ? t.add1 : t.add2)})` }}>+</span>
            </div>
          </div>
        ))}
        <Tap x={30 + tileW - 18 - 40} y={220 + 470 - 24 - 37} at={t.add1} now={now} />
        <Tap x={30 + tileW + 20 + tileW - 18 - 40} y={220 + 470 - 24 - 37} at={t.add2} now={now} />
        <div style={{ position: "absolute", left: 30, right: 30, top: 730, height: 110, borderRadius: 55, background: n ? C.text : G, color: n ? "#0b0b0b" : C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontSize: 36, fontWeight: 800, transform: `scale(${1 - 0.05 * press(now, t.cart)})` }}>
          <Cart size={46} color={n ? "#0b0b0b" : "#888"} />
          {n ? `Ver carrinho · ${brl(total)}` : ""}
        </div>
        <Tap x={SW / 2} y={785} at={t.cart} now={now} />
      </div>

      {/* endereço e confirmação */}
      <div style={{ position: "absolute", inset: 0, opacity: checkout * (1 - done), padding: "54px 30px" }}>
        <div style={{ color: C.text, fontSize: 46, fontWeight: 800 }}>Entrega</div>
        <div style={{ color: C.muted, fontSize: 26, marginTop: 26 }}>Endereço</div>
        <div style={{ marginTop: 10, height: 96, borderRadius: 26, background: G, border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", padding: "0 26px", color: C.text, fontSize: 36, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden" }}>
          {typed}
          {now < t.addrB + 0.3 && Math.floor(now * 3) % 2 === 0 && <span style={{ width: 3, height: 40, background: C.text, marginLeft: 3 }} />}
        </div>
        <div style={{ color: C.muted, fontSize: 26, marginTop: 22 }}>Bairro</div>
        <div style={{ marginTop: 10, height: 96, borderRadius: 26, background: G, display: "flex", alignItems: "center", padding: "0 26px", color: C.text, fontSize: 36, fontWeight: 700 }}>{now >= t.addrB ? BAIRRO : ""}</div>
        <div style={{ marginTop: 30, borderRadius: 26, background: G, padding: "20px 26px" }}>
          {ITEMS.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 30, lineHeight: 1.6 }}>
              <span>1× {it.name}</span>
              <span>{brl(it.price)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 34, fontWeight: 800, marginTop: 6 }}>
            <span>Total</span>
            <span>{brl(TOTAL)}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 50, height: 116, borderRadius: 58, background: C.text, color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800, transform: `scale(${1 - 0.05 * press(now, t.confirm)})` }}>Confirmar pedido</div>
        <Tap x={SW / 2} y={SH - 108} at={t.confirm} now={now} />
      </div>

      {/* pedido confirmado */}
      <div style={{ position: "absolute", inset: 0, opacity: done, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 }}>
        <div style={{ width: 200, height: 200, borderRadius: 100, background: C.green, boxShadow: `0 0 80px ${C.greenGlow}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.6 + 0.4 * done})` }}>
          <Check size={110} />
        </div>
        <div style={{ color: C.text, fontSize: 54, fontWeight: 800, letterSpacing: -1 }}>Pedido confirmado</div>
        <div style={{ color: C.muted, fontSize: 30 }}>
          {LOJA2} · {brl(TOTAL)}
        </div>
      </div>
    </div>
  );
};

const PW = 560;
const PH = 1000;
const Site: React.FC<{ from: number; t: Record<string, number> }> = ({ from, t }) => {
  const { now } = useLocal(from);
  const inP = progress(now, from, from + 0.35);
  const cx = SAFE_CENTER_X;
  const cy = 250 + PH / 2;
  const C0 = { s: 1, x: PW / 2, y: PH / 2 };
  const sx = PW / SW;
  const keys: CamKey[] = [
    { t: from, ...C0 },
    { t: t.add1 - 0.5, s: 1.12, x: PW / 2, y: 500 * sx },
    { t: t.cart + 0.2, s: 1.12, x: PW / 2, y: 560 * sx },
    { t: t.cart + 0.5, ...C0 },
    { t: t.addrA - 0.1, s: 1.15, x: PW / 2, y: 470 },
    { t: t.addrB + 0.4, s: 1.15, x: PW / 2, y: 480 },
    { t: t.confirm - 0.3, s: 1.12, x: PW / 2, y: 640 },
    { t: t.confirm + 0.3, ...C0 },
  ];
  return (
    <AbsoluteFill style={{ opacity: inP }}>
      <Camera keys={keys} now={now} cx={cx} cy={cy} w={PW} h={PH}>
        <PhoneFrame x={0} y={0} w={PW} h={PH}>
          <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transform: `scale(${sx})`, transformOrigin: "0 0" }}>
            <LitoralSite now={now} t={t} />
          </div>
        </PhoneFrame>
      </Camera>
    </AbsoluteFill>
  );
};

/** Cartão do pedido no painel. */
const OrderCard: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ width: 720, borderRadius: 40, background: G, border: `3px solid rgba(61,220,114,${0.3 + 0.4 * p})`, boxShadow: `0 0 ${70 * p}px rgba(61,220,114,0.22)`, padding: "36px 44px", boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <Dot color={C.green} size={34} />
      <span style={{ color: C.text, fontSize: 60, fontWeight: 800, letterSpacing: -1 }}>Novo pedido</span>
    </div>
    <div style={{ height: 2, background: "rgba(255,255,255,0.12)", margin: "26px 0" }} />
    <div style={{ color: C.text, fontSize: 54, fontWeight: 700 }}>Combo + gelo</div>
    <div style={{ color: C.muted, fontSize: 34, marginTop: 14 }}>{ADDRESS}</div>
    <div style={{ color: C.muted, fontSize: 34 }}>{BAIRRO}</div>
  </div>
);

const Balcao: React.FC<{ from: number }> = ({ from }) => {
  const { now } = useLocal(from);
  const card = pop(now, from + 0.05, 0.45);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE_CENTER_X - 360, top: 340, opacity: card.opacity, transform: `translateY(${(1 - card.x) * -40}px) scale(${card.scale})` }}>
        <OrderCard p={card.x} />
      </div>
      <Person x={700} y={1150} size={280} />
      <Counter x={430} y={1130} width={500} />
    </AbsoluteFill>
  );
};

const Chamada: React.FC<{ from: number; t: Record<string, number> }> = ({ from, t }) => {
  const { now } = useLocal(from);
  const side = progress(now, from, from + 0.5);
  const txt = pop(now, from + 0.3, 0.5);
  const sc = 0.46;
  return (
    <AbsoluteFill>
      {/* site */}
      <div style={{ position: "absolute", left: SAFE_CENTER_X - PW * sc - 18, top: 230, opacity: side, transform: `translateX(${(1 - side) * -60}px)` }}>
        <div style={{ width: PW * sc, height: PH * sc, position: "relative" }}>
          <div style={{ position: "absolute", width: PW, height: PH, transform: `scale(${sc})`, transformOrigin: "0 0" }}>
            <PhoneFrame x={0} y={0} w={PW} h={PH}>
              <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transform: `scale(${PW / SW})`, transformOrigin: "0 0" }}>
                <LitoralSite now={0} t={{ add1: -10, add2: -10, cart: 9e9, prices: 9e9, addrA: 9e9, addrB: 9.1e9, confirm: 9e9 }} />
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
      {/* painel */}
      <div style={{ position: "absolute", left: SAFE_CENTER_X + 18, top: 230, opacity: side, transform: `translateX(${(1 - side) * 60}px)` }}>
        <div style={{ width: PW * sc, height: PH * sc, borderRadius: 30, background: "#0e0e10", border: "2px solid #2c2c2e", position: "relative", overflow: "hidden" }}>
          <div style={{ color: C.text, fontSize: 30, fontWeight: 800, padding: "26px 22px 10px" }}>Painel</div>
          <div style={{ position: "absolute", left: 14, top: 84, transform: "scale(0.345)", transformOrigin: "0 0" }}>
            <OrderCard p={1} />
          </div>
          {["Pedido #0341 · entregue", "Pedido #0340 · entregue", "Pedido #0339 · entregue"].map((r, i) => (
            <div key={i} style={{ position: "absolute", left: 14, right: 14, top: 250 + i * 70, height: 58, borderRadius: 14, background: G, color: C.muted, fontSize: 16, fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", padding: "0 12px" }}>
              {r}
            </div>
          ))}
        </div>
      </div>
      {/* chamada */}
      <div style={{ position: "absolute", top: 790, left: SAFE.left, width: SAFE.right - SAFE.left, display: "flex", justifyContent: "center", opacity: txt.opacity, transform: `scale(${txt.scale})` }}>
        <div style={{ padding: "34px 46px", borderRadius: 44, background: C.text, color: "#0b0b0b", fontSize: 92, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02, textAlign: "center", boxShadow: "0 0 80px rgba(255,255,255,0.18)" }}>
          Me chama aqui
          <br />
          no TikTok
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep05AntesDoOi: React.FC<EpisodeProps> = ({ episode, timings }) => {
  const cue = makeCues(timings);
  const end = episode.durationSec;
  const w = (id: string, word: string) => cue.word(id, word);

  const t = {
    typeA: w("veio", "passar"),
    typeB: w("veio", "passar") + 1.1,
    results: w("veio", "bebida") - 0.1,
    tapWa: w("primeira", "primeira"),
    typeMsgA: w("primeira", "primeira") + 0.55,
    typeMsgB: w("primeira", "primeira") + 1.35,
    delA: cue.end("primeira") + 0.25,
    delB: cue.end("primeira") + 0.85,
    closeWa: w("fechouwa", "fechou"),
    tapSite: w("fechouwa", "busca."),
    // site
    prices: w("segunda", "preços"),
    add1: w("segunda", "pedir"),
    add2: w("segunda", "fácil."),
    cart: w("confianca", "Passou"),
    addrA: w("confianca", "mais"),
    addrB: w("confianca", "mais") + 1.0,
    confirm: w("dois", "minutos,"),
  };
  // cortes
  const sWa = t.tapWa + 0.2;
  const sDonoA = Math.max(w("primeira", "mandar") - 0.05, t.typeMsgB + 0.5);
  const sDonoB = cue.end("primeira") + 0.15;
  const sSite = t.tapSite + 0.3;
  const sBalcao = cue.end("dois") + 0.1; // mesmo toque: confirmado → balcão
  const sCta = w("quer", "adega") - 0.1;

  return (
    <AbsoluteFill>
      <Background />
      <Scene from={0} to={sWa} fadeIn={0} fadeOut={0.1}>
        <Busca from={0} cue={cue} t={t} />
      </Scene>
      <Scene from={sWa} to={sDonoA} fadeIn={0.1} fadeOut={0.06}>
        <WhatsChat from={sWa} t={t} />
      </Scene>
      <Scene from={sDonoA} to={sDonoB} fadeIn={0.06} fadeOut={0.06}>
        <DonoFila from={sDonoA} to={sDonoB} />
      </Scene>
      <Scene from={sDonoB} to={sSite} fadeIn={0.06} fadeOut={0.1}>
        <WhatsChat from={sDonoB} t={t} />
      </Scene>
      <Scene from={sSite} to={sBalcao} fadeIn={0.1} fadeOut={0.06}>
        <Site from={sSite} t={t} />
      </Scene>
      <Scene from={sBalcao} to={sCta} fadeIn={0.06} fadeOut={0.12}>
        <Balcao from={sBalcao} />
      </Scene>
      <Scene from={sCta} to={end} fadeIn={0.12} fadeOut={0}>
        <Chamada from={sCta} t={t} />
      </Scene>

      <Captions timings={timings} replace={episode.captionReplace} backdrop y={1440} size={62} />

      <Audio src={staticFile(`episodes/${episode.id}/voice.wav`)} />
      {Array.from({ length: 7 }).map((_, i) => (
        <Sfx key={`k${i}`} name="tick" at={t.typeA + ((t.typeB - t.typeA) * i) / 7} volume={0.06} />
      ))}
      {(["tapWa", "closeWa", "tapSite", "add1", "add2", "cart", "confirm"] as const).map((k) => (
        <Sfx key={k} name="tap" at={t[k]} volume={0.3} />
      ))}
      {/* um único som de confirmação, na passagem do celular para o painel */}
      <Sfx name="success" at={sBalcao} volume={0.35} />
    </AbsoluteFill>
  );
};
