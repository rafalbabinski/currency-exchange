import { z } from "zod";
import { pipeline } from "ts-pipe-compose";

const loadEnvs = (env: any) => ({
  appName: env.APP_NAME,
  dynamoDBCurrencyTable: env.DYNAMODB_CURRENCY_TABLE,
  dynamoDBTransactionTable: env.DYNAMODB_TRANSACTION_TABLE,
  apiKey: env.API_KEY,
});

const validateConfig = (config: any) => {
  const schema = z.object({
    appName: z.string().min(1),
    dynamoDBCurrencyTable: z.string().min(1),
    dynamoDBTransactionTable: z.string().min(1),
    apiKey: z.string().min(1),
  });

  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
