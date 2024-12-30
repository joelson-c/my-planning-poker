import type { Room } from '~/types/room';
import { Share2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from '~/hooks/use-toast';
import { RepositoryLink } from '../../../components/repository/link';

interface VotingHeaderProps {
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

export function VotingHeader({ room }: VotingHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Planning Poker</h1>
            <div className="flex space-x-2">
                <Button
                    onClick={() => copyRoomToClipboard(room)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Room
                </Button>
                <RepositoryLink />
            </div>
        </div>
    );
}
