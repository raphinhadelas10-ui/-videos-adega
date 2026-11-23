# As contas que a adega não faz

Vídeos verticais (1080 × 1920, 30 fps) feitos em Remotion para donos de adega, distribuidora e delivery de bebidas.

| Ep. | Tema | Arquivo |
|---|---|---|
| 1 | A mensagem que ficou sem resposta | `out/01-pedido-perdido.mp4` |
| 2 | Sábado de temporada (voz Alex) | `out/02-adega-temporada.mp4` |
| 2 | Sábado de temporada (voz Dora) | `out/02-adega-temporada-dora.mp4` |
| 3 | Do link ao painel | `out/03-do-link-ao-painel.mp4` |
| 4 | Qual adega o João escolhe? | `out/04-joao-escolhe.mp4` |

## Como gerar

```bash
npm install
pip install -r requirements.txt     # voz Piper PT-BR (gratuita, roda local)
npm run build -- 01-pedido-perdido  # voz → efeitos → render → conferência
npm run studio                      # abre o Remotion Studio para ajustar
```

`npm run build` faz quatro coisas:

1. `scripts/voice.py`: gera a narração (`public/episodes/<id>/voice.wav`) e os tempos de cada palavra (`timings.json`). A voz é a `pt_BR-faber-medium` do Piper e é baixada sozinha na primeira execução.
2. `scripts/sfx.py`: sintetiza os efeitos discretos em `public/sfx/`.
3. `scripts/render.mjs`: renderiza o MP4 (H.264 + AAC). Com `--stills 1.5,13,31`, gera só quadros PNG para revisão.
4. `scripts/check.mjs`: confere resolução, fps, duração, áudio, volume (LUFS) e picos.

## Estrutura

```
episodes/<id>/episode.json   roteiro: cenas (s), falas com horário, substituições de legenda
src/episodes/<id>.tsx        animação do episódio (sincronizada pelas palavras da narração)
src/episodes/registry.ts     lista de episódios → composições "ep-<id>"
src/components/              peças reutilizáveis: Person, Counter, Shelf, MiniPhone, Clock,
                             ChatList, OrderPanel, PhoneFrame,
                             Bubble, Card, Headline, SeriesTag, Calendar, CatalogPhone,
                             Captions, Scene, Sfx
src/theme.ts                 cores, fonte (Inter) e zona segura do TikTok
```

### Sincronização

As animações não usam horários fixos. Elas pegam o momento de cada palavra falada:

```ts
const cue = makeCues(timings);
cue.word("conta3", "mil")   // instante em que a voz diz "mil" → R$ 1.800 aparece
```

Se você mudar o texto ou a voz, tudo se reposiciona sozinho.

### Legendas

As legendas saem de `timings.json`, com destaque palavra por palavra. Use `captionReplace` para trocar a forma falada pela forma escrita (ex.: `"mil e oitocentos reais": "R$ 1.800"`).

### Zona segura

Textos e personagens ficam entre x 90–940 e y 210–1480. Fora disso aparecem os botões e a descrição do TikTok.

## Próximo episódio

1. Copie `episodes/01-pedido-perdido/episode.json` para `episodes/02-<tema>/` e edite o roteiro.
2. Crie `src/episodes/ep02-<tema>.tsx` reaproveitando os componentes e registre em `registry.ts`.
3. Rode `npm run build -- 02-<tema>`.

## Usar uma gravação própria

Se preferir a sua voz no lugar do Piper, grave um único áudio lendo o roteiro e coloque em `episodes/<id>/narracao.*`. A sincronização é refeita a partir dele: o `voice.wav` e o `timings.json` são substituídos, e as cenas e legendas acompanham.
