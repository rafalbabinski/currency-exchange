import { z } from "zod";
import { regExp } from "../../shared/utils/reg-exp";

export const startTransactionLambdaSchema = z.object({
  body: z.object({
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
    endCurrency: z
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
    baseCurrencyAmount: z
      .number({
        required_error: "amount is required",
      })
      .positive("amount must be grater than 0"),
  }),
});

export type StartTransactionLambdaPayload = z.infer<typeof startTransactionLambdaSchema>;
