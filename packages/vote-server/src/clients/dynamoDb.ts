import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({
  endpoint: import.meta.env.INLINE_DYNAMODB_ENDPOINT,
});

export const docClient = DynamoDBDocumentClient.from(dynamoClient);
