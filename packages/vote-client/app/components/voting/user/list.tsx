import { Card, CardContent } from "../../ui/card";
import { VotingUserItem } from "./item";

const users = [
  {
    connectionId: "1",
    roomId: "1",
    nickname: "User 1",
    isAdmin: true,
    isObserver: false,
  },
];

export function VotingUserList() {
  return (
    <div className="w-full lg:w-1/3">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Users in Room</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <VotingUserItem key={user.connectionId} user={user} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
