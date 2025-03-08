import type { RealtimeUser } from '~/types/user';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';
import { useVoteContext } from '~/lib/context/vote';
import { useId, type ReactNode } from 'react';

interface VotingUserItemProps {
    user: RealtimeUser;
    children?: ReactNode;
}

export function VotingUserItem({ user, children }: VotingUserItemProps) {
    const { currentUser } = useVoteContext();
    const isMyself = user.id === currentUser.id;

    const statusLabel = user.observer
        ? 'Observer'
        : user.hasVoted
        ? 'Voted'
        : 'Not voted';

    const userNameId = useId();

    return (
        <li
            className="flex items-center justify-between"
            data-ref={isMyself ? 'self' : undefined}
            aria-labelledby={userNameId}
        >
            <div className="flex items-center gap-2 grow">
                <Avatar aria-hidden="true">
                    <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
                <span
                    className={cn(isMyself && 'font-semibold')}
                    id={userNameId}
                >
                    {user.nickname} {user.observer && <>(Observer)</>}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {children}
                <span
                    className={cn(
                        'ml-2 h-3 w-3 rounded-full',
                        user.observer && 'bg-gray-500',
                        !user.observer && [
                            user.hasVoted && 'bg-green-500',
                            !user.hasVoted && 'bg-red-500',
                        ],
                    )}
                    role="status"
                    title={statusLabel}
                />
            </div>
        </li>
    );
}
