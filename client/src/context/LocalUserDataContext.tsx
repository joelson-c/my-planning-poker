import { VotingRoom } from "my-planit-poker-shared/typings/VotingRoom";
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

type UserData = {
    username?: string;
    setUsername: (value: string) => void;
    isObserver: boolean;
    setIsObserver: (value: boolean) => void;
    roomId?: VotingRoom['id'];
    setRoomId: (roomId?: VotingRoom['id']) => void;
}

export const UserContext = createContext<UserData>({} as UserData);

export default function LocalUserDataContext({ children }: PropsWithChildren) {
    const [savedUsername, setSavedUsername] = useLocalStorage<string | undefined>('username', undefined);

    const [username, setUsername] = useState<string | undefined>(savedUsername);
    const [isObserver, setIsObserver] = useState(false);
    const [roomId, setRoomId] = useState<VotingRoom['id'] | undefined>();

    useEffect(() => {
        if (!username) {
            return;
        }

        setSavedUsername(username);
    }, [setSavedUsername, username]);


    return (
        <UserContext.Provider value={{
            username,
            setUsername,
            isObserver,
            setIsObserver,
            roomId,
            setRoomId
        }}>
            {children}
        </UserContext.Provider>
    )
}
