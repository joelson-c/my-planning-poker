import { PropsWithChildren, createContext, useState } from "react";

type UserData = {
    username?: string;
    setUsername: (value: string) => void;
    isObserver: boolean;
    setIsObserver: (value: boolean) => void;
}

export const UserContext = createContext<UserData>({} as UserData);

export default function UserDataContext({ children }: PropsWithChildren) {
    const [username, setUsername] = useState<string | undefined>();
    const [isObserver, setIsObserver] = useState(false);

    return (
        <UserContext.Provider value={{ username, setUsername, isObserver, setIsObserver }}>
            {children}
        </UserContext.Provider>
    )
}
