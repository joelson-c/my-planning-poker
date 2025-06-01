import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { VotingUserList } from './user/VotingUserList';
import type { Presence } from '~/lib/realtimeWorker/messages';

interface UserCardProps {
    users: Presence[];
    onUserRemove: (user: Presence) => void;
}

export function UserCard({ users, onUserRemove }: UserCardProps) {
    return (
        <Card className="w-full lg:w-1/3">
            <CardHeader>
                <CardTitle id="users-in-room-title">Users in Room</CardTitle>
            </CardHeader>
            <CardContent>
                <VotingUserList
                    users={users}
                    onUserRemove={onUserRemove}
                    aria-labelledby="users-in-room-title"
                />
            </CardContent>
        </Card>
    );
}
