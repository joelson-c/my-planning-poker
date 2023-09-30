import { StateCreator } from 'zustand';
import { RoomUser } from 'my-planit-poker-shared/typings/VotingRoom';
import { useRootStore } from '../rootStore';

export interface MyRemoteUserSlice {
    getMyRemoteUser: () => RoomUser | null;
}

export const createMyRemoteUserSlice: StateCreator<
    MyRemoteUserSlice,
    [],
    [],
    MyRemoteUserSlice
> = () => ({
    getMyRemoteUser: () => {
        const users = useRootStore.getState().roomUsers;
        const myUserId = useRootStore.getState().remoteUserData?.userId;
        if (!users || !myUserId) {
            return null;
        }

        return users.find((roomUser) => roomUser.userId === myUserId) || null;
    }
})
