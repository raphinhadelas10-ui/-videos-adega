import React from "react";
import { C } from "../theme";
import { progress } from "./Base";
import { Dot, TapRing } from "./Ui";

export type Product = { name: string; detail: string; price: number; kind: "can" | "pack" | "ice" | "bottle" };

export const brl = (v: number) =>
  "R$ " + v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const ProductIcon: React.FC<{ kind: Product["kind"] }> = ({ kind }) => {
  const base: React.CSSProperties = { position: "absolute", background: "linear-gradient(180deg,#e8e8e8,#a9a9a9)" };
  return (
    <div style={{ position: "relative", width: 84, height: 84, borderRadius: 20, background: "#1f1f21", flexShrink: 0 }}>
      {kind === "can" && <div style={{ ...base, left: 28, top: 16, width: 28, height: 52, borderRadius: 7 }} />}
      {kind === "bottle" && (
        <>
          <div style={{ ...base, left: 29, top: 28, width: 26, height: 44, borderRadius: "10px 10px 6px 6px" }} />
          <div style={{ ...base, left: 36, top: 12, width: 12, height: 20, borderRadius: 4 }} />
        </>
      )}
      {kind === "pack" &&
        [0, 1, 2].map((i) => <div key={i} style={{ ...base, left: 14 + i * 20, top: 22, width: 16, height: 40, borderRadius: 5 }} />)}
      {kind === "ice" &&
        [0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              ...base,
              left: 20 + (i % 2) * 24,
              top: 20 + Math.floor(i / 2) * 24,
              width: 20,
              height: 20,
              borderRadius: 5,
              opacity: 0.85,
            }}
          />
        ))}
    </div>
  );
};

/**
 * Celular com o catálogo de pedidos. Todas as marcas de tempo são segundos absolutos.
 * Mostra só: abrir catálogo, ver preço, escolher item, enviar pedido.
 */
export const CatalogPhone: React.FC<{
  now: number;
  x: number;
  y: number;
  w: number;
  h: number;
  store: string;
  products: Product[];
  openAt: number; // toque no link do catálogo
  priceAt: number; // destaque dos preços
  adds: { index: number; at: number }[]; // toques em "+"
  sendAt: number; // toque em "Enviar pedido"
  /** iniciais da logo: troca a 1ª tela por uma página com a marca da adega */
  logo?: string;
  brandAt?: number; // quando a marca aparece
}> = ({ now, x, y, w, h, store, products, openAt, priceAt, adds, sendAt, logo, brandAt = 0 }) => {
  const opened = progress(now, openAt + 0.12, openAt + 0.45);
  const sent = progress(now, sendAt + 0.15, sendAt + 0.4);
  const added = adds.filter((a) => now >= a.at + 0.05);
  const total = added.reduce((s, a) => s + products[a.index].price, 0);
  const pad = 30;
  const rowH = 132;
  const listTop = 230;
  const barShow = progress(now, adds[0].at, adds[0].at + 0.25);
  const screenR = 52;

  // posições dos toques (relativas ao celular)
  const linkTap = { x: w / 2, y: logo ? 100 + 170 + 28 + 60 + 8 + 34 + 44 + 50 : 520 };
  const plusPos = (i: number) => ({ x: w - pad - 40, y: listTop + i * rowH + rowH / 2 });
  const sendPos = { x: w / 2, y: h - 92 };

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: screenR + 12,
        background: "#0b0b0c",
        border: "3px solid #2c2c2e",
        boxShadow: "0 0 80px rgba(255,255,255,0.10), 0 40px 120px rgba(0,0,0,0.8)",
        overflow: "hidden",
      }}
    >
      {/* Tela 1 (com marca): página da adega */}
      {logo && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - opened, padding: pad, paddingTop: 100, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: 85,
              background: "linear-gradient(180deg,#ffffff,#cfcfcf)",
              color: "#0b0b0b",
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 60px rgba(255,255,255,${0.3 * progress(now, brandAt, brandAt + 0.4)})`,
              transform: `scale(${0.6 + 0.4 * progress(now, brandAt, brandAt + 0.35)})`,
              opacity: progress(now, brandAt, brandAt + 0.25),
            }}
          >
            {logo}
          </div>
          <div style={{ color: C.text, fontSize: 50, fontWeight: 800, marginTop: 28, letterSpacing: -1, opacity: progress(now, brandAt + 0.15, brandAt + 0.45) }}>{store}</div>
          <div style={{ color: C.muted, fontSize: 28, marginTop: 8, opacity: progress(now, brandAt + 0.3, brandAt + 0.6) }}>Peça pelo link · entrega no bairro</div>
          <div
            style={{
              marginTop: 44,
              width: w - pad * 2 - 40,
              height: 100,
              borderRadius: 50,
              background: C.text,
              color: "#0b0b0b",
              fontSize: 36,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: progress(now, brandAt + 0.45, brandAt + 0.75),
              transform: `scale(${1 - 0.04 * progress(now, openAt - 0.05, openAt + 0.08)})`,
            }}
          >
            Ver catálogo
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 50, opacity: 0.8 * progress(now, brandAt + 0.6, brandAt + 0.9) }}>
            {(["can", "pack", "ice", "bottle"] as const).map((k) => (
              <ProductIcon key={k} kind={k} />
            ))}
          </div>
        </div>
      )}
      {!logo && (
      <div style={{ position: "absolute", inset: 0, opacity: 1 - opened, padding: pad, paddingTop: 110 }}>
        <div style={{ color: C.muted, fontSize: 28, textAlign: "center", marginBottom: 40 }}>{store}</div>
        <div
          style={{
            margin: "0 auto",
            width: w - pad * 2 - 40,
            background: "#1d1d1f",
            borderRadius: 30,
            padding: 30,
            border: `2px solid ${C.cardBorder}`,
            transform: `scale(${1 - 0.04 * progress(now, openAt - 0.05, openAt + 0.08)})`,
          }}
        >
          <div style={{ height: 150, borderRadius: 18, background: "linear-gradient(135deg,#2a2a2c,#18181a)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <ProductIcon kind="bottle" />
            <ProductIcon kind="can" />
          </div>
          <div style={{ color: C.text, fontSize: 38, fontWeight: 700 }}>Catálogo</div>
          <div style={{ color: C.muted, fontSize: 28, marginTop: 6 }}>Ver produtos e preços</div>
        </div>
      </div>
      )}

      {/* Tela 2: catálogo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: opened * (1 - sent),
          transform: `translateX(${(1 - opened) * 60}px)`,
        }}
      >
        <div style={{ padding: `${pad + 40}px ${pad}px 0` }}>
          <div style={{ color: C.muted, fontSize: 26, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>{store}</div>
          <div style={{ color: C.text, fontSize: 52, fontWeight: 800, marginTop: 6, letterSpacing: -1 }}>Catálogo</div>
        </div>
        {products.map((p, i) => {
          const isAdded = added.some((a) => a.index === i);
          const hi = adds.some((a) => a.index === i) ? progress(now, priceAt, priceAt + 0.25) : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: pad - 10,
                width: w - pad * 2 + 20,
                top: listTop + i * rowH + 8,
                height: rowH - 16,
                borderRadius: 26,
                background: `rgba(255,255,255,${0.035 + 0.04 * hi})`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "0 18px",
                boxSizing: "border-box",
              }}
            >
              <ProductIcon kind={p.kind} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontSize: 29, fontWeight: 600, lineHeight: 1.15 }}>{p.name}</div>
                <div style={{ color: C.muted, fontSize: 23, marginTop: 2 }}>{p.detail}</div>
                <div
                  style={{
                    display: "inline-block",
                    color: C.text,
                    fontSize: 31,
                    fontWeight: 800,
                    marginTop: 4,
                    padding: "0 8px",
                    marginLeft: -8,
                    borderRadius: 10,
                    background: `rgba(255,255,255,${0.14 * hi})`,
                    textShadow: hi > 0 ? `0 0 ${18 * hi}px rgba(255,255,255,0.6)` : undefined,
                  }}
                >
                  {brl(p.price)}
                </div>
              </div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  flexShrink: 0,
                  background: isAdded ? C.text : "transparent",
                  border: `3px solid ${isAdded ? C.text : "rgba(255,255,255,0.35)"}`,
                  color: isAdded ? "#111" : C.text,
                  fontSize: isAdded ? 30 : 40,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isAdded ? "1" : "+"}
              </div>
            </div>
          );
        })}
        {/* barra de envio */}
        <div
          style={{
            position: "absolute",
            left: pad,
            width: w - pad * 2,
            bottom: 40,
            height: 104,
            borderRadius: 52,
            background: C.text,
            color: "#0b0b0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            boxSizing: "border-box",
            fontSize: 34,
            fontWeight: 800,
            opacity: barShow,
            transform: `translateY(${(1 - barShow) * 40}px) scale(${1 - 0.04 * progress(now, sendAt - 0.05, sendAt + 0.08)})`,
            boxShadow: "0 0 40px rgba(255,255,255,0.25)",
          }}
        >
          <span>Enviar pedido</span>
          <span>{brl(total)}</span>
        </div>
      </div>

      {/* Tela 3: pedido enviado */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: sent,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            background: C.green,
            boxShadow: `0 0 70px ${C.greenGlow}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${0.6 + 0.4 * sent})`,
          }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24">
            <path d="M5 12.5l4.2 4.2L19 7" stroke="#062611" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ color: C.text, fontSize: 46, fontWeight: 800 }}>Pedido enviado</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: C.muted, fontSize: 30 }}>
          <Dot color={C.green} size={16} />
          {adds.length} itens · {brl(total)}
        </div>
      </div>

      {/* toques */}
      <TapRing x={linkTap.x} y={linkTap.y} t={(now - openAt) / 0.45} />
      {adds.map((a, i) => (
        <TapRing key={i} x={plusPos(a.index).x} y={plusPos(a.index).y} t={(now - a.at) / 0.45} />
      ))}
      <TapRing x={sendPos.x} y={sendPos.y} t={(now - sendAt) / 0.45} />
    </div>
  );
};
