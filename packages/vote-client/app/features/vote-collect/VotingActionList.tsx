import type { Room } from '~/types/room';
import { Button } from '~/components/ui/button';
import { toast } from '~/lib/useToast';
import { Share2 } from 'lucide-react';
import { backendClient } from '~/lib/backend/client';
import { useVoteContext } from '~/lib/context/vote';
import { useTransition } from 'react';

async function copyRoomToClipboard(room: Room) {
    const roomLink = `${window.location.origin}/join/${room.id}`;
    try {
        await navigator.clipboard.writeText(roomLink);
    } catch (error) {
        console.error(error);

        toast({
            title: 'Failed to copy link',
            description: 'Please try again or copy it manually.',
            variant: 'destructive',
        });
    }

    toast({
        title: 'Room link copied!',
        description: 'Share this link with your team members.',
    });
}

export function VotingActionList() {
    const { room } = useVoteContext();
    const [, startTransition] = useTransition();

    async function revealCards() {
        startTransition(async () => {
            await backendClient.collection('voteRooms').update(room.id, {
                state: 'REVEAL',
            });
        });
    }

    return (
        <div className="flex justify-center space-x-6">
            <Button onClick={revealCards}>Reveal Cards</Button>
            <Button
                onClick={() => copyRoomToClipboard(room)}
                variant="secondary"
            >
                <Share2 className="mr-2 h-4 w-4" />
                Share Room
            </Button>
        </div>
    );
}
