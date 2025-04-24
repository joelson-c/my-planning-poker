import { FullPageLoader } from '~/components/FullPageLoader';
import type { Route } from './+types';
import { redirect } from 'react-router';
import type { LoginSchemas } from '~/components/room-login/schema';
import { useRealtimeRoom } from '~/lib/useRealtimeRoom';
import type { Presence } from '~/lib/realtimeWorker/messages';
import { Header } from './Header';
import { VoteCard } from './VoteCard';
import { RepositoryBanner } from '~/components/repository/RepositoryBanner';
import { UserCard } from './UserCard';
import { ResultCard } from './ResultCard';

export function meta() {
    return [{ title: 'Planning Poker Room' }];
}

export async function clientLoader({
    params: { roomId },
}: Route.ClientLoaderArgs) {
    const joinData = localStorage.getItem('joinData');
    if (!joinData) {
        return redirect(`/join/${roomId}`);
    }

    return JSON.parse(joinData) as LoginSchemas;
}

export default function VoteCollect({
    params: { roomId },
    loaderData: { nickname, isObserver },
}: Route.ComponentProps) {
    const {
        isConnected,
        presence,
        vote,
        status,
        result,
        dispatchVote,
        dispatchReveal,
        dispatchReset,
    } = useRealtimeRoom({
        joinData: { nickname, roomId, isObserver },
    });

    if (!isConnected) {
        return <FullPageLoader message="Connecting..." />;
    }

    const hasRevealed = status === 'reveal';

    function onUserRemove(user: Presence) {}

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            <div className="flex flex-col w-full gap-6">
                <Header
                    roomId={roomId}
                    status={status}
                    onReset={dispatchReset}
                    onReveal={dispatchReveal}
                />
                {hasRevealed && <RepositoryBanner />}
                {!hasRevealed && (
                    <VoteCard currentVote={vote} onVote={dispatchVote} />
                )}
                {hasRevealed && result && <ResultCard result={result} />}
            </div>
            {!hasRevealed && (
                <UserCard users={presence} onUserRemove={onUserRemove} />
            )}
        </div>
    );
}
