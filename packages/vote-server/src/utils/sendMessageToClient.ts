import type { RealtimeMessage } from "@planningpoker/domain-models/realtime/message";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { apiGateway } from "../clients/apiGateway";

export async function sendMessageToClient(
  connectionId: string,
  message: RealtimeMessage
) {
  return apiGateway.send(
    new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    })
  );
}
