import { pipeline } from "ts-pipe-compose";
import { z } from "zod";

const loadEnvs = (env: any) => ({
  appName: env.APP_NAME,
  apiKey: env.API_KEY,
});

const validateConfig = (config: any) => {
  const schema = z.object({
    appName: z.string().min(1),
    apiKey: z.string().min(1),
  });

  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
