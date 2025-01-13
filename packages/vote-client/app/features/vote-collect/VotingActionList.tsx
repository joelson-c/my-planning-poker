import type { Room } from '~/types/room';
import { useFetcher } from 'react-router';
import { Button } from '~/components/ui/button';
import { toast } from '~/lib/useToast';
import { Share2 } from 'lucide-react';

interface VotingActionsProps {
    room: Room;
}

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

export function VotingActionList({ room }: VotingActionsProps) {
    const fetcher = useFetcher();

    return (
        <div className="flex justify-center space-x-6">
            <fetcher.Form action={`/room/${room.id}/reveal`} method="POST">
                <Button type="submit">Reveal Cards</Button>
            </fetcher.Form>
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
