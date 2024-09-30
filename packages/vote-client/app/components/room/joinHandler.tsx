import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { joinRoomAction, roomAtom } from "~/lib/atoms/realtime/room";

interface JoinHandlerProps {
  roomId: string;
}

export function JoinHandler({ roomId }: JoinHandlerProps) {
  const joinRoom = useSetAtom(joinRoomAction);
  useAtomValue(roomAtom);

  useEffect(() => {
    joinRoom(roomId!);
  }, [joinRoom, roomId]);

  return null;
}
