import { SaveUserDataLambdaPayload } from "../../../../functions/save-user-data/event.schema";
import { TransactionStatus } from "../../../../shared/types/transaction.types";

export type UserData = SaveUserDataLambdaPayload["body"];

export interface Data extends Partial<UserData> {
  transactionId: string;
  taskToken: string;
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

export interface TransactionData extends TransactionDto {
  pk: string;
  sk: string;
  transactionStatus: TransactionStatus;
  securityPaymentKey?: string;
}

export const toTransactionDto = (data: Data): TransactionDto => {
  const createdAt = new Date().toISOString();

  return {
    createdAt,
    transactionStatus: TransactionStatus.Started,
    ...data,
  };
};
