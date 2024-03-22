import { RatesResponse } from "../api/currency/types";

export interface Rates {
  [currencyCode: string]: string | number;
}

export interface CurrencyRatesDto extends Rates {
  baseImporterCurrency: string;
  createdAt: string;
}

export interface CurrencyRatesData extends CurrencyRatesDto {
  pk: string;
  sk: string;
}

export const toCurrencyRatesDto = (response: RatesResponse, currencyScope: string): CurrencyRatesDto => {
  const baseImporterCurrency = response.currency;
  const createdAt = new Date().toISOString();

  const filteredResponseRates = response.rates.filter((rate) => currencyScope.includes(rate.currency));

  const rates: Rates = {};

  filteredResponseRates.forEach((rate) => {
    rates[rate.currency] = rate.rate;
  });

  return {
    baseImporterCurrency,
    createdAt,
    ...rates,
  };
};
