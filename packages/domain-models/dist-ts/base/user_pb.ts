// @generated by protoc-gen-es v2.1.0 with parameter "target=ts"
// @generated from file base/user.proto (package planningpoker.realtime.base, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file base/user.proto.
 */
export const file_base_user: GenFile = /*@__PURE__*/
  fileDesc("Cg9iYXNlL3VzZXIucHJvdG8SG3BsYW5uaW5ncG9rZXIucmVhbHRpbWUuYmFzZSJ/CgRVc2VyEhQKDGNvbm5lY3Rpb25JZBgBIAEoCRIOCgZyb29tSWQYAiABKAkSEAoIbmlja25hbWUYAyABKAkSEQoEdm90ZRgEIAEoCUgAiAEBEg8KB2lzQWRtaW4YBSABKAgSEgoKaXNPYnNlcnZlchgGIAEoCEIHCgVfdm90ZUIqWihwbGFubmluZ3Bva2VyL2RvbWFpbl9tb2RlbHMvZGlzdF9nby9iYXNlYgZwcm90bzM");

/**
 * @generated from message planningpoker.realtime.base.User
 */
export type User = Message<"planningpoker.realtime.base.User"> & {
  /**
   * @generated from field: string connectionId = 1;
   */
  connectionId: string;

  /**
   * @generated from field: string roomId = 2;
   */
  roomId: string;

  /**
   * @generated from field: string nickname = 3;
   */
  nickname: string;

  /**
   * @generated from field: optional string vote = 4;
   */
  vote?: string;

  /**
   * @generated from field: bool isAdmin = 5;
   */
  isAdmin: boolean;

  /**
   * @generated from field: bool isObserver = 6;
   */
  isObserver: boolean;
};

/**
 * Describes the message planningpoker.realtime.base.User.
 * Use `create(UserSchema)` to create a new message.
 */
export const UserSchema: GenMessage<User> = /*@__PURE__*/
  messageDesc(file_base_user, 0);

