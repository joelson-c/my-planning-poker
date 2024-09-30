import type { RealtimeMessage } from "@planningpoker/domain-models/realtime/message";
import { webSocket } from "rxjs/webSocket";

export const socketSubject = webSocket<RealtimeMessage>(
  import.meta.env.VITE_WS_ENDPOINT
);
