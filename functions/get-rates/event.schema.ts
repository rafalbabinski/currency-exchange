import { z } from "zod";

import { regExp } from "../../shared/utils/reg-exp";

export const getRatesLambdaSchema = z.object({
  queryStringParameters: z.object({
    baseCurrency: z
      .string({
        required_error: "baseCurrency is required",
      })
      .min(1, "baseCurrency can't be empty")
      .refine(
        (baseCurrency) => {
          return new RegExp(regExp.currencyCode).test(baseCurrency);
        },
        {
          message: "baseCurrency must be valid 3-letter currency code (e.g., PLN, EUR, USD)",
        },
      ),
  }),
});

export type GetRatesLambdaPayload = z.infer<typeof getRatesLambdaSchema>;