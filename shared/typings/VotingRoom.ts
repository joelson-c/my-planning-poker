import { UserSession } from "./UserSession";
import { SystemUser } from "./SystemUser";

export type RoomStatusUsers = {
    votingValue?: string;
    hasVoted: boolean;
    isModerator: boolean;
} & SystemUser;

export type RoomStatusEvent = {
    room: VotingRoom;
    users: RoomStatusUsers[];
};

export type RoomUser = {
    userId: UserSession['userId'];
    roomId: VotingRoom['id'];
    votingValue?: string;
    hasVoted: boolean;
    isModerator: boolean;
};

export type VotingRoom = {
    hasRevealedCards: boolean;
    id: string;
};
