import type { DescMessage, MessageShape } from "@bufbuild/protobuf";
import type { Observable, UnaryFunction } from "rxjs";
import { filter, map, pipe } from "rxjs";
import { SocketMessageSchema } from "@planningpoker/domain-models/realtime/socket_message_pb";
import { fromJson, isMessage } from "@bufbuild/protobuf";

export function protobufMessage<T, S extends DescMessage>(
  schema: S
): UnaryFunction<Observable<T>, Observable<MessageShape<S>>> {
  // @ts-expect-error message type is being checked by isMessage function
  return pipe(
    map((message: string) => fromJson(SocketMessageSchema, message)),
    filter(({ content }) => isMessage(content.value, schema))
  );
}
