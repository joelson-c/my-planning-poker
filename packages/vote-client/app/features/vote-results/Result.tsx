import type { ReactNode } from 'react';
import type { VoteResult } from '~/types/voteResult';
import { VoteResultContextProvider } from './context';

interface ResultProps {
    children: ReactNode;
    result: VoteResult;
}

export function Result({ children, result }: ResultProps) {
    return (
        <VoteResultContextProvider result={result}>
            <div className="grid gap-6 lg:gap-8 md:grid-cols-2">{children}</div>
        </VoteResultContextProvider>
    );
}
