import { createContext, useContext, type ReactNode } from 'react';
import type { VoteResult } from '~/types/voteResult';

const VoteResultContext = createContext({} as VoteResult);

export function useVoteResultContext() {
    const context = useContext(VoteResultContext);
    if (!context) {
        throw new Error(
            'useVoteContext must be used within a VoteContextProvider',
        );
    }

    return context;
}

interface VoteResultContextProviderProps {
    children: ReactNode;
    result: VoteResult;
}

export function VoteResultContextProvider({
    children,
    result,
}: VoteResultContextProviderProps) {
    return (
        <VoteResultContext.Provider value={{ ...result }}>
            {children}
        </VoteResultContext.Provider>
    );
}
