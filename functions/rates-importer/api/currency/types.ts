export type RatesResponse = CurrencyRates;

export type CurrencyRates = {
  currency: string;
  rates: Rate[];
};

export type Rate = {
  currency: string;
  rate: number;
};
