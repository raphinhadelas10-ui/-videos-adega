import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { Background, Scene, Sfx, pop, progress, useLocal } from "../components/Base";
import { CamKey } from "../components/Camera";
import { Captions } from "../components/Captions";
import { brl } from "../components/Catalog";
import { PhoneFrame } from "../components/Panels";
import { PhotoPlane, QuadScreen } from "../components/Photo";
import { TapRing } from "../components/Ui";
import { Cues, EpisodeProps, makeCues } from "../lib/timing";
import { C, SAFE } from "../theme";

// ——— Lojas fictícias ———
const LOJA1 = "Adega Maré Alta";
const LOJA2 = "Empório Canto do Mar";
const LOJA3 = "Sol & Gelo";
const ADDRESS = "Rua das Gaivotas, 88";
const BAIRRO = "Pitangueiras";
const ORDER = "#0342";
const ITEMS = [
  { name: "Combo Réveillon", desc: "12 long necks + gelo 5 kg", price: 89.9 },
  { name: "Gelo 5 kg", desc: "Pacote", price: 12.0 },
];
const TOTAL = ITEMS.reduce((s, i) => s + i.price, 0);

// identidade da Sol & Gelo
const B = { bg: "#0d1b2a", card: "#14283d", amber: "#ffb547", ice: "#9ad7ff", text: "#f4f7fb", muted: "#8fa3b8" };

const DIR = "episodes/04-joao-escolhe/planos";
const P5 = staticFile(`${DIR}/plano5.jpg`);

// telas dentro das fotos (cantos medidos nas fotos recortadas)
const PHONE: [[number, number], [number, number], [number, number], [number, number]] = [
  [366, 114],
  [688, 108],
  [720, 818],
  [400, 826],
];
const TABLET: [[number, number], [number, number], [number, number], [number, number]] = [
  [218, 268],
  [702, 266],
  [820, 800],
  [310, 852],
];
const W = 390; // tela lógica do celular
const H = 860;
const TW = 600; // tela lógica do tablet
const TH = 680;
const PHONE_FOCUS = { s: 1.45, x: 543, y: 467 };

const SunLogo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: B.bg, border: `${size * 0.05}px solid ${B.amber}`, position: "relative", overflow: "hidden", flexShrink: 0 }}>
    <div style={{ position: "absolute", left: size * 0.2, top: size * 0.22, width: size * 0.5, height: size * 0.5, borderRadius: "50%", background: `linear-gradient(180deg, #ffd27a, ${B.amber})` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: size * 0.55, bottom: 0, background: B.ice, opacity: 0.9 }} />
    <div style={{ position: "absolute", left: -size * 0.1, right: -size * 0.1, top: size * 0.5, height: size * 0.12, borderRadius: "50%", background: B.bg }} />
  </div>
);

const press = (now: number, at: number) => progress(now, at - 0.05, at + 0.08) * (1 - progress(now, at + 0.12, at + 0.3));
const Tap: React.FC<{ x: number; y: number; at: number; now: number }> = ({ x, y, at, now }) => <TapRing x={x} y={y} t={(now - at) / 0.45} />;

// ——— telas do celular ———
const SearchScreen: React.FC<{ now: number; t: Record<string, number> }> = ({ now, t }) => {
  const q = "adega perto de mim";
  const typed = q.slice(0, Math.round(interpolate(now, [t.typeA, t.typeB], [0, q.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const res = [
    { name: LOJA1, info: "★ 4,4 · 350 m · Aberto", btn: "Fazer pedido", dimAt: t.back1, tag: "sem preço" },
    { name: LOJA2, info: "★ 4,1 · 600 m · Aberto", btn: "Ver catálogo", dimAt: t.close2, tag: "travou" },
    { name: LOJA3, info: "★ 4,8 · 800 m · Aberto", btn: "Ver site", dimAt: 9999, tag: "" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#101012", padding: "36px 22px" }}>
      <div style={{ height: 70, borderRadius: 35, background: "#232326", display: "flex", alignItems: "center", padding: "0 22px", color: C.text, fontSize: 24, fontWeight: 600, whiteSpace: "nowrap" }}>
        <span style={{ marginRight: 12, opacity: 0.6 }}>🔍</span>
        {typed}
        {now < t.typeB + 0.3 && Math.floor(now * 3) % 2 === 0 && <span style={{ width: 2, height: 30, background: C.text, marginLeft: 2 }} />}
      </div>
      <div style={{ color: C.muted, fontSize: 20, margin: "22px 6px 12px", opacity: progress(now, t.results, t.results + 0.3) }}>Guarujá · 3 resultados</div>
      {res.map((r, i) => {
        const p = pop(now, t.results + i * 0.2, 0.35);
        const dimmed = now >= r.dimAt;
        return (
          <div key={i} style={{ marginBottom: 16, borderRadius: 24, background: "#1c1c1f", padding: "18px 20px", opacity: p.opacity * (dimmed ? 0.55 : 1), transform: `scale(${p.scale})`, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {i === 2 ? <SunLogo size={54} /> : <div style={{ width: 54, height: 54, borderRadius: 27, background: "#3a3a3e" }} />}
              <div>
                <div style={{ color: C.text, fontSize: 27, fontWeight: 800 }}>{r.name}</div>
                <div style={{ color: C.muted, fontSize: 19, marginTop: 2 }}>{r.info}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, height: 56, borderRadius: 28, background: i === 2 ? B.amber : "#2c2c30", color: i === 2 ? B.bg : C.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23, fontWeight: 800, transform: `scale(${1 - 0.05 * press(now, [t.tap1, t.tap2, t.tap3][i])})` }}>
              {dimmed ? <span style={{ color: C.red }}>✕ {r.tag}</span> : r.btn}
            </div>
          </div>
        );
      })}
      <Tap x={W / 2} y={36 + 70 + 56 + 18 + 54 + 14 + 28 + 0 * 168} at={t.tap1} now={now} />
      <Tap x={W / 2} y={36 + 70 + 56 + 18 + 54 + 14 + 28 + 1 * 172} at={t.tap2} now={now} />
      <Tap x={W / 2} y={36 + 70 + 56 + 18 + 54 + 14 + 28 + 2 * 172} at={t.tap3} now={now} />
    </div>
  );
};

const ChatScreen: React.FC<{ now: number; t: Record<string, number> }> = ({ now, t }) => {
  const msgs = [
    { text: "Tem gelo?", at: t.m1 },
    { text: "Qual o valor?", at: t.m2 },
    { text: "Entrega aqui?", at: t.m3 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0b141a" }}>
      <div style={{ height: 96, background: "#1f2c34", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", paddingTop: 12 }}>
        <div style={{ color: C.text, fontSize: 34, transform: `scale(${1 + 0.3 * press(now, t.back1)})` }}>‹</div>
        <div style={{ width: 50, height: 50, borderRadius: 25, background: "#3a3a3e" }} />
        <div>
          <div style={{ color: C.text, fontSize: 24, fontWeight: 700 }}>{LOJA1}</div>
          <div style={{ color: "#8696a0", fontSize: 17 }}>visto por último hoje</div>
        </div>
      </div>
      <div style={{ padding: "24px 18px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
        <div style={{ alignSelf: "center", color: "#8696a0", fontSize: 17, background: "#1f2c34", padding: "4px 14px", borderRadius: 10 }}>Hoje</div>
        {msgs.map((m, i) => {
          const p = pop(now, m.at, 0.3);
          return (
            <div key={i} style={{ background: "#005c4b", color: C.text, fontSize: 30, fontWeight: 500, padding: "12px 18px", borderRadius: "20px 20px 6px 20px", opacity: p.opacity, transform: `scale(${p.scale})`, transformOrigin: "100% 100%" }}>
              {m.text} <span style={{ fontSize: 16, color: "#9fb6b0", marginLeft: 6 }}>21:14 ✓</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 18, right: 18, bottom: 26, height: 64, borderRadius: 32, background: "#1f2c34", color: "#8696a0", fontSize: 22, display: "flex", alignItems: "center", padding: "0 22px" }}>Mensagem</div>
      <Tap x={30} y={60} at={t.back1} now={now} />
    </div>
  );
};

const SlowCatalog: React.FC<{ now: number; t: Record<string, number> }> = ({ now, t }) => {
  const loaded = now >= t.loaded;
  const bar = interpolate(now, [t.tap2, t.loaded], [0.05, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stuck = now >= t.tapCombo2 + 0.1;
  const shimmer = 0.35 + 0.25 * Math.sin(now * 8);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#e9e9ec" }}>
      <div style={{ height: 6, width: `${(loaded ? 1 : bar) * 100}%`, background: "#4a7cf7", opacity: loaded ? 0 : 1 }} />
      <div style={{ height: 84, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", borderBottom: "1px solid #d0d0d5" }}>
        <div style={{ color: "#333", fontSize: 24, fontWeight: 700 }}>{loaded ? LOJA2 : "carregando…"}</div>
        <div style={{ color: "#333", fontSize: 34, transform: `scale(${1 + 0.3 * press(now, t.close2)})` }}>✕</div>
      </div>
      {!loaded &&
        [0, 1, 2, 3].map((i) => (
          <div key={i} style={{ margin: "22px 22px 0", display: "flex", gap: 16 }}>
            <div style={{ width: 90, height: 90, borderRadius: 14, background: `rgba(160,160,170,${shimmer})` }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 22, width: "80%", borderRadius: 8, background: `rgba(160,160,170,${shimmer})` }} />
              <div style={{ height: 18, width: "50%", borderRadius: 8, background: `rgba(160,160,170,${shimmer})`, marginTop: 12 }} />
            </div>
          </div>
        ))}
      {loaded &&
        ["Combo cerveja", "Cerveja lata", "Gelo", "Carvão"].map((n, i) => (
          <div key={i} style={{ margin: "16px 22px 0", padding: 16, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", gap: 16, border: i === 0 && now > t.tapCombo2 - 0.1 ? "3px solid #4a7cf7" : "1px solid #ddd" }}>
            <div style={{ width: 70, height: 70, borderRadius: 10, background: "#d5d5da", color: "#999", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>sem foto</div>
            <div style={{ color: "#333", fontSize: 25, fontWeight: 600 }}>{n}</div>
          </div>
        ))}
      {stuck && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, border: "8px solid #ccc", borderTopColor: "#4a7cf7", transform: `rotate(${now * 400}deg)` }} />
          <div style={{ color: "#555", fontSize: 24, fontWeight: 600 }}>Carregando…</div>
        </div>
      )}
      <Tap x={W / 2} y={84 + 16 + 51} at={t.tapCombo2} now={now} />
      <Tap x={W - 36} y={44} at={t.close2} now={now} />
    </div>
  );
};

const Photo: React.FC<{ pos: string; h: number }> = ({ pos, h }) => (
  <div style={{ width: "100%", height: h, borderRadius: 16, backgroundImage: `url(${P5})`, backgroundSize: "260%", backgroundPosition: pos }} />
);

const BrandSite: React.FC<{ now: number; t: Record<string, number> }> = ({ now, t }) => {
  const added = [now >= t.add1 + 0.05, now >= t.add2 + 0.05];
  const n = added.filter(Boolean).length;
  const total = ITEMS.filter((_, i) => added[i]).reduce((s, i) => s + i.price, 0);
  const checkout = progress(now, t.cont + 0.1, t.cont + 0.4);
  const typed = ADDRESS.slice(0, Math.round(interpolate(now, [t.typeAddrA, t.typeAddrB], [0, ADDRESS.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const priceHi = progress(now, t.prices, t.prices + 0.25) * (1 - progress(now, t.prices + 1.2, t.prices + 1.5));
  return (
    <div style={{ position: "absolute", inset: 0, background: B.bg, fontFamily: "Inter" }}>
      {/* catálogo */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - checkout, transform: `translateX(${-checkout * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "30px 20px 12px" }}>
          <SunLogo size={56} />
          <div>
            <div style={{ color: B.text, fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>{LOJA3}</div>
            <div style={{ color: B.amber, fontSize: 17, fontWeight: 700, letterSpacing: 2 }}>ADEGA · GUARUJÁ</div>
          </div>
        </div>
        {[
          { item: ITEMS[0], pos: "45% 40%", big: true },
          { item: ITEMS[1], pos: "40% 95%", big: false },
        ].map((p, i) => (
          <div key={i} style={{ margin: "12px 18px 0", padding: 14, borderRadius: 22, background: B.card, border: `2px solid ${added[i] ? B.amber : "transparent"}` }}>
            <Photo pos={p.pos} h={p.big ? 200 : 110} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <div>
                <div style={{ color: B.text, fontSize: 25, fontWeight: 800 }}>{p.item.name}</div>
                <div style={{ color: B.muted, fontSize: 17 }}>{p.item.desc}</div>
                <div style={{ color: B.amber, fontSize: 28, fontWeight: 800, marginTop: 2, padding: "0 6px", marginLeft: -6, borderRadius: 8, background: `rgba(255,181,71,${0.18 * priceHi})` }}>{brl(p.item.price)}</div>
              </div>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: added[i] ? B.amber : "transparent", border: `3px solid ${B.amber}`, color: added[i] ? B.bg : B.amber, fontSize: added[i] ? 28 : 38, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.08 * press(now, i === 0 ? t.add1 : t.add2)})` }}>
                {added[i] ? "✓" : "+"}
              </div>
            </div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 22, height: 76, borderRadius: 38, background: B.amber, color: B.bg, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", fontSize: 24, fontWeight: 800, opacity: n > 0 ? 1 : 0, transform: `scale(${1 - 0.05 * press(now, t.cont)})` }}>
          <span>
            {n} {n === 1 ? "item" : "itens"} · {brl(total)}
          </span>
          <span>Continuar ›</span>
        </div>
        <Tap x={W - 18 - 14 - 32} y={30 + 56 + 12 + 12 + 14 + 200 + 10 + 40} at={t.add1} now={now} />
        <Tap x={W - 18 - 14 - 32} y={30 + 56 + 12 + 12 + 14 + 200 + 10 + 80 + 14 + 12 + 14 + 110 + 10 + 40} at={t.add2} now={now} />
        <Tap x={W / 2} y={H - 60} at={t.cont} now={now} />
      </div>

      {/* entrega */}
      <div style={{ position: "absolute", inset: 0, opacity: checkout, transform: `translateX(${(1 - checkout) * 40}px)`, padding: "34px 20px" }}>
        <div style={{ color: B.text, fontSize: 34, fontWeight: 800 }}>Entrega</div>
        <div style={{ color: B.muted, fontSize: 19, marginTop: 18 }}>Endereço</div>
        <div style={{ marginTop: 8, height: 66, borderRadius: 18, background: B.card, border: `2px solid ${B.amber}`, display: "flex", alignItems: "center", padding: "0 18px", color: B.text, fontSize: 25, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>
          {typed}
          {now < t.typeAddrB + 0.2 && <span style={{ width: 2, height: 28, background: B.text, marginLeft: 2 }} />}
        </div>
        <div style={{ color: B.muted, fontSize: 19, marginTop: 16 }}>Bairro</div>
        <div style={{ marginTop: 8, height: 66, borderRadius: 18, background: B.card, display: "flex", alignItems: "center", padding: "0 18px", color: B.text, fontSize: 25, fontWeight: 600 }}>{now >= t.typeAddrB ? BAIRRO : ""}</div>
        <div style={{ marginTop: 26, borderRadius: 18, background: B.card, padding: "14px 18px" }}>
          {ITEMS.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", color: B.text, fontSize: 22, lineHeight: 1.6 }}>
              <span>1× {it.name}</span>
              <span>{brl(it.price)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", color: B.amber, fontSize: 26, fontWeight: 800, marginTop: 6 }}>
            <span>Total</span>
            <span>{brl(TOTAL)}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 22, height: 80, borderRadius: 40, background: B.amber, color: B.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, transform: `scale(${1 - 0.05 * press(now, t.finish)})` }}>Finalizar pedido</div>
        <Tap x={W / 2} y={H - 62} at={t.finish} now={now} />
      </div>
    </div>
  );
};

const ConfirmedScreen: React.FC<{ now: number; at: number }> = ({ now, at }) => {
  const p = pop(now, at, 0.45);
  return (
    <div style={{ position: "absolute", inset: 0, background: B.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "90px 22px 0" }}>
      <div style={{ width: 140, height: 140, borderRadius: 70, background: C.green, boxShadow: `0 0 60px ${C.greenGlow}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p.scale})`, opacity: p.opacity }}>
        <svg width="76" height="76" viewBox="0 0 24 24">
          <path d="M5 12.5l4.2 4.2L19 7" stroke="#062611" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ color: C.green, fontSize: 35, fontWeight: 800, marginTop: 30, whiteSpace: "nowrap" }}>Pedido confirmado</div>
      <div style={{ color: B.muted, fontSize: 22, marginTop: 8 }}>
        {LOJA3} · pedido {ORDER}
      </div>
      <div style={{ marginTop: 30, width: "100%", borderRadius: 20, background: B.card, padding: "16px 20px", boxSizing: "border-box" }}>
        {ITEMS.map((it, i) => (
          <div key={i} style={{ color: B.text, fontSize: 23, lineHeight: 1.6 }}>1× {it.name}</div>
        ))}
        <div style={{ color: B.muted, fontSize: 20, marginTop: 6 }}>
          {ADDRESS} · {BAIRRO}
        </div>
      </div>
    </div>
  );
};

/** Painel no tablet do balcão. */
const TabletPanel: React.FC<{ now: number; t: Record<string, number> }> = ({ now, t }) => {
  const toast = pop(now, t.newOrder, 0.4);
  const card = progress(now, t.newOrder + 0.3, t.newOrder + 0.7);
  const hiItems = progress(now, t.complete - 0.1, t.complete + 0.2);
  return (
    <div style={{ position: "absolute", inset: 0, background: B.bg, padding: "28px 30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <SunLogo size={50} />
        <div style={{ color: B.text, fontSize: 30, fontWeight: 800 }}>Painel · Pedidos</div>
      </div>
      {/* aviso de novo pedido */}
      <div style={{ marginTop: 20, height: 74, borderRadius: 20, background: C.green, color: "#062611", display: "flex", alignItems: "center", gap: 14, padding: "0 22px", fontSize: 30, fontWeight: 800, opacity: toast.opacity, transform: `scale(${toast.scale})`, boxShadow: `0 0 40px ${C.greenGlow}` }}>
        🔔 Novo pedido {ORDER}
      </div>
      <div style={{ marginTop: 18, borderRadius: 24, background: B.card, padding: "22px 26px", opacity: card, transform: `translateY(${(1 - card) * 20}px)`, border: `2px solid rgba(255,181,71,${0.5 * hiItems})` }}>
        <div style={{ color: B.muted, fontSize: 22 }}>Cliente: João · via site</div>
        {ITEMS.map((it, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", color: B.text, fontSize: 30, fontWeight: 600, lineHeight: 1.55 }}>
            <span>1× {it.name}</span>
            <span>{brl(it.price)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", color: B.amber, fontSize: 32, fontWeight: 800, marginTop: 4 }}>
          <span>Total</span>
          <span>{brl(TOTAL)}</span>
        </div>
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 16, background: `rgba(154,215,255,${0.08 + 0.1 * hiItems})` }}>
          <div style={{ color: B.muted, fontSize: 20 }}>Entregar em</div>
          <div style={{ color: B.text, fontSize: 28, fontWeight: 700 }}>
            {ADDRESS} · {BAIRRO}
          </div>
        </div>
      </div>
    </div>
  );
};

// ——— cenas ———
const PhonePlane: React.FC<{ from: number; keys?: CamKey[]; children: (now: number) => React.ReactNode }> = ({ from, keys, children }) => {
  const { now } = useLocal(from);
  return (
    <AbsoluteFill>
      <PhotoPlane src={`${DIR}/plano2.jpg`} now={now} keys={keys ?? [{ t: from, ...PHONE_FOCUS }, { t: from + 8, s: PHONE_FOCUS.s + 0.04, x: PHONE_FOCUS.x, y: PHONE_FOCUS.y }]}>
        <QuadScreen w={W} h={H} corners={PHONE}>
          {children(now)}
        </QuadScreen>
      </PhotoPlane>
    </AbsoluteFill>
  );
};

const Fade: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;

const Chip: React.FC<{ text: string; x: number; y: number; o: number; s?: number }> = ({ text, x, y, o, s = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${s})`, transformOrigin: "0 50%", padding: "12px 26px", borderRadius: 999, background: "rgba(10,10,12,0.78)", border: "2px solid rgba(255,255,255,0.18)", color: C.text, fontSize: 40, fontWeight: 800, whiteSpace: "nowrap" }}>
    {text}
  </div>
);

export const Ep04JoaoEscolhe: React.FC<EpisodeProps> = ({ episode, timings }) => {
  const cue = makeCues(timings);
  const end = episode.durationSec;
  const w = (id: string, word: string, nth = 0) => cue.word(id, word, nth);

  const t = {
    // busca
    typeA: w("veio", "amigos") + 0.15,
    typeB: w("veio", "amigos") + 1.0,
    results: w("veio", "bebida") - 0.1,
    // 1ª adega
    tap1: w("primeira", "primeira"),
    m1: w("primeira", "saber") - 0.2,
    m2: w("primeira", "preço"),
    m3: w("primeira", "mandar"),
    back1: w("voltou", "voltou"),
    // 2ª adega
    tap2: w("segunda", "segunda,"),
    loaded: w("segunda", "abrir.") + 0.4,
    tapCombo2: w("travou", "clicou"),
    close2: w("travou", "saiu."),
    // 3ª adega
    tap3: w("terceira", "terceira,") + 0.05,
    prices: w("terceira", "preços"),
    add1: w("terceira", "preços") + 0.6,
    add2: w("confianca", "mais"),
    cont: w("confianca", "confiança.") + 0.15,
    typeAddrA: w("confianca", "confiança.") + 0.45,
    typeAddrB: w("confianca", "confiança.") + 1.15,
    finish: cue.start("fechou") - 0.3,
    // confirmado / painel
    card2min: cue.start("fechou") - 0.05,
    confirmed: w("fechou", "fechou."),
    newOrder: w("painel", "pedido") - 0.05,
    complete: w("painel", "completo"),
    // final
    phoneIn: w("quer", "facilitar") - 0.2,
    cta: w("chama", "Me") - 0.1,
  };

  // cortes
  const c1 = w("veio", "amigos") - 0.05; // varanda → celular
  const c2 = w("dono", "dono") - 0.25; // celular → dono no balcão
  const c3 = w("voltou", "João") - 0.15; // dono → celular
  const c4 = t.card2min; // "2 minutos depois"
  const c5 = t.card2min + 0.85; // pedido confirmado
  const c6 = cue.start("painel") - 0.1; // tablet
  const c7 = cue.start("quer") - 0.25; // fachada

  const phoneScreens = (now: number) => {
    const sChat = progress(now, t.tap1 + 0.15, t.tap1 + 0.4) * (1 - progress(now, t.back1 + 0.1, t.back1 + 0.35));
    const sSlow = progress(now, t.tap2 + 0.15, t.tap2 + 0.4) * (1 - progress(now, t.close2 + 0.1, t.close2 + 0.35));
    const sBrand = progress(now, t.tap3 + 0.15, t.tap3 + 0.4);
    return (
      <>
        <SearchScreen now={now} t={t} />
        <Fade o={sChat}>
          <ChatScreen now={now} t={t} />
        </Fade>
        <Fade o={sSlow}>
          <SlowCatalog now={now} t={t} />
        </Fade>
        <Fade o={sBrand}>
          <BrandSite now={now} t={t} />
        </Fade>
      </>
    );
  };

  return (
    <AbsoluteFill>
      <Background />

      {/* 1. João na varanda */}
      <Scene from={0} to={c1} fadeIn={0} fadeOut={0.12}>
        <JoaoIntro from={0} cue={cue} />
      </Scene>

      {/* 2–3. busca e 1ª adega no celular */}
      <Scene from={c1} to={c2} fadeIn={0.12} fadeOut={0.12}>
        <PhonePlane from={c1}>{phoneScreens}</PhonePlane>
      </Scene>

      {/* 4. o dono dividido entre balcão e conversas */}
      <Scene from={c2} to={c3} fadeIn={0.12} fadeOut={0.12}>
        <DonoOcupado from={c2} cue={cue} />
      </Scene>

      {/* 5–7. volta pra busca, 2ª e 3ª adega */}
      <Scene from={c3} to={c4} fadeIn={0.12} fadeOut={0.08}>
        <PhonePlane from={c3}>{phoneScreens}</PhonePlane>
      </Scene>

      {/* "2 minutos depois" */}
      <Scene from={c4} to={c5} fadeIn={0.08} fadeOut={0.08}>
        <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: C.text, fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>2 minutos depois</div>
        </AbsoluteFill>
      </Scene>

      <Scene from={c5} to={c6} fadeIn={0.08} fadeOut={0.12}>
        <PhonePlane from={c5}>{(now) => <ConfirmedScreen now={now} at={c5 + 0.1} />}</PhonePlane>
      </Scene>

      {/* 8. tablet no balcão */}
      <Scene from={c6} to={c7} fadeIn={0.12} fadeOut={0.15}>
        <TabletScene from={c6} t={t} />
      </Scene>

      {/* 9. fachada + site no celular + chamada */}
      <Scene from={c7} to={end} fadeIn={0.15} fadeOut={0}>
        <Final from={c7} t={t} />
      </Scene>

      <Captions timings={timings} replace={episode.captionReplace} backdrop y={1440} size={60} />

      <Audio src={staticFile(`episodes/${episode.id}/voice.wav`)} />
      {[c1, c2, c3, c6, c7].map((c, i) => (
        <Sfx key={`w${i}`} name="whoosh" at={c - 0.12} volume={0.2} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <Sfx key={`k${i}`} name="tick" at={t.typeA + ((t.typeB - t.typeA) * i) / 6} volume={0.07} />
      ))}
      {(["tap1", "back1", "tap2", "tapCombo2", "close2", "tap3", "add1", "add2", "cont", "finish"] as const).map((k) => (
        <Sfx key={k} name="tap" at={t[k]} volume={0.32} />
      ))}
      {(["m1", "m2", "m3"] as const).map((k) => (
        <Sfx key={k} name="message" at={t[k]} volume={0.22} />
      ))}
      <Sfx name="lost" at={t.close2 - 0.4} volume={0.15} />
      <Sfx name="success" at={c5 + 0.1} volume={0.3} />
      <Sfx name="message" at={t.newOrder} volume={0.35} />
      <Sfx name="reveal" at={t.cta} volume={0.25} />
    </AbsoluteFill>
  );
};

const JoaoIntro: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const name = pop(now, cue.word("joao", "João.") - 0.1, 0.4);
  const route = pop(now, cue.word("veio", "São") - 0.05, 0.4);
  return (
    <AbsoluteFill>
      <PhotoPlane src={`${DIR}/plano1.jpg`} now={now} keys={[{ t: 0, s: 1.0, x: 540, y: 540 }, { t: 4, s: 1.12, x: 420, y: 470 }]} />
      <Chip text="João" x={110} y={420} o={name.opacity} s={name.scale} />
      <Chip text="São Paulo → Guarujá" x={110} y={520} o={route.opacity} s={route.scale} />
    </AbsoluteFill>
  );
};

const DonoOcupado: React.FC<{ from: number; cue: Cues }> = ({ from, cue }) => {
  const { now } = useLocal(from);
  const msgs = ["Tem gelo?", "Qual o valor?", "Entrega aqui?", "Aceita pix?", "Tem carvão?", "Oi??"];
  const start = cue.word("dono", "respondendo") - 0.2;
  const pos: [number, number][] = [
    [40, 190],
    [600, 230],
    [70, 330],
    [640, 360],
    [40, 470],
    [690, 490],
  ];
  const count = Math.round(interpolate(now, [start, cue.end("dono")], [3, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill>
      <PhotoPlane src={`${DIR}/plano3.jpg`} now={now} keys={[{ t: from, s: 1.0, x: 560, y: 520 }, { t: from + 5, s: 1.12, x: 600, y: 470 }]} />
      {msgs.map((m, i) => {
        const p = pop(now, start + i * 0.22, 0.3);
        return (
          <div key={i} style={{ position: "absolute", left: pos[i][0], top: pos[i][1], opacity: p.opacity * 0.95, transform: `scale(${p.scale})`, background: "#005c4b", color: "#fff", padding: "12px 22px", borderRadius: "22px 22px 22px 6px", fontSize: 36, fontWeight: 600, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            {m}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: SAFE.right - 190, top: 1210, opacity: progress(now, start, start + 0.3), padding: "10px 22px", borderRadius: 999, background: C.red, color: "#fff", fontSize: 34, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        💬 {count}
      </div>
    </AbsoluteFill>
  );
};

const TabletScene: React.FC<{ from: number; t: Record<string, number> }> = ({ from, t }) => {
  const { now } = useLocal(from);
  return (
    <AbsoluteFill>
      <PhotoPlane src={`${DIR}/plano4.jpg`} now={now} keys={[{ t: from, s: 1.2, x: 520, y: 560 }, { t: from + 3.5, s: 1.32, x: 525, y: 560 }]}>
        <QuadScreen w={TW} h={TH} corners={TABLET} radius={14}>
          <TabletPanel now={now} t={t} />
        </QuadScreen>
      </PhotoPlane>
    </AbsoluteFill>
  );
};

const Final: React.FC<{ from: number; t: Record<string, number> }> = ({ from, t }) => {
  const { now } = useLocal(from);
  const ph = progress(now, t.phoneIn, t.phoneIn + 0.5);
  const cta = pop(now, t.cta, 0.5);
  const dim = 0.55 * progress(now, t.cta - 0.1, t.cta + 0.3);
  const pw = 340;
  const phh = 750;
  return (
    <AbsoluteFill>
      <PhotoPlane src={`${DIR}/plano6.jpg`} now={now} keys={[{ t: from, s: 1.0, x: 540, y: 560 }, { t: from + 10, s: 1.14, x: 480, y: 560 }]} dim={dim} />
      {/* o site da loja no celular */}
      <div style={{ opacity: ph * (1 - 0.0 * dim), transform: `translateY(${(1 - ph) * 120}px) rotate(${-4 + 4 * (1 - ph)}deg)` }}>
        <PhoneFrame x={SAFE.right - pw - 10} y={520} w={pw} h={phh} style={{ borderRadius: 44 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${pw / W})`, transformOrigin: "0 0" }}>
            <BrandSite now={0} t={{ add1: 9e9, add2: 9e9, cont: 9e9, typeAddrA: 9e9, typeAddrB: 9.1e9, finish: 9e9, prices: 9e9 }} />
          </div>
        </PhoneFrame>
      </div>
      {/* chamada final */}
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 250, opacity: cta.opacity, transform: `scale(${cta.scale})` }}>
        <div style={{ display: "inline-block", padding: "26px 40px", borderRadius: 36, background: C.text, color: "#0b0b0b", fontSize: 88, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, boxShadow: "0 20px 80px rgba(0,0,0,0.6)" }}>
          Me chama aqui
          <br />
          no TikTok
        </div>
        <div style={{ marginTop: 22, color: C.text, fontSize: 40, fontWeight: 700, textShadow: "0 4px 20px rgba(0,0,0,0.9)", maxWidth: 520 }}>Eu faço um site com a cara da tua loja.</div>
      </div>
    </AbsoluteFill>
  );
};
