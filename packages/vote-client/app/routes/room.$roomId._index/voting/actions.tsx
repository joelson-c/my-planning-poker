import { Form } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { useRoomContext } from '~/routes/room/RoomProvider';

export function VotingActions() {
    const { room } = useRoomContext();

    return (
        <div className="flex justify-center space-x-4 mb-6">
            <Form action={`/room/${room.id}/reveal`} method="POST">
                <Button type="submit">Reveal Cards</Button>
            </Form>
            <Button variant="outline">Reset</Button>
        </div>
    );
}
