import type { Route } from './+types';
import { RepositoryBanner } from '~/components/repository/RepositoryBanner';
import { ResultHeader } from './ResultHeader';
import { ResultIndividualVotes } from './ResultIndividualVotes';
import { ResultSummary } from './ResultSummary';
import { ResultVoteDistribution } from './ResultVoteDistribution';
import { redirect } from 'react-router';
import { getCurrentUserRoom } from '~/lib/backend/user';
import { VoteContextProvider } from '~/lib/context/vote';
import { getCurrentUser } from '~/lib/backend/auth';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';
import { Result } from './Result';
import { getVoteResults } from './voteResult';
import { getCachedResult, saveResultToCache } from './voteResultCache.client';

export function meta() {
    return [{ title: 'Planning Poker Results' }];
}

export async function clientLoader({
    params: { roomId },
}: Route.ClientLoaderArgs) {
    let currentUser;
    try {
        currentUser = await getCurrentUser();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw redirect(`/join/${roomId}`);
        }

        throw error;
    }

    const room = await getCurrentUserRoom(currentUser);
    if (room.state === 'VOTING') {
        return redirect(`/room/${room.id}`);
    }

    let voteResult = getCachedResult();
    if (!voteResult) {
        voteResult = saveResultToCache(await getVoteResults(room.id));
    }

    return {
        currentUser,
        voteResult,
    };
}

export default function VoteResults({
    loaderData: { voteResult, currentUser },
    params: { roomId },
}: Route.ComponentProps) {
    return (
        <VoteContextProvider roomId={roomId} currentUser={currentUser}>
            <ResultHeader />
            <RepositoryBanner />
            <Result result={voteResult}>
                <ResultVoteDistribution />
                <ResultSummary />
                <ResultIndividualVotes />
            </Result>
        </VoteContextProvider>
    );
}
