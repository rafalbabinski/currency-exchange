import { z } from "zod";

import { i18next } from "../../shared/i18n/i18n-client-factory";

export const checkTransactionStatusLambdaSchema = z.object({
  pathParameters: z.object({
    id: z
      .string({
        required_error: i18next.t("VALIDATION.REQUIRED", { field: "id" }),
      })
      .min(1, i18next.t("VALIDATION.EMPTY", { field: "id" })),
  }),
});

export type CheckTransactionStatusLambdaPayload = z.infer<typeof checkTransactionStatusLambdaSchema>;
