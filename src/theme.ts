// Identidade visual da série — fundo quase preto, brilho branco discreto,
// verde para resultado e vermelho apenas quando o pedido se perde.
export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

export const C = {
  bg: "#060606",
  bgLift: "#111111",
  card: "rgba(28, 28, 30, 0.92)",
  cardBorder: "rgba(255, 255, 255, 0.10)",
  bubble: "#2a2a2c",
  text: "#f5f5f5",
  muted: "#9a9a9a",
  dim: "#5c5c5c",
  cell: "#161616",
  green: "#3ddc72",
  greenGlow: "rgba(61, 220, 114, 0.45)",
  red: "#ff4d4d",
  redGlow: "rgba(255, 77, 77, 0.45)",
  white: "#ffffff",
  glow: "rgba(255, 255, 255, 0.28)",
} as const;

export const FONT = "Inter, 'Inter Display', system-ui, sans-serif";

// Zona segura para a interface do TikTok (botões à direita, descrição embaixo).
export const SAFE = {
  top: 210,
  bottom: 1480, // abaixo disto ficam descrição/música do TikTok
  left: 90,
  right: 940, // à direita ficam os botões de curtir/comentar
  captionsY: 1330, // centro vertical das legendas
} as const;

export const SAFE_CENTER_X = (SAFE.left + SAFE.right) / 2;
