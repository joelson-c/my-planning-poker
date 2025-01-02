import { Card, CardContent } from '~/components/ui/card';
import type { User } from '~/types/user';
import { VotingUserItem } from './item';

interface VotingUserItemProps {
    users: User[];
    currentUser: User;
}

export function VotingUserList({ users, currentUser }: VotingUserItemProps) {
    return (
        <div className="w-full lg:w-1/3">
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Users in Room
                    </h2>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <VotingUserItem
                                key={user.id}
                                user={user}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
