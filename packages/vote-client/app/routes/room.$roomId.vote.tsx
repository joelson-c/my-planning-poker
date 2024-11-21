import { useParams } from '@remix-run/react';
import { VotingActions } from '~/components/voting/actions';
import { VotingCardList } from '~/components/voting/card/list';
import { VotingHeader } from '~/components/voting/header';
import { VotingUserList } from '~/components/voting/user/list';

export default function RoomVote() {
    const { roomId } = useParams();

    return (
        <main className="container mx-auto p-4 min-h-screen">
            <VotingHeader roomId={roomId!} />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col w-full">
                    <VotingCardList />
                    <VotingActions roomId={roomId!} />
                </div>
                <VotingUserList />
            </div>
        </main>
    );
}
