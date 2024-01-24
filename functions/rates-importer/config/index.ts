import { z } from "zod";
import { pipeline } from "ts-pipe-compose";

import { currencySchema } from "../../../shared/utils/currency-schema";

const loadEnvs = (env: any) => ({
  appName: env.APP_NAME,
  dynamoDBCurrencyTable: env.DYNAMODB_CURRENCY_TABLE,
  currencyAvailable: env.CURRENCY_AVAILABLE,
  currencyScope: env.CURRENCY_SCOPE,
  currencyFrom: env.BASE_CURRENCY,
  currencyApiHeader: env.CURRENCY_API_HEADER,
  currencyApiToken: env.CURRENCY_API_TOKEN,
});

const validateConfig = (config: any) => {
  const schema = z.intersection(
    currencySchema,
    z.object({
      currencyApiHeader: z.string().min(1),
      currencyApiToken: z.string().min(1),
    }),
  );

  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
