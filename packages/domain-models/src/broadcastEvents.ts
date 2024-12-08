import type { RoomState, VotingUser } from "@prisma/client";

type EventType = "ROOM_STATE_UPDATE" | "NEW_ADMIN";

interface BaseBroadcastEvent {
  type: EventType;
}

export interface NewRoomStateEvent extends BaseBroadcastEvent {
  type: "ROOM_STATE_UPDATE";
  state: RoomState;
}

export interface NewAdminEvent extends BaseBroadcastEvent {
  type: "NEW_ADMIN";
  newAdminId: VotingUser["id"];
}

export type BroadcastEvent = NewRoomStateEvent | NewAdminEvent;
