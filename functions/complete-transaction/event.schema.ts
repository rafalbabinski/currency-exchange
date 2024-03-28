import { z } from "zod";
import cardValidator from "card-validator";

export const completeTransactionLambdaSchema = z.object({
  body: z.object({
    cardholderName: z
      .string({
        required_error: "cardholderName is required",
      })
      .refine((value) => cardValidator.cardholderName(value).isValid, {
        message: "cardholderName is not valid",
      }),
    cardNumber: z
      .string({
        required_error: "cardNumber is required",
      })
      .refine((value) => cardValidator.number(value).isValid, {
        message: "cardNumber is not valid",
      }),
    expirationMonth: z
      .string({
        required_error: "expirationMonth is required",
      })
      .refine((value) => cardValidator.expirationMonth(value).isValid, {
        message: "expirationMonth is not valid",
      }),
    expirationYear: z
      .string({
        required_error: "expirationYear is required",
      })
      .refine((value) => cardValidator.expirationYear(value).isValid, {
        message: "expirationYear is not valid",
      }),
    ccv: z
      .string({
        required_error: "ccv is required",
      })
      .refine((value) => cardValidator.cvv(value).isValid, {
        message: "ccv is not valid",
      }),
  }),
  pathParameters: z.object({
    id: z.string(),
  }),
});

export type CompleteTransactionLambdaPayload = z.infer<typeof completeTransactionLambdaSchema>;
