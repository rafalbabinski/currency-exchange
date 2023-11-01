import { z } from "zod";
import { pipeline } from "ts-pipe-compose";

const loadEnvs = (env: any) => ({
  appName: env.APP_NAME,
  dynamoDBCurrencyTable: env.DYNAMODB_CURRENCY_TABLE,
  currencyAvailable: env.CURRENCY_AVAILABLE,
  currencyScope: env.CURRENCY_SCOPE,
  currencyApiHeader: env.CURRENCY_API_HEADER,
  currencyApiToken: env.CURRENCY_API_TOKEN,
});

const validateConfig = (config: any) => {
  const schema = z
    .object({
      appName: z.string().min(1),
      dynamoDBCurrencyTable: z.string().min(1),
      currencyAvailable: z.string().refine(
        (currencyAvailable) => {
          const currencyArray = currencyAvailable.split(",");

          return currencyArray.length > 0 && currencyArray.every((currency) => /^[A-Z]{3}$/.test(currency));
        },
        {
          message:
            "currencyAvailable must be a comma-separated list of valid 3-letter currency codes (e.g., PLN, EUR, USD)",
        },
      ),
      currencyScope: z.string().refine(
        (currencyScope) => {
          const currencyArray = currencyScope.split(",");

          return currencyArray.length > 0 && currencyArray.every((currency) => /^[A-Z]{3}$/.test(currency));
        },
        {
          message:
            "currencyScope must be a comma-separated list of valid 3-letter currency codes (e.g., PLN, EUR, USD)",
        },
      ),
      currencyApiHeader: z.string().min(1),
      currencyApiToken: z.string().min(1),
    })
    .refine(
      (data) => {
        const currencyAvailable = data.currencyAvailable.split(",");
        const currencyScope = data.currencyScope.split(",");

        return currencyScope.length > 0 && currencyScope.every((currency) => currencyAvailable.includes(currency));
      },
      {
        message: "currencyScope must be a comma-separated list of currencyAvailable",
      },
    );

  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createConfig = pipeline(loadEnvs, validateConfig);
