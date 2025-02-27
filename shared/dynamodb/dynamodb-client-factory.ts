import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isOffline = process.env.IS_OFFLINE === "true";

export const createDynamoDBClient = (): DynamoDBDocumentClient => {
  const client = new DynamoDBClient(
    isOffline
      ? {
          region: "localhost",
          endpoint: "http://0.0.0.0:8005",
          credentials: {
            accessKeyId: "MockAccessKeyId",
            secretAccessKey: "MockSecretAccessKey",
          },
        }
      : {},
  );

  return DynamoDBDocumentClient.from(client);
};
