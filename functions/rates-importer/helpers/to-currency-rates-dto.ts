import { RatesResponse } from "../api/currency/types";

export interface Rates {
  [currencyCode: string]: string | number;
}

export interface CurrencyRatesDto extends Rates {
  baseCurrency: string;
  createdAt: string;
}

export const toCurrencyRatesDto = (response: RatesResponse): CurrencyRatesDto => {
  const baseCurrency = response.currency;
  const createdAt = new Date().toISOString();

  const rates: Rates = {};

  response.rates.forEach((rate) => {
    rates[rate.currency] = rate.rate;
  });

  return {
    baseCurrency,
    createdAt,
    ...rates,
  };
};
