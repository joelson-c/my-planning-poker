import type { RecordModel } from 'pocketbase';

export interface User extends RecordModel {
    nickname: string;
    admin: boolean;
    hasVoted: boolean;
    observer: boolean;
    room: string;
    vote?: string;
}
