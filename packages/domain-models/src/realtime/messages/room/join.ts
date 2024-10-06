export interface JoinRoomMessage {
  type: "join_room";
  roomId: string;
  nickname: string;
  isObserver: boolean;
}
