import type { VotingRoom } from "@planningpoker/domain-models/voting/room";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { filter, map, timeout } from "rxjs";
import { socketSubject } from "~/lib/realtime/socketClient.client";
import { localVotingUserAtom } from "../voting/localUser";

const ROOM_JOIN_TIMEOUT_MS = 5000;

export const roomStateAtom = atomWithObservable(
  () =>
    socketSubject.pipe(
      filter((data) => data.type === "room_state_broadcast"),
      map((data) => data.state)
    ),
  { initialValue: "voting" }
);

export const roomAtom = atomWithObservable(() =>
  socketSubject.pipe(
    filter((data) => data.type === "joined"),
    map(({ isAdmin, room, connectionId }) => ({
      isAdmin,
      room,
      connectionId,
    })),
    timeout(ROOM_JOIN_TIMEOUT_MS)
  )
);

export const joinRoomAction = atom(
  null,
  async (get, _set, roomId: VotingRoom["roomId"]) => {
    const localUser = get(localVotingUserAtom);
    if (!localUser) {
      throw new Error("There is no local user to join the room with");
    }

    const { nickname, isObserver } = localUser;
    socketSubject.next({ type: "join", roomId, nickname, isObserver });
  }
);
