#!/usr/bin/env python3
"""Sintetiza a biblioteca de efeitos sonoros discretos (sem samples de terceiros).

Uso: python3 scripts/sfx.py   → public/sfx/*.wav
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def env(x, a=0.005, r=0.1):
    n = len(x)
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    tt = np.arange(n) / SR
    e *= np.exp(-tt / r)
    return x * e


def lowpass(x, k=8):
    return np.convolve(x, np.ones(k) / k, mode="same")


def save(name, x, gain=0.5):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    fade = int(0.004 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # mensagem chegando: bolha curta, duas notas
    tt = t(0.22)
    f = np.where(tt < 0.07, 880, 1320)
    save("message", env(np.sin(2 * np.pi * f * tt), 0.003, 0.06), 0.45)

    # tique do calendário: clique macio
    tt = t(0.05)
    save("tick", env(np.sin(2 * np.pi * 1900 * tt) * 0.6 + lowpass(rng.standard_normal(len(tt)), 4) * 0.4, 0.001, 0.012), 0.35)

    # toque na tela
    tt = t(0.06)
    save("tap", env(lowpass(rng.standard_normal(len(tt)), 6) + np.sin(2 * np.pi * 420 * tt), 0.001, 0.015), 0.4)

    # transição: sopro curto de ruído filtrado
    tt = t(0.45)
    n = rng.standard_normal(len(tt))
    k = np.linspace(30, 4, len(tt)).astype(int)
    sw = np.array([n[max(0, i - k[i]):i + 1].mean() for i in range(len(n))])
    shape = np.sin(np.pi * tt / tt[-1]) ** 2
    save("whoosh", sw * shape, 0.3)

    # pedido perdido: nota grave descendente, abafada
    tt = t(0.7)
    f = 220 * np.exp(-tt * 1.4)
    ph = 2 * np.pi * np.cumsum(f) / SR
    save("lost", env(np.sin(ph) + 0.3 * np.sin(2 * ph), 0.01, 0.28), 0.55)

    # revelação do número: brilho ascendente
    tt = t(1.1)
    x = sum(np.sin(2 * np.pi * fr * tt) * np.exp(-tt / (0.35 + i * 0.1)) * (tt > i * 0.06)
            for i, fr in enumerate([523.25, 659.25, 783.99, 1046.5]))
    save("reveal", env(x, 0.01, 0.6), 0.5)

    # pedido recebido: dois tons de confirmação
    tt = t(0.6)
    x = np.sin(2 * np.pi * 784 * tt) * (tt < 0.12) + np.sin(2 * np.pi * 1175 * tt) * (tt >= 0.1)
    save("success", env(x, 0.004, 0.22), 0.45)

    # cliente indo embora: passos leves
    tt = t(0.9)
    x = np.zeros(len(tt))
    for i in range(4):
        s = int((0.05 + i * 0.2) * SR)
        b = env(lowpass(rng.standard_normal(int(0.07 * SR)), 12), 0.002, 0.02)
        x[s:s + len(b)] += b
    save("steps", x, 0.3)
    # trilha de suspense (70 s): drone grave + pulso tipo batimento + ar filtrado
    d = 70.0
    tt = t(d)
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * tt / 9.0)
    drone = (np.sin(2 * np.pi * 55 * tt) + 0.6 * np.sin(2 * np.pi * 82.4 * tt + 0.3)
             + 0.25 * np.sin(2 * np.pi * 110.3 * tt)) * lfo
    air = rng.standard_normal(len(tt))
    for _ in range(3):
        air = np.convolve(air, np.ones(60) / 60, mode="same")
    air *= 0.8 * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 13.0))
    pulse = np.zeros(len(tt))
    beat = env(np.sin(2 * np.pi * 50 * t(0.25)), 0.004, 0.07)
    for k in np.arange(0.5, d, 0.92):
        for off, g in ((0, 1.0), (0.22, 0.6)):
            i = int((k + off) * SR)
            pulse[i:i + len(beat)] += beat[: len(pulse) - i] * g
    bed = 0.55 * drone + 0.25 * air / (np.abs(air).max() + 1e-9) + 0.7 * pulse
    fade = int(2.0 * SR)
    bed[:fade] *= np.linspace(0, 1, fade)
    save("bed_tension", bed, 0.6)

    # impacto grave (momentos de virada)
    tt = t(1.4)
    f = 70 * np.exp(-tt * 0.8)
    ph = 2 * np.pi * np.cumsum(f) / SR
    save("hit", env(np.sin(ph) + 0.4 * lowpass(rng.standard_normal(len(tt)), 30), 0.003, 0.45), 0.6)

    # subida antes da pergunta final
    tt = t(2.0)
    n = lowpass(rng.standard_normal(len(tt)), 6)
    rise = (tt / tt[-1]) ** 2.5
    sw = np.sin(2 * np.pi * np.cumsum(200 + 600 * rise) / SR)
    save("riser", (0.6 * n + 0.4 * sw) * rise, 0.4)
    print("OK →", OUT)


if __name__ == "__main__":
    main()
