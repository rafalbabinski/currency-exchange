import { RatesResponse } from "../api/currency/types";

export interface Rates {
  [currencyCode: string]: string | number;
}

export interface CurrencyRatesData extends Rates {
  pk: string;
  sk: string;
}

export interface CurrencyRatesDto extends Rates {
  currencyFrom: string;
  createdAt: string;
}

export const toCurrencyRatesDto = (response: RatesResponse, currencyScope: string): CurrencyRatesDto => {
  const currencyFrom = response.currency;
  const createdAt = new Date().toISOString();

  const filteredResponseRates = response.rates.filter((rate) => currencyScope.includes(rate.currency));

  const rates: Rates = {};

  filteredResponseRates.forEach((rate) => {
    rates[rate.currency] = rate.rate;
  });

  return {
    currencyFrom,
    createdAt,
    ...rates,
  };
};
