export type ProcessPaymentPayload = {
  number: string;
  owner: string;
  ccv: string;
  amount: number;
  currency: string;
  month: number;
  year: number;
  transactionId: string;
  statusUrl: string;
};
