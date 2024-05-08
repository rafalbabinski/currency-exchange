import { z } from "zod";

export const getTransactionsHistoryLambdaSchema = z.object({
  queryStringParameters: z.object({
    limit: z.coerce.number().min(1, "Minimum limit is 1").max(100, "Maximum limit is 100").optional(),
  }),
});

export type GetTransactionsHistoryLambdaPayload = z.infer<typeof getTransactionsHistoryLambdaSchema>;
