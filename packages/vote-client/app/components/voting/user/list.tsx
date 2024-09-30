import { useAtomValue } from "jotai";
import { Card, CardContent } from "../../ui/card";
import { VotingUserItem } from "./item";
import { userListAtom } from "~/lib/atoms/realtime/user";

export function VotingUserList() {
  const userList = useAtomValue(userListAtom);

  return (
    <div className="w-full lg:w-1/3">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Users in Room</h2>
          <div className="space-y-4">
            {userList.map((user) => (
              <VotingUserItem key={user.connectionId} user={user} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
