import { SFNClient } from "@aws-sdk/client-sfn";

const isOffline = process.env.IS_OFFLINE === "true";

export const createStepFunctionsClient = (): SFNClient => {
  const client = new SFNClient(
    isOffline
      ? {
          region: "localhost",
          endpoint: "http://127.0.0.1:8083",
          credentials: {
            accessKeyId: "MockAccessKeyId",
            secretAccessKey: "MockSecretAccessKey",
          },
        }
      : {},
  );

  return client;
};
