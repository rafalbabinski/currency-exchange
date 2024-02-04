import { z } from "zod";

import { regExp } from "../../shared/utils/reg-exp";

export const getRatesLambdaSchema = z.object({
  queryStringParameters: z.object({
    currencyFrom: z
      .string({
        required_error: "currencyFrom is required",
      })
      .min(1, "currencyFrom can't be empty")
      .refine(
        (currencyFrom) => {
          return new RegExp(regExp.currencyCode).test(currencyFrom);
        },
        {
          message: "currencyFrom must be valid 3-letter currency code (e.g., PLN, EUR, USD)",
        },
      ),
  }),
});

export type GetRatesLambdaPayload = z.infer<typeof getRatesLambdaSchema>;
