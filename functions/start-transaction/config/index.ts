import { z } from "zod";
import { pipeline } from "ts-pipe-compose";

import { currencySchema } from "../../../shared/utils/currency-schema";

const loadEnvs = (env: any) => ({
  dynamoDBCurrencyTable: env.DYNAMODB_CURRENCY_TABLE,
  currencyAvailable: env.CURRENCY_AVAILABLE,
  currencyScope: env.CURRENCY_SCOPE,
  baseImporterCurrency: env.BASE_IMPORTER_CURRENCY,
  stateMachineArn: env.STATE_MACHINE_ARN,
  stateMachineArnOffline: env.STATE_MACHINE_ARN_OFFLINE,
});

const validateConfig = (config: any) => {
  const schema = z.intersection(
    currencySchema,
    z.object({
      stateMachineArn: z.string().min(1),
      stateMachineArnOffline: z.string().min(1),
    }),
  );

  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
