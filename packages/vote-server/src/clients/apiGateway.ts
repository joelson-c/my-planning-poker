import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";

export const apiGateway = new ApiGatewayManagementApiClient({
  endpoint: import.meta.env.INLINE_API_GATEWAY_ENDPOINT,
});
