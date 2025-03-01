import { createContext, useContext, type ReactNode } from 'react';
import type { Room } from '~/types/room';
import type { RealtimeUser, UserRecord } from '~/types/user';
import { useRealtimeState, type RealtimeState } from '../useRealtimeState';

interface VoteContext extends RealtimeState {
    roomId: string;
    currentUser: UserRecord;
    kickUser: (targetUser: string) => void;
    revealRoom: () => void;
    resetRoom: () => void;
}

const VoteContext = createContext({} as VoteContext);

export function useVoteContext() {
    const context = useContext(VoteContext);
    if (!context) {
        throw new Error(
            'useVoteContext must be used within a VoteContextProvider',
        );
    }

    return context;
}

interface VoteContextProviderProps {
    children: ReactNode;
    roomId: Room['id'];
    currentUser: UserRecord;
    initialUsers: RealtimeUser[];
}

export function VoteContextProvider({
    children,
    roomId,
    currentUser,
    initialUsers,
}: VoteContextProviderProps) {
    const realtimeState = useRealtimeState(roomId, initialUsers);

    return (
        <VoteContext.Provider value={{ ...realtimeState, roomId, currentUser }}>
            {children}
        </VoteContext.Provider>
    );
}
