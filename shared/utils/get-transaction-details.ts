import { TransactionData } from "../../workflows/transaction-workflow/start-transaction-step/helpers/to-transaction-dto";

export const getTransactionDetails = (transaction: TransactionData) => {
  return {
    ...transaction,
    pk: undefined,
    sk: undefined,
    taskToken: undefined,
    securityPaymentKey: undefined,
  };
};
