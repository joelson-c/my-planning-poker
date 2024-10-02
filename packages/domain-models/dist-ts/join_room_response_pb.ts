// @generated by protoc-gen-es v2.1.0 with parameter "target=ts"
// @generated from file join_room_response.proto (package planningpoker.realtime, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file join_room_response.proto.
 */
export const file_join_room_response: GenFile = /*@__PURE__*/
  fileDesc("Chhqb2luX3Jvb21fcmVzcG9uc2UucHJvdG8SFnBsYW5uaW5ncG9rZXIucmVhbHRpbWUiWQoQSm9pblJvb21SZXNwb25zZRIOCgZyb29tSWQYAiABKAkSEAoIbmlja25hbWUYAyABKAkSEgoKaXNPYnNlcnZlchgEIAEoCBIPCgdpc0FkbWluGAUgASgIQiVaI3BsYW5uaW5ncG9rZXIvZG9tYWluX21vZGVscy9kaXN0LWdvYgZwcm90bzM");

/**
 * @generated from message planningpoker.realtime.JoinRoomResponse
 */
export type JoinRoomResponse = Message<"planningpoker.realtime.JoinRoomResponse"> & {
  /**
   * @generated from field: string roomId = 2;
   */
  roomId: string;

  /**
   * @generated from field: string nickname = 3;
   */
  nickname: string;

  /**
   * @generated from field: bool isObserver = 4;
   */
  isObserver: boolean;

  /**
   * @generated from field: bool isAdmin = 5;
   */
  isAdmin: boolean;
};

/**
 * Describes the message planningpoker.realtime.JoinRoomResponse.
 * Use `create(JoinRoomResponseSchema)` to create a new message.
 */
export const JoinRoomResponseSchema: GenMessage<JoinRoomResponse> = /*@__PURE__*/
  messageDesc(file_join_room_response, 0);

