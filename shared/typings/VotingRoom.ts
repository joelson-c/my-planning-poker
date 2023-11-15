import { SystemUser } from "./SystemUser";
import { UserSession } from "./UserSession";

export type RoomStatusEvent = {
    room: VotingRoom;
    users: RoomUser[];
};

export type RoomUser = {
    userId: UserSession['userId'];
    roomId: VotingRoom['id'];
    votingValue?: string;
    hasVoted: boolean;
    isModerator: boolean;
    isObserver: boolean;
    username: SystemUser['username'];
};

export type VotingRoom = {
    hasRevealedCards: boolean;
    id: string;
};
