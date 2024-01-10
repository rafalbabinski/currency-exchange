import { nanoid } from "nanoid";
import { TransactionStatus } from "../../../shared/types/transaction.types";

export interface Data {
  baseCurrency: string;
  baseCurrencyAmount: number;
  endCurrency: string;
  endCurrencyAmount: number;
  rate: number;
}

export interface TransactionDto {
  id: string;
  createdAt: string;
  baseCurrency: string;
  baseCurrencyAmount: number;
  endCurrency: string;
  endCurrencyAmount: number;
  rate: number;
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
