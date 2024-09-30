import { filter, firstValueFrom, timeout } from "rxjs";
import { atom } from "jotai";
import { socketSubject } from "~/lib/realtime/socketClient.client";

const FIRST_MESSAGE_TIMEOUT_MS = 5000;

interface ConnectionData {
  id: string;
  roomId: string;
}

export const connectionAtom = atom<Promise<ConnectionData>>(async () => {
  const connectedMessage = socketSubject.pipe(
    filter((data) => data.type === "connected"),
    timeout(FIRST_MESSAGE_TIMEOUT_MS)
  );

  const data = await firstValueFrom(connectedMessage);

  return {
    id: data.connectionId,
    roomId: data.roomId,
  };
});
