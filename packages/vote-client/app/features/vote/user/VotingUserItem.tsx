import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';
import { useId, type ReactNode } from 'react';
import type { Presence } from '~/lib/realtimeWorker/messages';

interface VotingUserItemProps {
    user: Presence;
    children?: ReactNode;
}

export function VotingUserItem({ user, children }: VotingUserItemProps) {
    const statusLabel = user.observer
        ? 'Observer'
        : user.voted
        ? 'Voted'
        : 'Not voted';

    const userNameId = useId();

    return (
        <li
            className="flex items-center justify-between"
            data-ref={user.current ? 'self' : undefined}
            aria-labelledby={userNameId}
        >
            <div className="flex items-center gap-2 grow">
                <Avatar aria-hidden="true">
                    <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
                <span
                    className={cn(user.current && 'font-semibold')}
                    id={userNameId}
                >
                    {user.nickname}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {children}
                <span
                    className={cn(
                        'ml-2 h-3 w-3 rounded-full',
                        user.observer && 'bg-gray-500',
                        !user.observer && [
                            user.voted && 'bg-green-500',
                            !user.voted && 'bg-red-500',
                        ],
                    )}
                    role="status"
                    title={statusLabel}
                />
            </div>
        </li>
    );
}
