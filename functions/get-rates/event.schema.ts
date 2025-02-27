import { z } from "zod";

import { regExp } from "../../shared/utils/reg-exp";
import { createConfig } from "./config";

export const getRatesLambdaSchema = (config: ReturnType<typeof createConfig>) =>
  z.object({
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
        )
        .refine(
          (currencyFrom) => {
            return config.currencyScope.includes(currencyFrom);
          },
          {
            message: `currencyFrom is not in the exchange scope, available currencies: ${config.currencyScope}`,
          },
        ),
    }),
  });

export type GetRatesLambdaPayload = z.infer<ReturnType<typeof getRatesLambdaSchema>>;
