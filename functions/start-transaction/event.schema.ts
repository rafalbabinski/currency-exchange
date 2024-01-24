import { z } from "zod";
import { regExp } from "../../shared/utils/reg-exp";

export const startTransactionLambdaSchema = z.object({
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
      ),
    currencyTo: z
      .string({
        required_error: "currencyTo is required",
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
    currencyFromAmount: z
      .number({
        required_error: "amount is required",
      })
      .positive("amount must be grater than 0"),
  }),
});

export type StartTransactionLambdaPayload = z.infer<typeof startTransactionLambdaSchema>;
