export type RatesResponse = Currency;

export type Currency = {
  currency: string;
  rates: Rate[];
};

export type Rate = {
  currency: string;
  rate: number;
};
