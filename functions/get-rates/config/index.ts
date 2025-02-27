import { z } from "zod";
import { pipeline } from "ts-pipe-compose";

import { currencySchema } from "../../../shared/utils/currency-schema";

const loadEnvs = (env: any) => ({
  apiKey: env.API_KEY,
  dynamoDBCurrencyTable: env.DYNAMODB_CURRENCY_TABLE,
  currencyAvailable: env.CURRENCY_AVAILABLE,
  currencyScope: env.CURRENCY_SCOPE,
  baseImporterCurrency: env.BASE_IMPORTER_CURRENCY,
});

const validateConfig = (config: any) => {
  const schema = z.intersection(
    currencySchema,
    z.object({
      apiKey: z.string().min(1),
    }),
  );
  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
