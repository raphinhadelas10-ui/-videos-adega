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

    # tecla de teclado de celular
    tt = t(0.045)
    save("key", env(lowpass(rng.standard_normal(len(tt)), 3) + 0.5 * np.sin(2 * np.pi * 2400 * tt), 0.0005, 0.008), 0.3)
    # apagar (backspace): duas teclas mais graves
    tt = t(0.2)
    x = np.zeros(len(tt))
    for k in (0.0, 0.09):
        i = int(k * SR)
        b = env(lowpass(rng.standard_normal(int(0.04 * SR)), 5) + 0.5 * np.sin(2 * np.pi * 1300 * t(0.04)), 0.0005, 0.01)
        x[i:i + len(b)] += b
    save("backspace", x, 0.3)
    # vibração de celular no balcão
    tt = t(0.42)
    buzz = np.sin(2 * np.pi * 170 * tt) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 22 * tt)))
    buzz *= np.where(tt < 0.18, 1, np.where(tt > 0.24, 1, 0))
    save("buzz", env(lowpass(buzz, 4), 0.01, 0.3), 0.4)
    # ding limpo
    tt = t(1.0)
    ding = np.sin(2 * np.pi * 1568 * tt) + 0.35 * np.sin(2 * np.pi * 3136 * tt) + 0.15 * np.sin(2 * np.pi * 4704 * tt)
    save("ding", env(ding, 0.002, 0.35), 0.45)

    # clique seco (abrir resultado/site)
    tt = t(0.03)
    save("click", env(lowpass(rng.standard_normal(len(tt)), 2) + 0.6 * np.sin(2 * np.pi * 3200 * tt), 0.0003, 0.004), 0.4)
    # clique firme (Confirmar pedido)
    tt = t(0.07)
    save("click_firm", env(lowpass(rng.standard_normal(len(tt)), 3) + np.sin(2 * np.pi * 900 * tt) + 0.5 * np.sin(2 * np.pi * 2200 * tt), 0.0005, 0.018), 0.5)
    # pop (item entra no carrinho)
    tt = t(0.12)
    f = 500 + 900 * (tt / tt[-1])
    save("pop", env(np.sin(2 * np.pi * np.cumsum(f) / SR), 0.002, 0.035), 0.45)
    # "tim-tim": duas notas ascendentes curtas (confirmação no celular do cliente)
    tt = t(0.45)
    n1 = np.sin(2 * np.pi * 1046.5 * tt) * (tt < 0.16)
    n2 = np.sin(2 * np.pi * 1568.0 * tt) * (tt >= 0.13)
    tone = (n1 + n2) + 0.2 * (np.sin(2 * np.pi * 2093 * tt) * (tt < 0.16) + np.sin(2 * np.pi * 3136 * tt) * (tt >= 0.13))
    e = np.where(tt < 0.13, np.exp(-tt / 0.07), np.exp(-(tt - 0.13) / 0.12))
    save("timtim", tone * e, 0.45)
    # ding do painel: sino com timbre diferente (parciais inarmônicos, mais longo)
    tt = t(1.4)
    bell = sum(a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt / d) for fr, a, d in [(1318.5, 1, 0.6), (3360, 0.35, 0.25), (5270, 0.15, 0.12), (659, 0.25, 0.8)])
    save("ding_panel", env(bell, 0.002, 2.0), 0.45)
    # toque suave (chamada final)
    tt = t(0.9)
    save("soft", env(np.sin(2 * np.pi * 784 * tt) + 0.5 * np.sin(2 * np.pi * 1175 * tt), 0.02, 0.35), 0.3)
    # trilha suave (pad) — 110 s, acordes lentos
    d = 110.0
    tt = t(d)
    chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (130.81, 196.0, 261.63), (196.0, 246.94, 293.66)]
    pad = np.zeros(len(tt))
    seg = 4.0
    for k in range(int(d / seg) + 1):
        a, b = int(k * seg * SR), int(min(d, (k + 1) * seg + 1.0) * SR)
        if a >= len(tt):
            break
        lt = np.arange(b - a) / SR
        shape = np.minimum(1, lt / 1.2) * np.minimum(1, (lt[-1] - lt) / 1.2 + 1e-3)
        for fr in chords[k % 4]:
            pad[a:b] += shape * (np.sin(2 * np.pi * fr * lt) + 0.3 * np.sin(2 * np.pi * 2 * fr * lt + 0.4))
    pad = lowpass(lowpass(pad, 20), 20)
    fade = int(2 * SR)
    pad[:fade] *= np.linspace(0, 1, fade)
    save("bed_soft", pad, 0.5)
    print("OK →", OUT)


if __name__ == "__main__":
    main()
