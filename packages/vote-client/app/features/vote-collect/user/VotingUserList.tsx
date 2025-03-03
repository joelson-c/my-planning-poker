import type { ComponentProps } from 'react';
import { VotingUserActions } from './VotingUserActions';
import { VotingUserItem } from './VotingUserItem';
import { VotingUserListSkeleton } from './VotingUserListSkeleton';
import { useVoteContext } from '~/lib/context/vote';
import { twMerge } from 'tailwind-merge';

export function VotingUserList({ className, ...props }: ComponentProps<'ul'>) {
    const { users } = useVoteContext();

    if (!users) {
        return <VotingUserListSkeleton />;
    }

    return (
        <ul {...props} className={twMerge('space-y-4', className)}>
            {users?.map((user) => (
                <VotingUserItem key={user.id} user={user}>
                    <VotingUserActions user={user} />
                </VotingUserItem>
            ))}
        </ul>
    );
}
