import { SESv2Client } from "@aws-sdk/client-sesv2";

const isOffline = process.env.IS_OFFLINE === "true";

export const createSesClient = (): SESv2Client => {
  const client = new SESv2Client(
    isOffline
      ? {
          region: "aws-ses-v2-local",
          endpoint: "http://localhost:8006",
          credentials: {
            accessKeyId: "MockAccessKeyId",
            secretAccessKey: "MockSecretAccessKey",
          },
        }
      : {},
  );

  return client;
};
