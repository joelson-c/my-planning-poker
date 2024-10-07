import type { VotingUser } from "../../../voting/user";

export interface UserJoinedBroadcast {
  type: "user_joined_broadcast";
  userId: VotingUser["id"];
  nickname: VotingUser["nickname"];
  isAdmin: VotingUser["isAdmin"];
  isObserver: VotingUser["isObserver"];
}
