import type { Room } from '~/types/room';
import { Form } from 'react-router';
import { Button } from '~/components/ui/button';

interface VotingActionsProps {
    room: Room;
}

export function VotingActionList({ room }: VotingActionsProps) {
    return (
        <div className="flex justify-center space-x-4 mb-6">
            <Form action={`/room/${room.id}/reveal`} method="POST">
                <Button type="submit">Reveal Cards</Button>
            </Form>
            <Button variant="outline">Reset</Button>
        </div>
    );
}
