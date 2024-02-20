import { SFNClient } from "@aws-sdk/client-sfn";

export const createStepFunctionsClient = (isOffline: boolean): SFNClient => {
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
