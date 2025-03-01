import type { Route } from './+types';
import { redirect } from 'react-router';
import { VotingUserList } from './user/VotingUserList';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { TypographyH2 } from '~/components/ui/typography';
import { getCurrentUserRoom } from '~/lib/backend/user';
import { VoteContextProvider } from '~/lib/context/vote';
import { VotingCardList } from './card/VotingCardList';
import { Separator } from '~/components/ui/separator';
import { VotingActionList } from './VotingActionList';
import { getCurrentUser } from '~/lib/backend/auth';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';

export function meta() {
    return [{ title: 'Planning Poker Room' }];
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
    if (room.state === 'REVEAL') {
        return redirect(`/room/${room.id}/result`);
    }

    return {
        currentUser,
    };
}

export default function VoteCollect({
    loaderData: { currentUser },
    params: { roomId },
}: Route.ComponentProps) {
    return (
        <VoteContextProvider roomId={roomId} currentUser={currentUser}>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                <Card className="flex flex-col w-full">
                    <CardHeader>
                        <CardTitle>
                            <TypographyH2>Cast Your Vote</TypographyH2>
                        </CardTitle>
                        <CardDescription>Room ID: {roomId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VotingCardList />
                        <Separator className="my-6" />
                        <VotingActionList />
                    </CardContent>
                </Card>
                <Card className="w-full lg:w-1/3">
                    <CardHeader>
                        <CardTitle>Users in Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VotingUserList />
                    </CardContent>
                </Card>
            </div>
        </VoteContextProvider>
    );
}
