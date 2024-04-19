import { z } from "zod";

import { i18next } from "../../shared/i18n/i18n-client-factory";
import { regExp } from "../../shared/utils/reg-exp";

export const saveUserDataLambdaSchema = () =>
  z.object({
    body: z.object({
      firstName: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "firstName" }),
        })
        .min(1, i18next.t("VALIDATION.EMPTY", { field: "firstName" }))
        .max(64, i18next.t("VALIDATION.MAX_CHAR", { field: "firstName", value: 64 })),
      lastName: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "lastName" }),
        })
        .min(1, i18next.t("VALIDATION.EMPTY", { field: "lastName" }))
        .max(64, i18next.t("VALIDATION.MAX_CHAR", { field: "lastName", value: 64 })),
      city: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "city" }),
        })
        .min(1, i18next.t("VALIDATION.EMPTY", { field: "city" }))
        .max(64, i18next.t("VALIDATION.MAX_CHAR", { field: "city", value: 64 })),
      street: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "street" }),
        })
        .min(1, i18next.t("VALIDATION.EMPTY", { field: "street" }))
        .max(64, i18next.t("VALIDATION.MAX_CHAR", { field: "street", value: 64 })),
      zipCode: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "zipCode" }),
        })
        .refine((value) => new RegExp(regExp.zipCode).test(value), {
          message: i18next.t("VALIDATION.ZIP_CODE"),
        }),
      email: z
        .string({
          required_error: i18next.t("VALIDATION.REQUIRED", { field: "email" }),
        })
        .email(i18next.t("VALIDATION.EMAIL")),
    }),
    pathParameters: z.object({
      id: z.string(),
    }),
  });

export type SaveUserDataLambdaPayload = z.infer<ReturnType<typeof saveUserDataLambdaSchema>>;
