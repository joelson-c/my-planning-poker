import type { User } from '~/types/user';
import { VotingUserItem } from './VotingUserItem';
import { VotingUserListSkeleton } from './VotingUserListSkeleton';

interface VotingUserItemProps {
    users?: User[] | null;
    currentUserId: string;
}

export function VotingUserList({ users, currentUserId }: VotingUserItemProps) {
    if (!users) {
        return <VotingUserListSkeleton />;
    }

    return (
        <div className="space-y-4">
            {users?.map((user) => {
                const isMyself = user.id === currentUserId;

                return (
                    <VotingUserItem
                        key={user.id}
                        user={user}
                        isMyself={isMyself}
                    />
                );
            })}
        </div>
    );
}
