// Renderiza um episódio: node scripts/render.mjs 01-pedido-perdido [--stills 1,5,12]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const id = process.argv[2];
if (!id) throw new Error("uso: node scripts/render.mjs <id-do-episodio> [--stills s1,s2,...]");
const ep = JSON.parse(readFileSync(path.join(root, "episodes", id, "episode.json"), "utf8"));
const stillsArg = process.argv.indexOf("--stills");
const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(",").map(Number) : null;

// No Linux da nuvem usa o Chromium já instalado; no Mac o Remotion baixa o seu.
const localShell = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_BROWSER ?? (existsSync(localShell) ? localShell : null);

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: `ep-${id}`, browserExecutable });

if (stills) {
  const dir = path.join(root, "out", "frames");
  mkdirSync(dir, { recursive: true });
  for (const s of stills) {
    const output = path.join(dir, `${id}-${String(s).replace(".", "_")}s.png`);
    await renderStill({ serveUrl, composition, frame: Math.round(s * composition.fps), output, browserExecutable });
    console.log("still →", path.relative(root, output));
  }
} else {
  const finalLocation = path.join(root, ep.output);
  const outputLocation = finalLocation.replace(/\.mp4$/, ".raw.mp4");
  mkdirSync(path.dirname(outputLocation), { recursive: true });
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 18,
    pixelFormat: "yuv420p",
    colorSpace: "bt709",
    audioCodec: "aac",
    audioBitrate: "192k",
    outputLocation,
    browserExecutable,
    concurrency: 4,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10);
      if (p !== last) { last = p; console.log(`render ${p * 10}%`); }
    },
  });
  // volume padrão de redes sociais (−14 LUFS, pico −1,5 dBTP), vídeo copiado sem perda
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", outputLocation, "-c:v", "copy",
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart", finalLocation]);
  unlinkSync(outputLocation);
  console.log("MP4 →", path.relative(root, finalLocation));
}
