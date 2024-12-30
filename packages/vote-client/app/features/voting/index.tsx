import type { Room } from '~/types/room';
import type { Route } from './+types';
import { VotingActionList } from './ongoing/actionList';
import { VotingCardList } from './ongoing/card/list';
import { VotingHeader } from './ongoing/header';
import { VotingUserList } from './ongoing/user/list';

export async function loader({ params }: Route.LoaderArgs) {
    const room = {} as Room;

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
