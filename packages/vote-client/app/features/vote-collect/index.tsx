import type { Route } from './+types';
import { data, redirect } from 'react-router';
import { commitSession, getSession } from '~/lib/session.server';
import { useHeartbeat } from '../../lib/useHeartbeat';
import { VotingActionList } from './VotingActionList';
import { VotingCardList } from './card/VotingCardList';
import { VotingHeader } from './VotingHeader';
import { VotingUserList } from './user/VotingUserList';
import { useRoom } from '~/lib/useRoom';
import { getCurrentUser } from '~/lib/user.server';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';
import { VotingUserItem } from './user/VotingUserItem';
import { useMemo } from 'react';

export function meta() {
    return [{ title: 'Planning Poker Room' }];
}

export async function loader({
    request,
    context: { backend },
}: Route.LoaderArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const currentUser = await getCurrentUser(backend);
    if (!currentUser) {
        throw new UnauthorizedError();
    }

    const roomWithStateOnly = await backend
        .collection('vote_rooms')
        .getOne(currentUser.room, { fields: 'state, id' });

    if (roomWithStateOnly.state === 'REVEAL') {
        return redirect(`/room/${roomWithStateOnly.id}/result`);
    }

    return data(
        {
            currentUserId: currentUser.id,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}

export default function VoteCollect({
    loaderData: { currentUserId },
    params: { roomId },
}: Route.ComponentProps) {
    const { room, users } = useRoom(roomId);
    useHeartbeat(roomId);

    const myUser = useMemo(() => {
        if (!users) {
            return null;
        }

        return users.find((user) => user.id === currentUserId);
    }, [users, currentUserId]);

    if (!room) {
        return <p>Loading..</p>;
    }

    return (
        <main className="container mx-auto p-4 min-h-screen">
            <VotingHeader room={room} />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col w-full">
                    <VotingCardList room={room} />
                    {myUser?.admin && <VotingActionList room={room} />}
                </div>
                <VotingUserList>
                    {users?.map((user) => {
                        const isMyself = user.id === currentUserId;

                        return (
                            <VotingUserItem
                                key={[user.id, user.admin].join('-')}
                                user={user}
                                isMyself={isMyself}
                                showAdminActions={myUser?.admin}
                            />
                        );
                    })}
                </VotingUserList>
            </div>
        </main>
    );
}
