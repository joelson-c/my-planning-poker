import { SystemUser } from "my-planit-poker-shared/typings/SystemUser";
import { VotingRoom } from "my-planit-poker-shared/typings/VotingRoom";
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

type SystemUserWithoutId = Omit<SystemUser, 'id'>;

type UserData = {
    userData: SystemUserWithoutId;
    setUserData: (data: SystemUserWithoutId) => void;
    roomId?: VotingRoom['id'];
    setRoomId: (roomId?: VotingRoom['id']) => void;
}

type SavedUserData = {
    username: SystemUser['username'];
    isObserver: SystemUser['isObserver'];
}

export const UserContext = createContext<UserData>({} as UserData);

export default function LocalUserDataContext({ children }: PropsWithChildren) {
    const [savedData, setSavedData] = useLocalStorage<SavedUserData | undefined>('savedData', undefined);

    const [userData, setUserData] = useState<SystemUserWithoutId>({
        username: savedData?.username || '',
        isObserver: (savedData && savedData.isObserver) || false
    });
    const [roomId, setRoomId] = useState<VotingRoom['id'] | undefined>();

    useEffect(() => {
        setSavedData({
            username: userData.username || '',
            isObserver: userData.isObserver
        });
    }, [setSavedData, userData]);

    return (
        <UserContext.Provider value={{
            userData,
            setUserData,
            roomId,
            setRoomId
        }}>
            {children}
        </UserContext.Provider>
    )
}
