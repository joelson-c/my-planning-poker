import type { Route } from './+types';
import { redirect } from 'react-router';
import { VotingUserList } from './user/VotingUserList';
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
import { backendClient } from '~/lib/backend/client';
import { useRoom } from '~/lib/useRoom';
import { useRoomUsers } from '~/lib/useRoomUsers';
import { getCurrentUserRoom } from '~/lib/backend/user';

export function meta() {
    return [{ title: 'Planning Poker Room' }];
}

export async function clientLoader({
    params: { roomId },
}: Route.ClientLoaderArgs) {
    const room = await getCurrentUserRoom(roomId, { fields: 'state, id' });
    if (room.state === 'REVEAL') {
        return redirect(`/room/${room.id}/result`);
    }

    const currentUser = backendClient.authStore.record!;
    return {
        currentUserId: currentUser.id,
        isObserver: currentUser.observer,
        room,
    };
}

export default function VoteCollect({
    loaderData: { currentUserId, isObserver, room: abc },
    params: { roomId },
}: Route.ComponentProps) {
    console.log(abc);
    const room = useRoom(roomId);
    const users = useRoomUsers(roomId, currentUserId);
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
