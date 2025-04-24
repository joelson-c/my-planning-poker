import { CircleEllipsis } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { Presence } from '~/lib/realtimeWorker/messages';

interface VotingUserActionsProps {
    user: Presence;
    onUserRemoveClick?: (user: Presence) => void;
}

export function VotingUserActions({
    user,
    onUserRemoveClick,
}: VotingUserActionsProps) {
    if (user.current) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <CircleEllipsis className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUserRemoveClick?.(user)}>
                    Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
