import type { Metadata } from "next";

import { PlayClient } from "./play-client";

export const metadata: Metadata = {
  title: "Jogar · SPG",
  description: "Protótipo offline em Phaser — quarto de estudos",
};

export default function PlayPage() {
  return <PlayClient />;
}
