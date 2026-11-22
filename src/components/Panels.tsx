import React from "react";
import { C } from "../theme";
import { progress } from "./Base";
import { brl } from "./Catalog";
import { Dot, TapRing } from "./Ui";

/** Relógio analógico + digital. `minutes` = minutos desde 00:00 (pode ser fracionário). */
export const Clock: React.FC<{ x: number; y: number; size?: number; minutes: number; opacity?: number }> = ({
  x,
  y,
  size = 220,
  minutes,
  opacity = 1,
}) => {
  const mAng = (minutes % 60) * 6;
  const hAng = ((minutes / 60) % 12) * 30;
  const hh = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
  const mm = String(Math.floor(minutes % 60)).padStart(2, "0");
  const hand = (len: number, w: number, ang: number, color: string) => (
    <div
      style={{
        position: "absolute",
        left: size / 2 - w / 2,
        top: size / 2 - len,
        width: w,
        height: len,
        borderRadius: w,
        background: color,
        transform: `rotate(${ang}deg)`,
        transformOrigin: "50% 100%",
      }}
    />
  );
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y, width: size, opacity }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          border: "4px solid rgba(255,255,255,0.75)",
          boxShadow: "0 0 50px rgba(255,255,255,0.18)",
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: size / 2 - 3,
              top: 10,
              width: 6,
              height: i % 3 === 0 ? 20 : 10,
              borderRadius: 3,
              background: "rgba(255,255,255,0.45)",
              transform: `rotate(${i * 30}deg)`,
              transformOrigin: `50% ${size / 2 - 14}px`,
            }}
          />
        ))}
        {hand(size * 0.25, 10, hAng, "#d9d9d9")}
        {hand(size * 0.38, 6, mAng, "#ffffff")}
        <div style={{ position: "absolute", left: size / 2 - 9, top: size / 2 - 9, width: 18, height: 18, borderRadius: 9, background: "#fff" }} />
      </div>
      <div style={{ marginTop: 20, textAlign: "center", color: C.text, fontSize: 52, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
        {hh}:{mm}
      </div>
    </div>
  );
};

/** Moldura de celular genérica. */
export const PhoneFrame: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x,
  y,
  w,
  h,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 64,
      background: "#0b0b0c",
      border: "3px solid #2c2c2e",
      boxShadow: "0 0 80px rgba(255,255,255,0.10), 0 40px 120px rgba(0,0,0,0.8)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export type ChatRow = { name: string; text: string; time: string };

/** Lista de conversas rolando (o dono procurando o que vendeu). */
export const ChatList: React.FC<{ rows: ChatRow[]; scroll: number; w: number; highlight?: number[]; hi?: number }> = ({
  rows,
  scroll,
  w,
  highlight = [],
  hi = 0,
}) => {
  const rowH = 118;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, bottom: 0, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          {rows.map((r, i) => {
            const h = highlight.includes(i) ? hi : 0;
            return (
              <div
                key={i}
                style={{
                  height: rowH,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "0 30px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: `rgba(255,255,255,${0.08 * h})`,
                }}
              >
                <div style={{ width: 68, height: 68, borderRadius: 34, background: "linear-gradient(180deg,#d8d8d8,#8f8f8f)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.text, fontSize: 30, fontWeight: 700 }}>{r.name}</span>
                    <span style={{ color: C.muted, fontSize: 24 }}>{r.time}</span>
                  </div>
                  <div style={{ color: C.muted, fontSize: 27, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: w - 160 }}>
                    {r.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 30, top: 60, color: C.text, fontSize: 50, fontWeight: 800, letterSpacing: -1 }}>Conversas</div>
    </div>
  );
};

export type OrderItem = { qty: number; name: string; price: number };

/**
 * Tela do dono: lista de pedidos. Um pedido novo chega em `arriveAt`,
 * é confirmado em `confirmAt` e tem a entrega marcada em `deliveryAt`.
 */
export const OrderPanel: React.FC<{
  now: number;
  w: number;
  h: number;
  store: string;
  orderNo: string;
  customer: string;
  address: string;
  items: OrderItem[];
  arriveAt: number;
  confirmAt: number;
  deliveryAt: number;
  older: { no: string; label: string; status: string }[];
}> = ({ now, w, store, orderNo, customer, address, items, arriveAt, confirmAt, deliveryAt, older }) => {
  const arrive = progress(now, arriveAt, arriveAt + 0.4);
  const confirmed = now >= confirmAt + 0.1;
  const delivered = now >= deliveryAt + 0.1;
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const pad = 28;
  const cardTop = 190;
  const cardH = 560;
  const btnY = cardTop + cardH - 130;
  const status = delivered
    ? { text: "Entrega marcada", color: C.green }
    : confirmed
      ? { text: "Confirmado", color: C.green }
      : { text: "Novo pedido", color: C.green };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ padding: `56px ${pad}px 0` }}>
        <div style={{ color: C.muted, fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>{store}</div>
        <div style={{ color: C.text, fontSize: 50, fontWeight: 800, letterSpacing: -1, marginTop: 4 }}>Pedidos</div>
      </div>

      {/* pedidos anteriores, empurrados para baixo quando o novo chega */}
      <div style={{ position: "absolute", left: pad, right: pad, top: cardTop + arrive * (cardH + 20) }}>
        {older.map((o, i) => (
          <div
            key={i}
            style={{
              height: 104,
              marginBottom: 16,
              borderRadius: 24,
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 26px",
              opacity: 0.6,
            }}
          >
            <div>
              <div style={{ color: C.text, fontSize: 28, fontWeight: 700 }}>{o.no}</div>
              <div style={{ color: C.muted, fontSize: 24 }}>{o.label}</div>
            </div>
            <div style={{ color: C.muted, fontSize: 24, fontWeight: 600 }}>{o.status}</div>
          </div>
        ))}
      </div>

      {/* pedido novo */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: cardTop,
          height: cardH,
          borderRadius: 30,
          background: "#1b1b1d",
          border: `2px solid rgba(61,220,114,${0.15 + 0.35 * arrive})`,
          boxShadow: `0 0 ${50 * arrive}px rgba(61,220,114,0.18)`,
          opacity: arrive,
          transform: `translateY(${(1 - arrive) * -40}px) scale(${0.94 + 0.06 * arrive})`,
          padding: 28,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: C.text, fontSize: 32, fontWeight: 800, whiteSpace: "nowrap" }}>{orderNo}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: status.color, fontSize: 24, fontWeight: 700, whiteSpace: "nowrap" }}>
            <Dot color={status.color} size={14} />
            {status.text}
          </div>
        </div>
        <div style={{ color: C.muted, fontSize: 26, marginTop: 6 }}>{customer}</div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 28 }}>
              <span>
                {it.qty}× {it.name}
              </span>
              <span style={{ color: C.muted }}>{brl(it.qty * it.price)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 30, fontWeight: 800, marginTop: 4 }}>
            <span>Total</span>
            <span>{brl(total)}</span>
          </div>
        </div>
        <div style={{ color: C.muted, fontSize: 25, marginTop: 12 }}>Entrega · {address}</div>

        {/* botões */}
        <div style={{ position: "absolute", left: 28, right: 28, top: btnY - cardTop, height: 100 }}>
          {[
            { label: "Confirmar", done: "Confirmado ✓", at: confirmAt, show: 1 },
            { label: "Marcar entrega", done: "Entrega marcada ✓", at: deliveryAt, show: progress(now, confirmAt + 0.15, confirmAt + 0.4) },
          ].map((b, i) => {
            const done = now >= b.at + 0.1;
            const visible = i === 0 ? 1 - progress(now, confirmAt + 0.15, confirmAt + 0.4) : b.show;
            if (visible <= 0.001) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 50,
                  background: done ? "rgba(61,220,114,0.16)" : C.text,
                  color: done ? C.green : "#0b0b0b",
                  border: done ? `2px solid ${C.green}` : "none",
                  fontSize: 34,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: visible,
                  transform: `scale(${1 - 0.04 * progress(now, b.at - 0.05, b.at + 0.08)})`,
                }}
              >
                {done ? b.done : b.label}
              </div>
            );
          })}
        </div>
      </div>
      <TapRing x={w / 2} y={btnY + 50} t={(now - confirmAt) / 0.45} />
      <TapRing x={w / 2} y={btnY + 50} t={(now - deliveryAt) / 0.45} />
    </div>
  );
};
