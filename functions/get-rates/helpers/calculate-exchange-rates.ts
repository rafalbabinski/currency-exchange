import { CurrencyRatesDto } from "../../rates-importer/helpers/to-currency-rates-dto";

type CalculateExchangeRateFn = (props: {
  currencyFrom: string;
  currencyRates: CurrencyRatesDto;
}) => Record<string, number>;

export const calculateExchangeRate: CalculateExchangeRateFn = ({ currencyFrom, currencyRates }) => {
  if (!(currencyFrom in currencyRates)) {
    throw new Error("Invalid new base currency provided");
  }

  const baseRate = Number(currencyRates[currencyFrom]);

  if (Number.isNaN(baseRate)) {
    throw Error("Invalid exchange rate values");
  }

  const ratesToBeCalculated: Partial<CurrencyRatesDto> = currencyRates;
  delete ratesToBeCalculated.createdAt;
  delete ratesToBeCalculated.currencyFrom;

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
