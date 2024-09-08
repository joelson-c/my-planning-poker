import type { SystemUser } from "./SystemUser";
import type { UserSession } from "./UserSession";

export type RoomStatusEvent = {
    room: VotingRoom;
    users: RoomUser[];
};

export type Vote = string | number | undefined;

export type RoomUser = {
    userId: UserSession["userId"];
    roomId: VotingRoom["id"];
    votingValue?: Vote;
    hasVoted: boolean;
    isModerator: boolean;
    isObserver: boolean;
    username: SystemUser["username"];
};

export type VotingRoom = {
    hasRevealedCards: boolean;
    id: string;
};
