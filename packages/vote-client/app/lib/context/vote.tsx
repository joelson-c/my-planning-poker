import { createContext, useContext, type ReactNode } from 'react';
import type { Room } from '~/types/room';
import type { User } from '~/types/user';
import { useRealtimeState, type RealtimeState } from '../useRealtimeState';

interface VoteContext {
    realtimeState: RealtimeState;
    currentUser: User;
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
    currentUser: User;
}

export function VoteContextProvider({
    children,
    roomId,
    currentUser,
}: VoteContextProviderProps) {
    const realtimeState = useRealtimeState(roomId);

    return (
        <VoteContext.Provider value={{ realtimeState, currentUser }}>
            {children}
        </VoteContext.Provider>
    );
}
