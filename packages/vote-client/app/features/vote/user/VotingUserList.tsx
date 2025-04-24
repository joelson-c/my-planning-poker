import type { ComponentProps } from 'react';
import { VotingUserActions } from './VotingUserActions';
import { VotingUserItem } from './VotingUserItem';
import { VotingUserListSkeleton } from './VotingUserListSkeleton';
import { twMerge } from 'tailwind-merge';
import type { Presence } from '~/lib/realtimeWorker/messages';

interface VotingActionListProps extends ComponentProps<'ul'> {
    users: Presence[];
    onUserRemove?: (user: Presence) => void;
}

export function VotingUserList({
    users,
    className,
    onUserRemove,
    ...props
}: VotingActionListProps) {
    if (!users) {
        return <VotingUserListSkeleton />;
    }

    return (
        <ul {...props} className={twMerge('space-y-4', className)}>
            {users?.map((user) => (
                <VotingUserItem key={user.id} user={user}>
                    <VotingUserActions
                        onUserRemoveClick={onUserRemove}
                        user={user}
                    />
                </VotingUserItem>
            ))}
        </ul>
    );
}
