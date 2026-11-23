import type React from "react";
import type { EpisodeConfig, EpisodeProps, Timings } from "../lib/timing";
import { Ep01PedidoPerdido } from "./ep01-pedido-perdido";
import ep01 from "../../episodes/01-pedido-perdido/episode.json";
import ep01Timings from "../../public/episodes/01-pedido-perdido/timings.json";
import { Ep02AdegaTemporada } from "./ep02-adega-temporada";
import ep02 from "../../episodes/02-adega-temporada/episode.json";
import ep02Timings from "../../public/episodes/02-adega-temporada/timings.json";
import ep02Dora from "../../episodes/02-adega-temporada-dora/episode.json";
import ep02DoraTimings from "../../public/episodes/02-adega-temporada-dora/timings.json";
import { Ep03DoLinkAoPainel } from "./ep03-do-link-ao-painel";
import ep03 from "../../episodes/03-do-link-ao-painel/episode.json";
import ep03Timings from "../../public/episodes/03-do-link-ao-painel/timings.json";
import { Ep04JoaoEscolhe } from "./ep04-joao-escolhe";
import ep04 from "../../episodes/04-joao-escolhe/episode.json";
import ep04Timings from "../../public/episodes/04-joao-escolhe/timings.json";
import { Ep05AntesDoOi } from "./ep05-antes-do-oi";
import ep05 from "../../episodes/05-antes-do-oi/episode.json";
import ep05Timings from "../../public/episodes/05-antes-do-oi/timings.json";

export type EpisodeEntry = {
  component: React.FC<EpisodeProps>;
  episode: EpisodeConfig;
  timings: Timings;
};

// Para um novo episódio: crie episodes/<id>/episode.json, gere a voz
// (npm run voice -- <id>), escreva src/episodes/<id>.tsx e registre aqui.
export const EPISODES: EpisodeEntry[] = [
  { component: Ep01PedidoPerdido, episode: ep01 as EpisodeConfig, timings: ep01Timings as Timings },
  { component: Ep02AdegaTemporada, episode: ep02 as EpisodeConfig, timings: ep02Timings as Timings },
  // mesma animação, voz Dora
  { component: Ep02AdegaTemporada, episode: ep02Dora as EpisodeConfig, timings: ep02DoraTimings as Timings },
  { component: Ep03DoLinkAoPainel, episode: ep03 as EpisodeConfig, timings: ep03Timings as Timings },
  { component: Ep04JoaoEscolhe, episode: ep04 as EpisodeConfig, timings: ep04Timings as Timings },
  { component: Ep05AntesDoOi, episode: ep05 as EpisodeConfig, timings: ep05Timings as Timings },
];
