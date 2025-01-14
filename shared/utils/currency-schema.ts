import { z } from "zod";

import { regExp } from "./reg-exp";
import { validateCurrencyList } from "./validate-currency-list";

export const currencySchema = z
  .object({
    dynamoDBCurrencyTable: z.string().min(1),
    currencyAvailable: z.string().refine((currencyAvailable) => validateCurrencyList(currencyAvailable), {
      message:
        "currencyAvailable must be a comma-separated list of valid 3-letter currency codes (e.g., PLN, EUR, USD)",
    }),
    currencyScope: z.string().refine((currencyScope) => validateCurrencyList(currencyScope), {
      message: "currencyScope must be a comma-separated list of valid 3-letter currency codes (e.g., PLN, EUR, USD)",
    }),
    baseImporterCurrency: z.string().refine(
      (baseImporterCurrency) => {
        return new RegExp(regExp.currencyCode).test(baseImporterCurrency);
      },
      {
        message: "baseImporterCurrency must be valid 3-letter currency code (e.g., PLN, EUR, USD)",
      },
    ),
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
  )
  .refine(
    (data) => {
      const currencyScope = data.currencyScope.split(",");

      return currencyScope.includes(data.baseImporterCurrency);
    },
    {
      message: "baseImporterCurrency must be value from currencyScope",
    },
  );
