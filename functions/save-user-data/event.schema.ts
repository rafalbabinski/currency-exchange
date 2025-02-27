import { z } from "zod";
import { regExp } from "../../shared/utils/reg-exp";

export const saveUserDataLambdaSchema = z.object({
  body: z.object({
    firstName: z
      .string({
        required_error: "firstName is required",
      })
      .min(1, "firstName can't be empty")
      .max(64, "firstName can have maximum of 64 characters"),
    lastName: z
      .string({
        required_error: "lastName is required",
      })
      .min(1, "lastName can't be empty")
      .max(64, "lastName can have maximum of 64 characters"),
    city: z
      .string({
        required_error: "city is required",
      })
      .min(1, "city can't be empty")
      .max(64, "city can have maximum of 64 characters"),
    street: z
      .string({
        required_error: "street is required",
      })
      .min(1, "street can't be empty")
      .max(64, "street can have maximum of 64 characters"),
    zipCode: z
      .string({
        required_error: "zipCode is required",
      })
      .refine((value) => new RegExp(regExp.zipCode).test(value), {
        message: "zipCode must be in one of the following formats: XX-XXX, XXXXX, XX XXX",
      }),
    email: z
      .string({
        required_error: "email is required",
      })
      .email("email must be a valid email"),
  }),
  pathParameters: z.object({
    id: z.string(),
  }),
});

export type SaveUserDataLambdaPayload = z.infer<typeof saveUserDataLambdaSchema>;
