export type RatesParams = {
  baseCurrency: string;
};

export type RatesResponse = {
  baseCurrency: string;
  results: Record<string, number>;
};
