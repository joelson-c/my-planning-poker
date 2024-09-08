import type { StateCreator } from "zustand";
import type { SystemUser } from "my-planit-poker";

type SystemUserWithoutId = Omit<SystemUser, "id">;

export interface LocalUserDataSlice {
    localUserData?: SystemUserWithoutId;
    setLocalUserData: (userData: SystemUserWithoutId) => void;
}

export const createLocalUserDataSlice: StateCreator<
    LocalUserDataSlice,
    [],
    [],
    LocalUserDataSlice
> = (set) => ({
    localUserData: undefined,
    setLocalUserData: (userData: SystemUserWithoutId) =>
        set(() => ({ localUserData: userData })),
});
