import type { RoomSlice } from "./slices/roomSlice";
import type { LocalUserDataSlice } from "./slices/localUserDataSlice";
import type { RemoteUserSlice } from "./slices/remoteUserSlice";
import type { MyRemoteUserSlice } from "./slices/myRemoteUserSlice";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { createRoomSlice } from "./slices/roomSlice";
import { createLocalUserDataSlice } from "./slices/localUserDataSlice";
import { createRemoteUserSlice } from "./slices/remoteUserSlice";
import { createMyRemoteUserSlice } from "./slices/myRemoteUserSlice";

export type StoreState = RoomSlice &
    LocalUserDataSlice &
    RemoteUserSlice &
    MyRemoteUserSlice;

export const useRootStore = create<
    StoreState,
    [
        ["zustand/devtools", never],
        ["zustand/immer", never],
        ["zustand/persist", Omit<LocalUserDataSlice, "setLocalUserData">],
    ]
>(
    devtools(
        immer(
            persist(
                (...args) => ({
                    ...createRoomSlice(...args),
                    ...createLocalUserDataSlice(...args),
                    ...createRemoteUserSlice(...args),
                    ...createMyRemoteUserSlice(...args),
                }),
                {
                    name: "userData",
                    storage: createJSONStorage(() => localStorage),
                    partialize: (state) => ({
                        localUserData: state.localUserData,
                    }),
                },
            ),
        ),
    ),
);
