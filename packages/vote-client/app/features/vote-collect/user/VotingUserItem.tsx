import type { User } from '~/types/user';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';
import { VotingUserActions } from './VotingUserActions';

interface VotingUserItemProps {
    user: User;
    isMyself?: boolean;
}

export function VotingUserItem({ user, isMyself }: VotingUserItemProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-grow">
                <Avatar>
                    <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className={cn(isMyself && 'font-semibold')}>
                    {user.nickname} {user.observer && <>(Observer)</>}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {!isMyself && <VotingUserActions user={user} />}
                <span
                    className={cn(
                        'ml-2 h-3 w-3 rounded-full',
                        user.observer && 'bg-gray-500',
                        !user.observer && [
                            user.hasVoted && 'bg-green-500',
                            !user.hasVoted && 'bg-red-500',
                        ],
                    )}
                />
            </div>
        </div>
    );
}
