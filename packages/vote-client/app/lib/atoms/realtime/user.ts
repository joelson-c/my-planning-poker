import { map } from "rxjs";
import { atomWithObservable } from "jotai/utils";
import { UserListBroadcastSchema } from "@planningpoker/domain-models/realtime/user_list_broadcast_pb";
import { protobufMessage } from "~/lib/realtime/protobufMessage";
import { socketSubject } from "~/lib/realtime/socketClient.client";

export const userListAtom = atomWithObservable(
  () =>
    socketSubject.pipe(
      protobufMessage(UserListBroadcastSchema),
      map((data) => data.users)
    ),
  { initialValue: [] }
);
