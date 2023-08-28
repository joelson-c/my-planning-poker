import { PropsWithChildren, createContext, useState } from "react";

type UserData = {
    username?: string;
    setUsername: (value: string) => void;
}

export const UserContext = createContext<UserData>({} as UserData);

export default function UserDataContext({ children }: PropsWithChildren) {
    const [username, setUsername] = useState<string | undefined>();

    return (
        <UserContext.Provider value={{ username, setUsername }}>
            {children}
        </UserContext.Provider>
    )
}
