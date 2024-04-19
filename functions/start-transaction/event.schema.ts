import { z } from "zod";

import { regExp } from "../../shared/utils/reg-exp";
import { translate } from "../../shared/i18n/i18n-client-factory";
import { createConfig } from "./config";

export const startTransactionLambdaSchema = (config: ReturnType<typeof createConfig>) =>
  z.object({
    body: z.object({
      currencyFrom: z
        .string({
          required_error: translate("VALIDATION.REQUIRED", { field: "currencyFrom" }),
        })
        .min(1, translate("VALIDATION.EMPTY", { field: "currencyFrom" }))
        .refine(
          (currencyFrom) => {
            return new RegExp(regExp.currencyCode).test(currencyFrom);
          },
          {
            message: translate("VALIDATION.CURRENCY_CODE.SYNTAX", { field: "currencyFrom" }),
          },
        )
        .refine(
          (currencyFrom) => {
            return config.currencyScope.includes(currencyFrom);
          },
          {
            message: translate("VALIDATION.CURRENCY_CODE.SCOPE", {
              field: "currencyFrom",
              scope: config.currencyScope,
            }),
          },
        ),
      currencyTo: z
        .string({
          required_error: translate("VALIDATION.REQUIRED", { field: "currencyTo" }),
        })
        .min(1, translate("VALIDATION.EMPTY", { field: "currencyTo" }))
        .refine(
          (currencyTo) => {
            return new RegExp(regExp.currencyCode).test(currencyTo);
          },
          {
            message: translate("VALIDATION.CURRENCY_CODE.SYNTAX", { field: "currencyTo" }),
          },
        )
        .refine(
          (currencyTo) => {
            return config.currencyScope.includes(currencyTo);
          },
          {
            message: translate("VALIDATION.CURRENCY_CODE.SCOPE", {
              field: "currencyTo",
              scope: config.currencyScope,
            }),
          },
        ),
      currencyFromAmount: z
        .number({
          required_error: translate("VALIDATION.REQUIRED", { field: "currencyFromAmount" }),
        })
        .positive(translate("VALIDATION.POSITIVE", { field: "currencyFromAmount" })),
    }),
  });

export type StartTransactionLambdaPayload = z.infer<ReturnType<typeof startTransactionLambdaSchema>>;
