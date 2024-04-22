import { z } from "zod";

import { translate } from "../../shared/i18n/i18n-client-factory";

export const checkTransactionStatusLambdaSchema = z.object({
  pathParameters: z.object({
    id: z
      .string({
        required_error: translate("VALIDATION.REQUIRED", { field: "id" }),
      })
      .min(1, translate("VALIDATION.EMPTY", { field: "id" })),
  }),
});

export type CheckTransactionStatusLambdaPayload = z.infer<typeof checkTransactionStatusLambdaSchema>;
