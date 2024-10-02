import type { VotingRoom } from "@planningpoker/domain-models/voting/room";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { timeout } from "rxjs";
import { socketSubject } from "~/lib/realtime/socketClient.client";
import { protobufMessage } from "~/lib/realtime/protobufMessage";
import { createMessage } from "~/lib/realtime/createMessage";
import { localVotingUserAtom } from "../voting/localUser";
import { JoinRoomResponseSchema } from "@planningpoker/domain-models/realtime/join_room_response_pb";
import { RoomStateBroadcastSchema } from "@planningpoker/domain-models/realtime/room_state_broadcast_pb";
import { RoomState } from "@planningpoker/domain-models/realtime/base/room_state_pb";
import { CardType } from "@planningpoker/domain-models/realtime/base/card_type_pb";
import { MessageType } from "@planningpoker/domain-models/realtime/base/message_type_pb";

const ROOM_JOIN_TIMEOUT_MS = 5000;

export const roomStateAtom = atomWithObservable(
  () => socketSubject.pipe(protobufMessage(RoomStateBroadcastSchema)),
  {
    initialValue: {
      $typeName: "planningpoker.realtime.RoomStateBroadcast",
      state: RoomState.VOTING,
      cardType: CardType.FIBONACCI,
    },
  }
);

export const roomAtom = atomWithObservable(() =>
  socketSubject.pipe(
    protobufMessage(JoinRoomResponseSchema),
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
    socketSubject.next(
      createMessage({
        type: MessageType.JOIN_ROOM_REQUEST,
        content: {
          case: "joinRoomRequest",
          value: {
            roomId,
            nickname,
            isObserver,
          },
        },
      })
    );
  }
);
