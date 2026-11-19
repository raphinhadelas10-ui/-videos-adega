import React from "react";
import { Composition } from "remotion";
import "./Fonts";
import { EPISODES } from "./episodes/registry";
import { VIDEO } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    {EPISODES.map(({ component, episode, timings }) => (
      <Composition
        key={episode.id}
        id={`ep-${episode.id}`}
        component={component}
        durationInFrames={Math.round(episode.durationSec * VIDEO.fps)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{ episode, timings }}
      />
    ))}
  </>
);
