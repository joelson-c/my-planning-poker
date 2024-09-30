import type { VotingCard } from "@planningpoker/domain-models/voting/card";
import { atom } from "jotai";
import { filter, firstValueFrom, timeout } from "rxjs";
import { socketSubject } from "~/lib/realtime/socketClient.client";
import { roomAtom } from "./room";

const VOTE_ACTION_TIMEOUT_MS = 5000;

export const voteAction = atom(null, async (get, _, value: VotingCard) => {
  const { connectionId } = await get(roomAtom);
  socketSubject.next({
    type: "vote_send",
    connectionId: connectionId,
    value,
  });

  const voteBroadcast = socketSubject.pipe(
    filter((data) => data.type === "vote_broadcast"),
    timeout(VOTE_ACTION_TIMEOUT_MS)
  );

  await firstValueFrom(voteBroadcast);
});
