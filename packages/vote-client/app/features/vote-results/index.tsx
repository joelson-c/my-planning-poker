import { RepositoryBanner } from '~/components/repository/banner';
import { ResultHeader } from './ResultHeader';
import { ResultIndividualVotes } from './ResultIndividualVotes';
import { ResultSummary } from './ResultSummary';
import { ResultVoteDistribution } from './ResultVoteDistribution';
import type { Route } from './+types';
import { useRoom } from '~/lib/useRoom';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';
import { getCurrentUser } from '~/lib/user.server';
import { redirect } from 'react-router';

export function meta() {
    return [{ title: 'Planning Poker Results' }];
}

export async function loader({ params, context }: Route.LoaderArgs) {
    const { backend } = context;
    const { roomId } = params;

    if (!backend.authStore.isValid) {
        throw new UnauthorizedError();
    }

    const currentUser = await getCurrentUser(backend);
    if (!currentUser) {
        throw new UnauthorizedError();
    }

    const roomWithStateOnly = await backend
        .collection('voteRooms')
        .getOne(currentUser.room, { fields: 'state, id' });

    if (roomWithStateOnly.state === 'VOTING') {
        return redirect(`/room/${roomWithStateOnly.id}`);
    }

    const roomUsers = await backend.collection('voteUsers').getFullList({
        filter: backend.filter('room={:roomId}', { roomId }),
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
        voteResult: {
            distribution,
            total,
            votesByUser,
            average,
            mediam,
        },
        currentUser,
    };
}

export default function VoteResults({
    loaderData: { currentUser, voteResult },
    params: { roomId },
}: Route.ComponentProps) {
    const { room } = useRoom(roomId);

    if (!room) {
        return <p>Loading..</p>;
    }

    return (
        <main className="container mx-auto p-4">
            <ResultHeader room={room} currentUser={currentUser} />
            <RepositoryBanner />
            <div className="grid gap-6 md:grid-cols-2">
                <ResultVoteDistribution voteResult={voteResult} />
                <ResultSummary voteResult={voteResult} />
                <ResultIndividualVotes voteResult={voteResult} />
            </div>
        </main>
    );
}
