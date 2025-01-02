import type { RecordModel } from 'pocketbase';

export interface User extends RecordModel {
    nickname: string;
    admin: boolean;
    vote?: string;
    hasVoted: boolean;
    observer: boolean;
    internal_nickname: string;
}
