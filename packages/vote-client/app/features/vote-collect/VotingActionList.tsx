import { Button } from '~/components/ui/button';
import { toast } from '~/lib/useToast';
import { Share2 } from 'lucide-react';
import { useVoteContext } from '~/lib/context/vote';

async function copyRoomToClipboard(roomId: string) {
    const roomLink = `${window.location.origin}/join/${roomId}`;
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
    const { outboundDispatcher, roomId } = useVoteContext();

    async function revealCards() {
        outboundDispatcher({
            name: 'WS_REVEAL',
        });
    }

    return (
        <div className="flex justify-center space-x-6">
            <Button onClick={revealCards}>Reveal Cards</Button>
            <Button
                onClick={() => copyRoomToClipboard(roomId)}
                variant="secondary"
            >
                <Share2 className="mr-2 h-4 w-4" />
                Share Room
            </Button>
        </div>
    );
}
