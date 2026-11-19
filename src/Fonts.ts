import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const weights: [string, string][] = [
  ["Regular", "400"],
  ["Medium", "500"],
  ["SemiBold", "600"],
  ["Bold", "700"],
  ["ExtraBold", "800"],
];

export const fontsReady = Promise.all(
  weights.map(([file, weight]) =>
    loadFont({ family: "Inter", url: staticFile(`fonts/Inter-${file}.otf`), weight, format: "opentype" }),
  ),
);
