import { z } from "zod";
import { regExp } from "../../shared/utils/reg-exp";

export const getRatesLambdaSchema = z.object({
  queryStringParameters: z.object({
    startCurrency: z
      .string({
        required_error: "startCurrency is required",
      })
      .min(1, "startCurrency can't be empty")
      .refine(
        (startCurrency) => {
          return new RegExp(regExp.currencyCode).test(startCurrency);
        },
        {
          message: "startCurrency must be valid 3-letter currency code (e.g., PLN, EUR, USD)",
        },
      ),
    endCurrency: z
      .string({
        required_error: "endCurrency is required",
      })
      .min(1, "endCurrency can't be empty")
      .refine(
        (endCurrency) => {
          return new RegExp(regExp.currencyCode).test(endCurrency);
        },
        {
          message: "endCurrency must be valid 3-letter currency code (e.g., PLN, EUR, USD)",
        },
      ),
  }),
});

export type GetRatesLambdaPayload = z.infer<typeof getRatesLambdaSchema>;
