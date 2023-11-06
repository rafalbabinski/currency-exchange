import { RatesResponse } from "../api/currency/types";

export interface Rates {
  [currencyCode: string]: string | number;
}
export interface CurrencyRatesDto extends Rates {
  currencyName: string;
  createdAt: string;
}

export const toCurrencyRatesDto = (response: RatesResponse): CurrencyRatesDto => {
  const currencyName = response.currency;
  const createdAt = new Date().toISOString();

  const rates: Rates = {};

  response.rates
    .filter((rate) => rate.currency !== currencyName)
    .forEach((rate) => {
      rates[rate.currency] = rate.rate;
    });

  return {
    currencyName,
    createdAt,
    ...rates,
  };
};
