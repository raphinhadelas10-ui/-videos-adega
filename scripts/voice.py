#!/usr/bin/env python3
"""Gera a narração de um episódio com a voz local Piper (PT-BR) e o arquivo de
tempos por palavra usado pelas legendas e pelas animações.

Uso:
    python3 scripts/voice.py 01-pedido-perdido

Entrada:  episodes/<id>/episode.json  (campo "lines": [{id, at, text}])
Saída:    public/episodes/<id>/voice.wav
          public/episodes/<id>/timings.json

Para trocar pela gravação de uma pessoa, coloque o áudio do roteiro em
episodes/<id>/narracao.* e peça a sincronização (ver README).
"""
import json
import sys
import tarfile
import urllib.request
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
VOICE_URL = (
    "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/"
    "vits-piper-{model}.tar.bz2"
)
SENTENCE_GAP = 0.22   # pausa entre frases dentro da mesma fala (s)
MIN_LINE_GAP = 0.12   # pausa mínima entre falas (s)
BOUNDARY = {" "}
SKIP = {"^", "$", "_"}
PUNCT = set(",.;:!?…")


def ensure_voice(model: str) -> Path:
    vdir = ROOT / "voices" / f"vits-piper-{model}"
    onnx = vdir / f"{model}.onnx"
    if onnx.exists():
        return onnx
    (ROOT / "voices").mkdir(exist_ok=True)
    url = VOICE_URL.format(model=model)
    tmp = ROOT / "voices" / f"{model}.tar.bz2"
    print(f"Baixando voz {model} …")
    urllib.request.urlretrieve(url, tmp)
    with tarfile.open(tmp) as tf:
        tf.extractall(ROOT / "voices", filter="data")
    tmp.unlink()
    return onnx


def chunk_words(chunk, offset_samples):
    """Divide os alinhamentos de fonemas de uma frase em palavras (start/end em amostras)."""
    words = []
    pos = offset_samples
    cur = None
    for al in chunk.phoneme_alignments or []:
        ph, n = al.phoneme, int(al.num_samples)
        if ph in SKIP:
            pass
        elif ph in BOUNDARY:
            if cur:
                words.append(cur)
                cur = None
        elif ph in PUNCT:
            if cur and cur.get("end") is None:
                cur["end"] = pos
        else:
            if cur is None:
                cur = {"start": pos, "end": None}
            else:
                cur["end"] = None
        pos += n
        if cur is not None and ph not in PUNCT and ph not in BOUNDARY and ph not in SKIP:
            cur["_last"] = pos
    if cur:
        words.append(cur)
    for w in words:
        if w.get("end") is None:
            w["end"] = w.get("_last", w["start"])
        w.pop("_last", None)
    return words


def synth_line(voice, syn_config, text, sr):
    from piper import SynthesisConfig  # noqa: F401
    audio_parts, word_spans = [], []
    total = 0
    for i, chunk in enumerate(voice.synthesize(text, syn_config=syn_config, include_alignments=True)):
        if i > 0:
            gap = np.zeros(int(SENTENCE_GAP * sr), dtype=np.int16)
            audio_parts.append(gap)
            total += len(gap)
        word_spans += chunk_words(chunk, total)
        a = chunk.audio_int16_array
        audio_parts.append(a)
        total += len(a)
    audio = np.concatenate(audio_parts)
    tokens = text.split()
    if len(word_spans) != len(tokens):
        print(f"  ! alinhamento com {len(word_spans)} palavras para {len(tokens)} tokens; usando proporção")
        lens = np.array([len(t) for t in tokens], dtype=float)
        edges = np.concatenate([[0], np.cumsum(lens)]) / lens.sum() * total
        word_spans = [{"start": edges[i], "end": edges[i + 1]} for i in range(len(tokens))]
    words = [
        {"w": tok, "start": float(s["start"]) / sr, "end": float(s["end"]) / sr}
        for tok, s in zip(tokens, word_spans)
    ]
    return audio, words


def main():
    if len(sys.argv) < 2:
        sys.exit("uso: voice.py <id-do-episodio>")
    ep_id = sys.argv[1]
    ep = json.loads((ROOT / "episodes" / ep_id / "episode.json").read_text())
    vcfg = ep.get("voice", {})
    model = vcfg.get("model", "pt_BR-faber-medium")
    onnx = ensure_voice(model)

    from piper import PiperVoice, SynthesisConfig

    voice = PiperVoice.load(onnx, config_path=str(onnx) + ".json", include_alignments=True)
    sr = voice.config.sample_rate
    syn = SynthesisConfig(
        length_scale=vcfg.get("lengthScale", 1.0),
        noise_scale=vcfg.get("noiseScale", 0.6),
        noise_w_scale=vcfg.get("noiseW", 0.8),
    )

    duration = float(ep["durationSec"])
    track = np.zeros(int(duration * sr), dtype=np.int16)
    out_lines = []
    prev_end = 0.0
    for line in ep["lines"]:
        cfg = syn if "lengthScale" not in line else SynthesisConfig(
            length_scale=line["lengthScale"], noise_scale=syn.noise_scale, noise_w_scale=syn.noise_w_scale)
        audio, words = synth_line(voice, cfg, line["text"], sr)
        # "at" fixo (s) ou, sem "at", logo após a fala anterior + "gap" (padrão 0.35 s)
        start = max(float(line["at"]), prev_end + MIN_LINE_GAP) if "at" in line else prev_end + float(line.get("gap", 0.35))
        length = len(audio) / sr
        end = start + length
        s0 = int(start * sr)
        if s0 + len(audio) > len(track):
            print(f"  ! fala '{line['id']}' passa do fim do vídeo ({end:.2f}s > {duration}s)")
            audio = audio[: len(track) - s0]
        track[s0 : s0 + len(audio)] = audio
        words = [{**w, "start": round(w["start"] + start, 3), "end": round(w["end"] + start, 3)} for w in words]
        out_lines.append({"id": line["id"], "text": line["text"], "start": round(start, 3),
                          "end": round(end, 3), "words": words})
        flag = "" if "at" not in line or abs(start - line["at"]) < 0.01 else f"  (empurrada de {line['at']}s)"
        print(f"  {line['id']:<10} {start:6.2f}s → {end:6.2f}s  ({length:.2f}s){flag}")
        prev_end = end

    out_dir = ROOT / "public" / "episodes" / ep_id
    out_dir.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out_dir / "voice.wav"), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(track.tobytes())
    (out_dir / "timings.json").write_text(json.dumps(
        {"episode": ep_id, "source": f"piper:{model}", "duration": duration, "lines": out_lines},
        ensure_ascii=False, indent=1))
    print(f"OK → {out_dir.relative_to(ROOT)}/voice.wav + timings.json")


if __name__ == "__main__":
    main()
