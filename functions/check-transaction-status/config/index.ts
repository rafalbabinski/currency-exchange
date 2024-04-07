import { z } from "zod";
import { pipeline } from "ts-pipe-compose";

const loadEnvs = (env: any) => ({
  apiKey: env.API_KEY,
  dynamoDBCurrencyTable: env.DYNAMODB_CURRENCY_TABLE,
  timeToCompleteTransaction: env.TIME_TO_COMPLETE_TRANSACTION,
});

const validateConfig = (config: any) => {
  const schema = z.object({
    apiKey: z.string().min(1),
    dynamoDBCurrencyTable: z.string().min(1),
    timeToCompleteTransaction: z.string().min(1),
  });

  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
