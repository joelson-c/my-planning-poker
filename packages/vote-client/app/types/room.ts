import type { RecordModel } from 'pocketbase';

export type CardType = 'FIBONACCI' | 'SIZES';
export type RoomState = 'VOTING' | 'REVEAL';

export interface Room extends RecordModel {
    cardType: CardType;
    state: RoomState;
    closed: boolean;
    users: string[];
}
