import { StateCreator } from 'zustand';
import { RoomStatusEvent, VotingRoom } from 'my-planit-poker-shared/typings/VotingRoom';

const DISCONNECTED_PING = 999;

export interface RoomSlice {
    roomMeta?: RoomStatusEvent['room'];
    roomUsers?: RoomStatusEvent['users'];
    connectionPing: number;
    roomId?: VotingRoom['id'];
    updatePing: (newPing?: number) => void;
    updateRoomData: (event: RoomStatusEvent) => void;
    clearRoomData: () => void;
    setRoomId: (roomId: VotingRoom['id']) => void;
}

export const createRoomSlice: StateCreator<
    RoomSlice,
    [],
    [],
    RoomSlice
> = (set) => ({
    roomMeta: undefined,
    roomUsers: undefined,
    mineUser: undefined,
    connectionPing: DISCONNECTED_PING,
    updatePing: (newPing) => set(() => ({ connectionPing: newPing ? newPing : DISCONNECTED_PING })),
    clearRoomData: () => set(() => ({ roomMeta: undefined, roomUsers: undefined, roomId: undefined })),
    setRoomId: (roomId: VotingRoom['id']) => set(() => ({ roomId })),
    updateRoomData: (event: RoomStatusEvent) => set(() => {
        return {
            roomMeta: event.room,
            roomUsers: event.users
        };
    }),
})
