import { z } from "zod";

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
      .min(1, "zipCode can't be empty")
      .max(64, "zipCode can have maximum of 64 characters"),
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
