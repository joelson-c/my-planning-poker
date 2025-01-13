import type { User } from '~/types/user';
import { CircleEllipsis } from 'lucide-react';
import { useFetcher } from 'react-router';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface VotingUserActionsProps {
    user: User;
}

export function VotingUserActions({ user }: VotingUserActionsProps) {
    const fetcher = useFetcher();

    function onUserRemoveClick() {
        fetcher.submit(
            { target: user.id },
            { action: `/room/${user.room}/remove-user`, method: 'POST' },
        );
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
