import type { Route } from './+types';
import { RepositoryBanner } from '~/components/repository/RepositoryBanner';
import { ResultHeader } from './ResultHeader';
import { ResultIndividualVotes } from './ResultIndividualVotes';
import { ResultSummary } from './ResultSummary';
import { ResultVoteDistribution } from './ResultVoteDistribution';
import { useRoom } from '~/lib/useRoom';
import { redirect } from 'react-router';
import { backendClient } from '~/lib/backend/client';
import { useHeartbeat } from '~/lib/useHeartbeat';
import { getCurrentUserRoom } from '~/lib/backend/user';

export function meta() {
    return [{ title: 'Planning Poker Results' }];
}

export async function clientLoader({
    params: { roomId },
}: Route.ClientLoaderArgs) {
    const room = await getCurrentUserRoom(roomId);
    if (room.state === 'VOTING') {
        return redirect(`/room/${room.id}`);
    }

    const roomUsers = await backendClient.collection('voteUsers').getFullList({
        filter: backendClient.filter('room={:roomId}', { roomId }),
    });

    const userWithNonEmptyVotes = roomUsers.filter(
        (user) => typeof user.vote !== 'undefined' && user.vote !== '',
    );

    const total = userWithNonEmptyVotes.length;

    const distribution = userWithNonEmptyVotes.reduce((acc, user) => {
        const currentCount = acc.get(user.vote!) || 0;
        acc.set(user.vote!, currentCount + 1);
        return acc;
    }, new Map<string, number>());

    const votesByUser = roomUsers.reduce((acc, user) => {
        acc.push([user.nickname, user.vote || '-']);
        return acc;
    }, [] as [string, string][]);

    const allVotesValues = Array.from(distribution.keys())
        .filter((vote) => !isNaN(parseInt(vote, 10)))
        .map((vote) => parseInt(vote, 10));

    const average =
        total > 0 ? allVotesValues.reduce((a, b) => a + b) / total : 0;

    const mediam = total > 0 ? allVotesValues.sort()[Math.floor(total / 2)] : 0;

    return {
        room,
        voteResult: {
            distribution,
            total,
            votesByUser,
            average,
            mediam,
        },
    };
}

export default function VoteResults({
    loaderData: { voteResult, room },
}: Route.ComponentProps) {
    // Necessary to watch against room update events and revalidate the page
    useRoom(room.id);
    useHeartbeat();

    return (
        <>
            <ResultHeader room={room} />
            <RepositoryBanner />
            <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
                <ResultVoteDistribution voteResult={voteResult} />
                <ResultSummary voteResult={voteResult} />
                <ResultIndividualVotes voteResult={voteResult} />
            </div>
        </>
    );
}
