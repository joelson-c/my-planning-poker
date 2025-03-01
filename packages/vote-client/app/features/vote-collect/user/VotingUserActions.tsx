import type { RealtimeUser } from '~/types/user';
import { CircleEllipsis } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useVoteContext } from '~/lib/context/vote';

interface VotingUserActionsProps {
    user: RealtimeUser;
}

export function VotingUserActions({ user }: VotingUserActionsProps) {
    const { currentUser, kickUser } = useVoteContext();
    const isMyself = user.id === currentUser.id;

    function onUserRemoveClick() {
        kickUser(user.id);
    }

    if (isMyself) {
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
                <DropdownMenuItem onClick={() => onUserRemoveClick()}>
                    Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
