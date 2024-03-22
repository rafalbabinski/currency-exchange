import { z } from "zod";

import { regExp } from "../../shared/utils/reg-exp";
import { createConfig } from "./config";

export const startTransactionLambdaSchema = (config: ReturnType<typeof createConfig>) =>
  z.object({
    body: z.object({
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
      currencyTo: z
        .string({
          required_error: "currencyTo is required",
        })
        .min(1, "currencyTo can't be empty")
        .refine(
          (currencyTo) => {
            return new RegExp(regExp.currencyCode).test(currencyTo);
          },
          {
            message: "currencyTo must be valid 3-letter currency code (e.g., PLN, EUR, USD)",
          },
        )
        .refine(
          (currencyTo) => {
            return config.currencyScope.includes(currencyTo);
          },
          {
            message: `currencyTo is not in the exchange scope, available currencies: ${config.currencyScope}`,
          },
        ),
      currencyFromAmount: z
        .number({
          required_error: "amount is required",
        })
        .positive("amount must be grater than 0"),
    }),
  });

export type StartTransactionLambdaPayload = z.infer<ReturnType<typeof startTransactionLambdaSchema>>;
