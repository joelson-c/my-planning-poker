import { StateCreator } from 'zustand';
import { SystemUser } from 'my-planit-poker-shared/typings/SystemUser';

type SystemUserWithoutId = Omit<SystemUser, 'id'>;

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
    setLocalUserData: (userData: SystemUserWithoutId) => set(() => ({ localUserData: userData }))
})
