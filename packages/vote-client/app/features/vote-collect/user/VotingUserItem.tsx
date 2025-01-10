import type { User } from '~/types/user';
import { CheckCircle2, CircleEllipsis, Crown, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';
import { useFetcher } from 'react-router';

interface VotingUserItemProps {
    user: User;
    isMyself?: boolean;
}

export function VotingUserItem({ user, isMyself }: VotingUserItemProps) {
    const fetcher = useFetcher();

    function onUserRemoveClick() {
        fetcher.submit(
            { target: user.id },
            { action: `/room/${user.room}/remove-user`, method: 'POST' },
        );
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-grow">
                <Avatar>
                    <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className={cn(isMyself && 'font-semibold')}>
                    {user.nickname}
                </span>
                {user.owner && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <div className="flex items-center space-x-2">
                {!isMyself && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <CircleEllipsis className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onUserRemoveClick()}
                            >
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {user.hasVoted ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                ) : (
                    <XCircle className="text-red-500" size={20} />
                )}
            </div>
        </div>
    );
}
