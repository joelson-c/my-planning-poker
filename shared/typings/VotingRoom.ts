import { UserSession } from "./UserSession";
import { SystemUser } from "./SystemUser";

export type RoomStatusUsers = {
    id: SystemUser['id'];
    username: SystemUser['username'];
    votingValue?: string;
    hasVoted: boolean;
}

export type RoomStatusEvent = {
    room: VotingRoom;
    users: RoomStatusUsers[];
};

export type RoomUser = {
    userId: UserSession['userId'];
    roomId: VotingRoom['id'];
    votingValue?: string;
    hasVoted: boolean;
};

export type VotingRoom = {
    hasRevealedCards: boolean;
    id: string;
};
