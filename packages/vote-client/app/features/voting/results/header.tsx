import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Form } from 'react-router';
import { useRoomContext } from '~/routes/room/RoomProvider';

export function ResultHeader() {
    const { room, user } = useRoomContext();

    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Voting Results</h1>
            {!user.isAdmin && (
                <Form action={`/room/${room.id}/reset`} method="POST">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        type="submit"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Start New Vote
                    </Button>
                </Form>
            )}
        </div>
    );
}
