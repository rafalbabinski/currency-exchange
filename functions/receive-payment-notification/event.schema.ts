import { z } from "zod";
import { i18next } from "../../shared/i18n/i18n-client-factory";

export const receivePaymentNotificationLambdaSchema = () =>
  z.object({
    body: z.object({
      status: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "status" }),
        })
        .min(1, i18next.t("VALIDATION.EMPTY", { field: "status" })),
    }),
    queryStringParameters: z.object({
      key: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "key" }),
        })
        .min(1, i18next.t("VALIDATION.EMPTY", { field: "key" })),
    }),
    pathParameters: z.object({
      id: z.string(),
    }),
  });

export type ReceivePaymentNotificationLambdaPayload = z.infer<
  ReturnType<typeof receivePaymentNotificationLambdaSchema>
>;
