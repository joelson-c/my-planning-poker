import type { Route } from './+types';
import { redirect } from 'react-router';
import { VotingHeader } from './ongoing/header';
import { VotingCardList } from './ongoing/card/list';
import { VotingActionList } from './ongoing/actionList';
import { VotingUserList } from './ongoing/user/list';

export async function loader({ params, context }: Route.LoaderArgs) {
    const { backend } = context;

    if (!backend.authStore.isValid) {
        return redirect('/?roomId=' + params.roomId);
    }

    const room = await backend
        .collection('vote_rooms')
        .getOne(params.roomId, { expand: 'users' });

    return {
        room,
    };
}

export default function VotingIndex({ loaderData }: Route.ComponentProps) {
    const { room } = loaderData;

    return (
        <main className="container mx-auto p-4 min-h-screen">
            <VotingHeader room={room} />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col w-full">
                    <VotingCardList room={room} />
                    <VotingActionList room={room} />
                </div>
                <VotingUserList />
            </div>
        </main>
    );
}
