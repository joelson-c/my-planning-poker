import type { RecordModel } from 'pocketbase';

export interface UserRecord extends RecordModel {
    nickname: string;
    hasVoted: boolean;
    observer: boolean;
    room: string;
    vote?: string;
    owner: boolean;
}

export interface RealtimeUser {
    id: string;
    nickname: string;
    hasVoted: boolean;
    observer: boolean;
}
