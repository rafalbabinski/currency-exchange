import { z } from "zod";

import { regExp } from "../../shared/utils/reg-exp";
import { translate } from "../../shared/i18n/i18n-client-factory";
import { createConfig } from "./config";

export const getRatesLambdaSchema = (config: ReturnType<typeof createConfig>) =>
  z.object({
    queryStringParameters: z.object({
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
    }),
  });

export type GetRatesLambdaPayload = z.infer<ReturnType<typeof getRatesLambdaSchema>>;
