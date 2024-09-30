import type { VotingCard } from "@planningpoker/doamin-models/voting/card";
import { atom } from "jotai";
import { voteAction } from "../realtime/vote";

const cardAtom = atom<VotingCard | null>(null);

export const selectedCardAtom = atom(
  (get) => get(cardAtom),
  async (get, set, card: VotingCard) => {
    const previousCard = get(cardAtom);
    set(cardAtom, card);

    try {
      await set(voteAction, card);
    } catch (error) {
      console.error(error);
      set(cardAtom, previousCard);
    }
  }
);
