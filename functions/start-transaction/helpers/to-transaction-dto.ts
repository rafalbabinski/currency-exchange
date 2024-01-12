import { nanoid } from "nanoid";
import { TransactionStatus } from "../../../shared/types/transaction.types";

export interface Data {
  baseCurrency: string;
  baseCurrencyAmount: number;
  endCurrency: string;
  endCurrencyAmount: number;
  exchangeRate: number;
}

export interface TransactionDto extends Data {
  id: string;
  createdAt: string;
  status: TransactionStatus;
}

export const toTransactionDto = (data: Data): TransactionDto => {
  const createdAt = new Date().toISOString();

  return {
    id: nanoid(),
    createdAt,
    ...data,
    status: "started",
  };
};
