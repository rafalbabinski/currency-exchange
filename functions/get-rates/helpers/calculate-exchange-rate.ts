import { CurrencyRatesDto } from "../../rates-importer/helpers/to-currency-rates-dto";

type CalculateExchangeRateFn = (props: {
  startCurrency: string;
  endCurrency: string;
  currencyRates: CurrencyRatesDto;
}) => number | null;

export const calculateExchangeRate: CalculateExchangeRateFn = ({ startCurrency, endCurrency, currencyRates }) => {
  if (currencyRates[startCurrency] === undefined || currencyRates[endCurrency] === undefined) {
    throw Error("Invalid currencies provided");
  }

  const baseRate = Number(currencyRates[startCurrency]);
  const targetRate = Number(currencyRates[endCurrency]);

  if (Number.isNaN(baseRate) || Number.isNaN(targetRate)) {
    throw Error("Invalid exchange rate values");
  }

  const exchangeRate = targetRate / baseRate;

  return exchangeRate;
};
