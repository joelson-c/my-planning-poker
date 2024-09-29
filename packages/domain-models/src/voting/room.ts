import type { Infer } from "superstruct";
import { object, string, enums } from "superstruct";

export type VotingCardVariants = "fibonacci" | "sizes";
export type VotingRoomState = "voting" | "result" | "closed";

export const VotingRoom = object({
  roomId: string(),
  cardType: enums<string, VotingCardVariants[]>(["fibonacci", "sizes"]),
  state: enums<string, VotingRoomState[]>(["voting", "result", "closed"]),
});

export type VotingRoom = Infer<typeof VotingRoom>;
