import type { Route } from './+types';
import { data, redirect } from 'react-router';
import { commitSession, getSession } from '~/lib/session.server';
import { VotingActionList } from './VotingActionList';
import { VotingCardList } from './card/VotingCardList';
import { VotingUserList } from './user/VotingUserList';
import { useRoom } from '~/lib/useRoom';
import { getCurrentUser } from '~/lib/user.server';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';
import { VotingUserItem } from './user/VotingUserItem';
import { useHeartbeat } from '~/lib/useHeartbeat';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { TypographyH2 } from '~/components/ui/typography';

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
        .collection('voteRooms')
        .getOne(currentUser.room, { fields: 'state, id' });

    if (roomWithStateOnly.state === 'REVEAL') {
        return redirect(`/room/${roomWithStateOnly.id}/result`);
    }

    return data(
        {
            currentUserId: currentUser.id,
            isObserver: currentUser.observer,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}

export default function VoteCollect({
    loaderData: { currentUserId, isObserver },
    params: { roomId },
}: Route.ComponentProps) {
    const { room, users } = useRoom(roomId);
    useHeartbeat();

    if (!room) {
        return <p>Loading..</p>;
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-8">
                <Card className="flex flex-col w-full pt-6">
                    <CardHeader>
                        <CardTitle>
                            <TypographyH2>Cast Your Vote</TypographyH2>
                        </CardTitle>
                        <CardDescription>Room ID: {roomId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VotingCardList room={room} disabled={isObserver} />
                        <Separator className="my-6" />
                        <VotingActionList room={room} />
                    </CardContent>
                </Card>
                <VotingUserList>
                    {users?.map((user) => {
                        const isMyself = user.id === currentUserId;

                        return (
                            <VotingUserItem
                                key={user.id}
                                user={user}
                                isMyself={isMyself}
                            />
                        );
                    })}
                </VotingUserList>
            </div>
        </>
    );
}
