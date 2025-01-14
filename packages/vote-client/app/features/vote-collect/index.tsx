import type { Route } from './+types';
import { data, redirect } from 'react-router';
import { commitSession, getSession } from '~/lib/session.server';
import { VotingUserList } from './user/VotingUserList';
import { useRoom } from '~/lib/useRoom';
import { getCurrentUser } from '~/lib/user.server';
import { useHeartbeat } from '~/lib/useHeartbeat';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { TypographyH2 } from '~/components/ui/typography';
import { VotingCard } from './card/VotingCard';

export function meta() {
    return [{ title: 'Planning Poker Room' }];
}

export async function loader({
    request,
    context: { backend },
    params: { roomId },
}: Route.LoaderArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const currentUser = await getCurrentUser(backend);
    if (!currentUser) {
        return redirect(`/join/${roomId}`);
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

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                <Card className="flex flex-col w-full">
                    <CardHeader>
                        <CardTitle>
                            <TypographyH2>Cast Your Vote</TypographyH2>
                        </CardTitle>
                        <CardDescription>Room ID: {roomId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VotingCard room={room} disabled={isObserver} />
                    </CardContent>
                </Card>
                <Card className="w-full lg:w-1/3">
                    <CardHeader>
                        <CardTitle>Users in Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VotingUserList
                            users={users}
                            currentUserId={currentUserId}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
