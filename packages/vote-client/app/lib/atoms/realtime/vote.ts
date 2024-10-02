import type { VotingCard } from "@planningpoker/domain-models/voting/card";
import { atom } from "jotai";
import { firstValueFrom, timeout } from "rxjs";
import { socketSubject } from "~/lib/realtime/socketClient.client";
import { createMessage } from "~/lib/realtime/createMessage";
import { MessageType } from "@planningpoker/domain-models/realtime/base/message_type_pb";
import { protobufMessage } from "~/lib/realtime/protobufMessage";
import { VoteBroadcastSchema } from "@planningpoker/domain-models/realtime/vote_broadcast_pb";

const VOTE_ACTION_TIMEOUT_MS = 5000;

export const voteAction = atom(null, async (_get, _set, value: VotingCard) => {
  socketSubject.next(
    createMessage({
      type: MessageType.VOTE_REQUEST,
      content: {
        case: "voteRequest",
        value: {
          vote: value,
        },
      },
    })
  );

  const voteBroadcast = socketSubject.pipe(
    protobufMessage(VoteBroadcastSchema),
    timeout(VOTE_ACTION_TIMEOUT_MS)
  );

  await firstValueFrom(voteBroadcast);
});
