import { z } from "zod";

export const checkTransactionStatusLambdaSchema = z.object({
  queryStringParameters: z.object({
    id: z
      .string({
        required_error: "id is required",
      })
      .min(1, "id can't be empty"),
  }),
});

export type CheckTransactionStatusLambdaPayload = z.infer<typeof checkTransactionStatusLambdaSchema>;
