import type { RecordModel } from 'pocketbase';

export interface User extends RecordModel {
    nickname: string;
    hasVoted: boolean;
    observer: boolean;
    room: string;
    vote?: string;
    owner: boolean;
}
