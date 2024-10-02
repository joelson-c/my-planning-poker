import type { JsonValue } from "@bufbuild/protobuf";
import { webSocket } from "rxjs/webSocket";

export const socketSubject = webSocket<JsonValue>(
  import.meta.env.VITE_WS_ENDPOINT
);
