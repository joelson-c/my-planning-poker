import { atomWithObservable } from "jotai/utils";
import { filter, map } from "rxjs";
import { socketSubject } from "~/lib/realtime/socketClient.client";

export const userListAtom = atomWithObservable(
  () =>
    socketSubject.pipe(
      filter((data) => data.type === "user_list_broadcast"),
      map((data) => data.users)
    ),
  { initialValue: [] }
);
