import type { StoredVotingUser } from "@planningpoker/domain-models/voting/user";
import { CheckCircle2, CircleEllipsis, Crown, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface VotingUserItemProps {
  user: StoredVotingUser;
}

export function VotingUserItem({ user }: VotingUserItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 flex-grow">
        <Avatar>
          <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
        </Avatar>
        <span>{user.nickname}</span>
        {user.isAdmin && <Crown className="h-4 w-4 text-yellow-500" />}
      </div>
      <div className="flex items-center space-x-2">
        {user.vote ? (
          <CheckCircle2 className="text-green-500" size={20} />
        ) : (
          <XCircle className="text-red-500" size={20} />
        )}
        {user.isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <CircleEllipsis className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Make Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
