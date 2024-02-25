import { z } from "zod";
import { pipeline } from "ts-pipe-compose";

const loadEnvs = (env: any) => ({
  dynamoDBCurrencyTable: env.DYNAMODB_CURRENCY_TABLE,
  stateMachineArn: env.STATE_MACHINE_ARN,
  stateMachineArnOffline: env.STATE_MACHINE_ARN_OFFLINE,
});

const validateConfig = (config: any) => {
  const schema = z.object({
    dynamoDBCurrencyTable: z.string().min(1),
    stateMachineArn: z.string().min(1),
    stateMachineArnOffline: z.string().min(1),
  });

  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
