import { z } from "zod";

export const receivePaymentNotificationLambdaSchema = z.object({
  body: z.object({
    transactionId: z
      .string({
        required_error: "transactionId is required",
      })
      .min(1, "transactionId can't be empty"),
    status: z
      .string({
        required_error: "status is required",
      })
      .min(1, "status can't be empty"),
  }),
  pathParameters: z.object({
    id: z.string(),
  }),
});

export type ReceivePaymentNotificationLambdaPayload = z.infer<typeof receivePaymentNotificationLambdaSchema>;
