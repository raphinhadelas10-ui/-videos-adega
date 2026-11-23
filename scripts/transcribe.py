#!/usr/bin/env python3
"""Usa uma GRAVAÇÃO de narração (em vez de voz sintética) e gera os tempos por palavra.

Uso:
    python3 scripts/transcribe.py <id-do-episodio>

Requer faster-whisper (pip install faster-whisper soundfile) e acesso ao Hugging Face
na primeira execução (baixa o modelo "medium"). Lê episodes/<id>/episode.json:
    "voice": { "engine": "recording", "file": "episodes/<id>/narracao.m4a" },
    "fixes": { "palavra errada": "palavra certa" }   # correções da transcrição
Saída: public/episodes/<id>/voice.wav e public/episodes/<id>/timings.json
(as falas viram linhas l0, l1, … e as cenas usam cue.at("palavra"), que procura no texto inteiro).
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    ep_id = sys.argv[1]
    ep = json.loads((ROOT / "episodes" / ep_id / "episode.json").read_text())
    src = ROOT / ep["voice"]["file"]
    out = ROOT / "public" / "episodes" / ep_id
    out.mkdir(parents=True, exist_ok=True)
    wav = out / "voice.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ac", "1", "-ar", "48000", str(wav)], check=True)

    import soundfile as sf
    from faster_whisper import WhisperModel

    audio16 = out / "_asr16k.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ac", "1", "-ar", "16000", str(audio16)], check=True)
    audio, _ = sf.read(str(audio16), dtype="float32")
    audio16.unlink()
    model = WhisperModel(ep["voice"].get("asrModel", "medium"), device="cpu", compute_type="int8")
    segs, _ = model.transcribe(audio, language="pt", word_timestamps=True, beam_size=5)

    fixes = ep.get("fixes", {})
    lines = []
    for i, s in enumerate(segs):
        words = []
        for w in s.words:
            tok = w.word.strip()
            # junta "3" + ".600" → "3.600"
            if words and tok[:1] in ".," and tok[1:2].isdigit():
                words[-1]["w"] += tok
                words[-1]["end"] = round(w.end, 3)
                continue
            words.append({"w": tok, "start": round(w.start, 3), "end": round(w.end, 3)})
        text = " ".join(x["w"] for x in words)
        for wrong, right in fixes.items():
            if wrong in text:
                text = text.replace(wrong, right)
                # refaz os tokens mantendo os tempos (mesma quantidade de palavras quando possível)
                nw = text.split()
                if len(nw) == len(words):
                    for x, t in zip(words, nw):
                        x["w"] = t
                else:
                    merged = []
                    j = 0
                    for t in nw:
                        merged.append({"w": t, "start": words[min(j, len(words) - 1)]["start"], "end": words[min(j, len(words) - 1)]["end"]})
                        j += 1
                    words = merged
        lines.append({"id": f"l{i}", "text": text, "start": words[0]["start"], "end": words[-1]["end"], "words": words})
        print(f"  l{i:<3} {words[0]['start']:6.2f}–{words[-1]['end']:6.2f}  {text}")
    (out / "timings.json").write_text(json.dumps({"episode": ep_id, "source": f"gravação:{src.name}", "duration": ep["durationSec"], "lines": lines}, ensure_ascii=False, indent=1))
    print(f"OK → {out.relative_to(ROOT)}/voice.wav + timings.json")


if __name__ == "__main__":
    main()
