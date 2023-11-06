import { RatesResponse } from "../api/currency/types";

export interface CurrencyCodeRates {
  [currencyCode: string]: string | number;
}

export interface CurrencyRatesDto extends CurrencyCodeRates {
  currencyName: string;
  createdAt: string;
}

export const toCurrencyRatesDto = (response: RatesResponse): CurrencyRatesDto => {
  const currencyName = response.currency;
  const createdAt = new Date().toISOString();

  const rates: CurrencyCodeRates = {};

  response.rates.forEach((rate) => {
    rates[rate.currency] = rate.rate;
  });

  return {
    currencyName,
    createdAt,
    ...rates,
  };
};
