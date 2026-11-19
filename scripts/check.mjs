// Confere o MP4 final: node scripts/check.mjs 01-pedido-perdido
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const id = process.argv[2];
const ep = JSON.parse(readFileSync(path.join(root, "episodes", id, "episode.json"), "utf8"));
const timings = JSON.parse(readFileSync(path.join(root, "public", "episodes", id, "timings.json"), "utf8"));
const file = path.join(root, ep.output);

const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString(),
);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = Number(probe.format.duration);
const fps = eval(v.r_frame_rate);

let lufs = null, peak = null;
try {
  const err = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -af ebur128=peak=true -f null - 2>&1 | tail -12`]).toString();
  lufs = Number(err.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]);
  peak = Number(err.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1]);
} catch {}

const lastSpeech = Math.max(...timings.lines.map((l) => l.end));
const checks = [
  ["resolução 1080×1920", v.width === 1080 && v.height === 1920, `${v.width}×${v.height}`],
  ["30 fps", Math.abs(fps - 30) < 0.01, `${fps}`],
  ["H.264 yuv420p", v.codec_name === "h264" && v.pix_fmt === "yuv420p", `${v.codec_name} ${v.pix_fmt}`],
  ["duração", Math.abs(dur - ep.durationSec) < 0.15, `${dur.toFixed(2)}s (alvo ${ep.durationSec}s)`],
  ["áudio AAC", !!a && a.codec_name === "aac", a ? `${a.codec_name} ${a.sample_rate}Hz ${a.channels}ch` : "sem áudio"],
  ["narração termina antes do fim", lastSpeech < ep.durationSec - 0.3, `última fala termina em ${lastSpeech.toFixed(2)}s`],
  ["volume integrado (−18 a −11 LUFS)", lufs !== null && lufs > -18 && lufs < -11, `${lufs} LUFS`],
  ["sem clipping (pico < −0.5 dBFS)", peak !== null && peak < -0.5, `${peak} dBFS`],
];
let ok = true;
for (const [name, pass, info] of checks) {
  console.log(`${pass ? "✔" : "✘"} ${name.padEnd(36)} ${info}`);
  ok &&= pass;
}
console.log(ok ? `\nOK → ${ep.output}` : "\nAlgumas verificações falharam.");
process.exit(ok ? 0 : 1);
