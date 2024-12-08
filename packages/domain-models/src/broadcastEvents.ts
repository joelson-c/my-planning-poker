import type { RoomState, VotingUser } from "@prisma/client";

type EventType = "ROOM_STATE_UPDATE" | "NEW_ADMIN";

export interface BroadcastEvent {
  type: EventType;
}

export interface NewRoomStateEvent extends BroadcastEvent {
  type: "ROOM_STATE_UPDATE";
  state: RoomState;
}

export interface NewAdminEvent extends BroadcastEvent {
  type: "NEW_ADMIN";
  newAdminId: VotingUser["id"];
}

export type BroadcastEvents = NewRoomStateEvent | NewAdminEvent;
