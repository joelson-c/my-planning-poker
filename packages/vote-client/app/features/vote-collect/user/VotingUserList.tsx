import { VotingUserItem } from './VotingUserItem';
import { VotingUserListSkeleton } from './VotingUserListSkeleton';
import { useVoteContext } from '~/lib/context/vote';

export function VotingUserList() {
    const {
        realtimeState: { users },
    } = useVoteContext();

    if (!users) {
        return <VotingUserListSkeleton />;
    }

    return (
        <div className="space-y-4">
            {users?.map((user) => (
                <VotingUserItem key={user.id} user={user} />
            ))}
        </div>
    );
}
