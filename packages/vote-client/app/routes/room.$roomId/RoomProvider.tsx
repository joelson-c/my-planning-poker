import type { Centrifuge, Subscription } from 'centrifuge';
import type { ReactNode } from 'react';
import type { VotingRoom, VotingUser } from '@planningpoker/domain-models';
import { createContext, useContext } from 'react';

interface RoomContextData {
    // Omit date properties due to serialization
    room: Omit<VotingRoom, 'createdAt'>;
    // Omit date properties due to serialization
    user: Omit<VotingUser, 'connectedAt' | 'updatedAt'>;
    client?: Centrifuge;
    subscription?: Subscription;
    isJoined: boolean;
}

const RoomContext = createContext<RoomContextData>({} as RoomContextData);

export function useRoomContext() {
    const context = useContext(RoomContext);

    if (!context) {
        throw new Error('useRoomContext must be used within a RoomProvider');
    }

    return context;
}

interface RoomProviderProps extends RoomContextData {
    children: ReactNode;
}

export function RoomProvider({
    children,
    room,
    user,
    client,
    subscription,
    isJoined,
}: RoomProviderProps) {
    return (
        <RoomContext.Provider
            value={{
                client,
                room,
                user,
                subscription,
                isJoined,
            }}
        >
            {children}
        </RoomContext.Provider>
    );
}
