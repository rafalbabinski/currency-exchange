import { TransactionStatus } from "../../../../shared/types/transaction.types";

export interface Data {
  transactionId: string;
  currencyFrom: string;
  currencyFromAmount: number;
  currencyTo: string;
  currencyToAmount: number;
  exchangeRate: number;
}

export interface TransactionDto extends Data {
  createdAt: string;
  transactionStatus: TransactionStatus;
}

export interface TransactionData extends Data {
  pk: string;
  sk: string;
  transactionStatus: TransactionStatus;
}

export const toTransactionDto = (data: Data): TransactionDto => {
  const createdAt = new Date().toISOString();

  return {
    createdAt,
    ...data,
    transactionStatus: TransactionStatus.Started,
  };
};
