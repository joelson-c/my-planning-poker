import { StateCreator } from 'zustand';
import { RoomUser } from 'my-planit-poker-shared/typings/VotingRoom';

export interface RemoteUserSlice {
    remoteUserData?: RoomUser;
    setRemoteUserData: (userData: RoomUser) => void;
    clearRemoteUserData: () => void;
}

export const createRemoteUserSlice: StateCreator<
    RemoteUserSlice,
    [],
    [],
    RemoteUserSlice
> = (set) => ({
    remoteUserData: undefined,
    clearRemoteUserData: () => set(() => ({ remoteUserData: undefined })),
    setRemoteUserData: (remoteUserData: RoomUser) => set(() => ({ remoteUserData }))
})
