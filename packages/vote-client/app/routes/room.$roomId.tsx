import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useParams } from "@remix-run/react";
import { VotingActions } from "~/components/voting/actions";
import { VotingCardList } from "~/components/voting/card/list";
import { VotingHeader } from "~/components/voting/header";
import { VotingUserList } from "~/components/voting/user/list";

type RouteParams = {
  roomId: string;
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  if (!params.roomId) {
    throw new Response(null, {
      status: 403,
    });
  }

  // TODO: connect to websocket server

  return null;
};

export default function Room() {
  const { roomId } = useParams<RouteParams>();

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <VotingHeader roomId={roomId!} />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col w-full">
          <VotingCardList />
          <VotingActions />
        </div>
        <VotingUserList />
      </div>
    </main>
  );
}
