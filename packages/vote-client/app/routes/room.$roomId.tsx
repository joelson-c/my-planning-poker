import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { redirect, useParams } from "@remix-run/react";
import { Suspense } from "react";
import { store } from "~/components/atom/provider";
import { JoinHandler } from "~/components/room/joinHandler";
import { JoiningSpinner } from "~/components/room/joiningSpinner";
import { VotingActions } from "~/components/voting/actions";
import { VotingCardList } from "~/components/voting/card/list";
import { VotingHeader } from "~/components/voting/header";
import { VotingUserList } from "~/components/voting/user/list";
import { localVotingUserAtom } from "~/lib/atoms/voting/localUser";

type RouteParams = {
  roomId: string;
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  if (!params.roomId) {
    throw new Response(null, {
      status: 403,
    });
  }

  const localUser = store.get(localVotingUserAtom);
  if (!localUser) {
    return redirect(`/join/${params.roomId}`);
  }

  return null;
};

export default function Room() {
  const { roomId } = useParams<RouteParams>();

  return (
    <Suspense fallback={<JoiningSpinner />}>
      <main className="container mx-auto p-4 min-h-screen">
        <VotingHeader roomId={roomId!} />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col w-full">
            <VotingCardList />
            <VotingActions roomId={roomId!} />
          </div>
          <VotingUserList />
        </div>
        <JoinHandler roomId={roomId!} />
      </main>
    </Suspense>
  );
}
