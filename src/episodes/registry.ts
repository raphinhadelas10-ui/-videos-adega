import type React from "react";
import type { EpisodeConfig, EpisodeProps, Timings } from "../lib/timing";
import { Ep01PedidoPerdido } from "./ep01-pedido-perdido";
import ep01 from "../../episodes/01-pedido-perdido/episode.json";
import ep01Timings from "../../public/episodes/01-pedido-perdido/timings.json";
import { Ep02AdegaTemporada } from "./ep02-adega-temporada";
import ep02 from "../../episodes/02-adega-temporada/episode.json";
import ep02Timings from "../../public/episodes/02-adega-temporada/timings.json";

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
];
