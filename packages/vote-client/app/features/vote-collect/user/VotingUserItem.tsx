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

interface VotingUserItemProps {
    user: User;
    currentUser: User;
}

export function VotingUserItem({ user, currentUser }: VotingUserItemProps) {
    const isUserMine = user.id === currentUser.id;

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-grow">
                <Avatar>
                    <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className={cn(isUserMine && 'font-semibold')}>
                    {user.nickname}
                </span>
                {user.admin && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <div className="flex items-center space-x-2">
                {currentUser.admin && !isUserMine && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <CircleEllipsis className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Make Admin</DropdownMenuItem>
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
