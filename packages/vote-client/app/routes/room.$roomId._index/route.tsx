import { json, type ActionFunctionArgs } from '@remix-run/node';
import { create, string } from 'superstruct';
import { VotingActions } from '~/routes/room.$roomId._index/voting/actions';
import { VotingCardList } from '~/routes/room.$roomId._index/voting/card/list';
import { VotingHeader } from '~/routes/room.$roomId._index/voting/header';
import { VotingUserList } from '~/routes/room.$roomId._index/voting/user/list';
import { sendVote } from '~/lib/api/user';
import { validateAndGetToken } from '~/lib/api/auth.server';
import { useRoomContext } from '~/routes/room/RoomProvider';

export default function RoomVote() {
    const { room } = useRoomContext();

    return (
        <main className="container mx-auto p-4 min-h-screen">
            <VotingHeader roomId={room.id} />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col w-full">
                    <VotingCardList />
                    <VotingActions />
                </div>
                <VotingUserList />
            </div>
        </main>
    );
}

export async function action({ request }: ActionFunctionArgs) {
    const body = await request.formData();
    const card = create(body.get('card'), string());

    const { rawToken } = await validateAndGetToken(request);
    const updatedUser = await sendVote(rawToken, card);
    if (!updatedUser) {
        throw new Error('Error while sending vote value');
    }

    return json({ card: updatedUser.vote });
}
