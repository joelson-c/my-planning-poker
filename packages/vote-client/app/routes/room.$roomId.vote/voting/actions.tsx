import { useFetcher } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { useRoomContext } from '~/routes/room.$roomId/RoomProvider';

export function VotingActions() {
    const revealFetcher = useFetcher();
    const { room } = useRoomContext();

    const onRevealClick = () => {
        revealFetcher.submit(null, {
            method: 'post',
            action: `/room/${room.id}/reveal`,
        });
    };

    return (
        <div className="flex justify-center space-x-4 mb-6">
            <Button onClick={onRevealClick}>Reveal Cards</Button>
            <Button variant="outline">Reset</Button>
        </div>
    );
}
