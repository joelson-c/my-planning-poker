import type { VotingCardVariants } from "@planningpoker/domain-models/voting/room";

export function useVotingCards(variant: VotingCardVariants): string[] {
  switch (variant) {
    case "fibonacci":
      return ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89"];

    case "sizes":
      return ["S", "M", "L", "XL"];

    default:
      throw new Error(`Invalid card variant: ${variant}`);
  }
}
