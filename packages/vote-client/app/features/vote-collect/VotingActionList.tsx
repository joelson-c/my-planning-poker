import type { Room } from '~/types/room';
import { useFetcher } from 'react-router';
import { Button } from '~/components/ui/button';

interface VotingActionsProps {
    room: Room;
}

export function VotingActionList({ room }: VotingActionsProps) {
    const fetcher = useFetcher();

    return (
        <div className="flex justify-center space-x-4 mb-6">
            <fetcher.Form action={`/room/${room.id}/reveal`} method="POST">
                <Button type="submit">Reveal Cards</Button>
            </fetcher.Form>
        </div>
    );
}
