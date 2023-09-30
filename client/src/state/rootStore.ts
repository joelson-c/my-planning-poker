import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import { RoomSlice, createRoomSlice } from './slices/roomSlice';
import { LocalUserDataSlice, createLocalUserDataSlice } from './slices/localUserDataSlice';
import { RemoteUserSlice, createRemoteUserSlice } from './slices/remoteUserSlice';
import { MyRemoteUserSlice, createMyRemoteUserSlice } from './slices/myRemoteUserSlice';

type StoreState = RoomSlice & LocalUserDataSlice & RemoteUserSlice & MyRemoteUserSlice;

export const useRootStore = create<
    StoreState,
    [
        ["zustand/devtools", never],
        ['zustand/immer', never],
        ["zustand/persist", Omit<LocalUserDataSlice, 'setLocalUserData'>]
    ]
>(
    devtools(
        immer(
            persist((...args) => ({
                ...createRoomSlice(...args),
                ...createLocalUserDataSlice(...args),
                ...createRemoteUserSlice(...args),
                ...createMyRemoteUserSlice(...args)
            }), {
                name: 'userData',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({ localUserData: state.localUserData }),
            })
        )
    )
);
