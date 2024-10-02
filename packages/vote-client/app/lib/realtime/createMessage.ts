import type { MessageInitShape, JsonValue } from "@bufbuild/protobuf";
import { create, toJson } from "@bufbuild/protobuf";
import { SocketMessageSchema } from "@planningpoker/domain-models/realtime/socket_message_pb";

export function createMessage(
  content: MessageInitShape<typeof SocketMessageSchema>
): JsonValue {
  const message = create(SocketMessageSchema, content);
  return toJson(SocketMessageSchema, message);
}
