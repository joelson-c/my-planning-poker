import type { VotingUser } from "@planningpoker/domain-models/voting/user";
import { atom } from "jotai";

export interface LocalVotingUser {
  nickname: VotingUser["nickname"];
  isObserver: VotingUser["isObserver"];
  isAdmin?: VotingUser["isAdmin"];
}

export const localVotingUserAtom = atom<LocalVotingUser | null>(null);
