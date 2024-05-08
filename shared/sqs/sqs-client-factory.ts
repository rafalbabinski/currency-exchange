import { SQSClient } from "@aws-sdk/client-sqs";

const isOffline = process.env.IS_OFFLINE === "true";

export const createSqsClient = (): SQSClient => {
  const client = new SQSClient(
    isOffline
      ? {
          region: "aws-sqs-localhost",
          endpoint: "http://localhost:9324",
          credentials: {
            accessKeyId: "MockAccessKeyId",
            secretAccessKey: "MockSecretAccessKey",
          },
        }
      : {},
  );

  return client;
};
