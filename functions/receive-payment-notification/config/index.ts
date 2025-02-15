import { z } from "zod";
import { pipeline } from "ts-pipe-compose";

const loadEnvs = (env: any) => ({
  apiKey: env.API_KEY,
  dynamoDBCurrencyTable: env.DYNAMODB_CURRENCY_TABLE,
  paymentApiUrl: env.PAYMENT_API_URL,
  sesFromEmailAddress: env.SES_FROM_EMAIL_ADDRESS,
});

const validateConfig = (config: any) => {
  const schema = z.object({
    apiKey: z.string().min(1),
    dynamoDBCurrencyTable: z.string().min(1),
    paymentApiUrl: z.string().min(1),
    sesFromEmailAddress: z.string().email(),
  });

  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
