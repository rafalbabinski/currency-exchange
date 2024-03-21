import { z } from "zod";

export const receivePaymentNotificationLambdaSchema = z.object({
  body: z.object({
    status: z
      .string({
        required_error: "status is required",
      })
      .min(1, "status can't be empty"),
  }),
  queryStringParameters: z.object({
    key: z
      .string({
        required_error: "key is required",
      })
      .min(1, "key can't be empty"),
  }),
  pathParameters: z.object({
    id: z.string(),
  }),
});

export type ReceivePaymentNotificationLambdaPayload = z.infer<typeof receivePaymentNotificationLambdaSchema>;
