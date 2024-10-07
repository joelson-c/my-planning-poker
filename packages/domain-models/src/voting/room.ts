import type { Infer } from "superstruct";
import { object, string, enums, array } from "superstruct";
import { VotingUser } from "./user";

export type VotingCardVariants = "fibonacci" | "sizes";
export type VotingRoomState = "voting" | "vote_reveal" | "closed";

export const VotingRoom = object({
  id: string(),
  cardType: enums<string, VotingCardVariants[]>(["fibonacci", "sizes"]),
  state: enums<string, VotingRoomState[]>(["voting", "vote_reveal"]),
  users: array(VotingUser),
});

export type VotingRoom = Infer<typeof VotingRoom>;
