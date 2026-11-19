// Pipeline completo: voz → efeitos → render → conferência
// node scripts/build.mjs 01-pedido-perdido [--skip-voice]
import { execFileSync } from "node:child_process";

const id = process.argv[2];
if (!id) throw new Error("uso: node scripts/build.mjs <id-do-episodio> [--skip-voice]");
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });
if (!process.argv.includes("--skip-voice")) run("python3", ["scripts/voice.py", id]);
run("python3", ["scripts/sfx.py"]);
run("node", ["scripts/render.mjs", id]);
run("node", ["scripts/check.mjs", id]);
