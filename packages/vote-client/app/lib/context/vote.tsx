import { createContext, useContext, type ReactNode } from 'react';
import type { Room } from '~/types/room';
import type { RealtimeUser, UserRecord } from '~/types/user';
import {
    useRealtimeState,
    type OutboundDispatcher,
    type RealtimeState,
} from '../realtime/useRealtimeState';
import { useRoomStateWatch } from '../realtime/useRoomStateWatch';

interface VoteContext extends RealtimeState {
    roomId: string;
    currentUser: UserRecord;
    outboundDispatcher: OutboundDispatcher;
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
    initialUsers?: RealtimeUser[];
}

export function VoteContextProvider({
    children,
    roomId,
    currentUser,
    initialUsers,
}: VoteContextProviderProps) {
    const realtimeState = useRealtimeState(initialUsers);
    useRoomStateWatch(roomId);

    return (
        <VoteContext.Provider value={{ ...realtimeState, roomId, currentUser }}>
            {children}
        </VoteContext.Provider>
    );
}
