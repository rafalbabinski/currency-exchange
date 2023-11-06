import { z } from "zod";

export const ratesImporterLambdaSchema = z.object({
  queryStringParameters: z.object({
    exampleParam: z
      .string({
        required_error: "exampleParam is required",
      })
      .min(1, "exampleParam can't be empty"),
  }),
});

export type RatesImporterLambdaPayload = z.infer<typeof ratesImporterLambdaSchema>;
