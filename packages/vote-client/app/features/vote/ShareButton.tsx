import { Share2 } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '~/components/ui/button';
import { toast } from '~/lib/useToast';

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

interface ShareButtonProps extends ComponentProps<typeof Button> {
    roomId: string;
}

export function ShareButton({ roomId, ...props }: ShareButtonProps) {
    return (
        <Button
            {...props}
            onClick={() => copyRoomToClipboard(roomId)}
            variant="secondary"
        >
            <Share2 className="mr-2 h-4 w-4" />
            Share Room
        </Button>
    );
}
