import { CurrencyRatesData } from "../../rates-importer/helpers/to-currency-rates-dto";

type CalculateExchangeRateFn = (props: {
  currencyFrom: string;
  currencyRates: CurrencyRatesData;
}) => Record<string, number>;

export const calculateExchangeRate: CalculateExchangeRateFn = ({ currencyFrom, currencyRates }) => {
  if (!(currencyFrom in currencyRates)) {
    throw new Error("Invalid new base currency provided");
  }

  const baseRate = Number(currencyRates[currencyFrom]);

  if (Number.isNaN(baseRate)) {
    throw Error("Invalid exchange rate values");
  }

  const ratesToBeCalculated: Partial<CurrencyRatesData> = currencyRates;
  delete ratesToBeCalculated.pk;
  delete ratesToBeCalculated.sk;
  delete ratesToBeCalculated.baseImporterCurrency;
  delete ratesToBeCalculated.createdAt;

  const newRates = Object.fromEntries(
    Object.entries(ratesToBeCalculated).map(([currency, defaultRate]) => {
      const rate = Number(defaultRate);

      if (Number.isNaN(rate)) {
        throw Error("Invalid exchange rate values");
      }

      return [currency, parseFloat((rate / baseRate).toFixed(2))];
    }),
  );

  return newRates;
};
