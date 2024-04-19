import { z } from "zod";
import cardValidator from "card-validator";

import { i18next } from "../../shared/i18n/i18n-client-factory";

export const completeTransactionLambdaSchema = () =>
  z.object({
    body: z.object({
      cardholderName: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "cardholderName" }),
        })
        .refine((value) => cardValidator.cardholderName(value).isValid, {
          message: i18next.t("VALIDATION.NOT_VALID", { field: "cardholderName" }),
        }),
      cardNumber: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "cardNumber" }),
        })
        .refine((value) => cardValidator.number(value).isValid, {
          message: i18next.t("VALIDATION.NOT_VALID", { field: "cardNumber" }),
        }),
      expirationMonth: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "expirationMonth" }),
        })
        .refine((value) => cardValidator.expirationMonth(value).isValid, {
          message: i18next.t("VALIDATION.NOT_VALID", { field: "expirationMonth" }),
        }),
      expirationYear: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "expirationYear" }),
        })
        .refine((value) => cardValidator.expirationYear(value).isValid, {
          message: i18next.t("VALIDATION.NOT_VALID", { field: "expirationYear" }),
        }),
      ccv: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "ccv" }),
        })
        .refine((value) => cardValidator.cvv(value).isValid, {
          message: i18next.t("VALIDATION.NOT_VALID", { field: "ccv" }),
        }),
    }),
    pathParameters: z.object({
      id: z.string(),
    }),
  });

export type CompleteTransactionLambdaPayload = z.infer<ReturnType<typeof completeTransactionLambdaSchema>>;
