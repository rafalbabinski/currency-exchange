import { TransactionStatus } from "../../../shared/types/transaction.types";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { createConfig } from "./config";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

export const handle = async (event: { transactionId: string; securityPaymentKey: string }) => {
  const { transactionId: id, securityPaymentKey } = event;

  const response = await dynamoDbClient.getTransaction(id);

  if (!response) {
    return "No transaction with given id";
  }

  const { createdAt } = response;
  const updatedAt = new Date().toISOString();

  const transactionStatus = TransactionStatus.WaitingForPaymentStatus;

  await dynamoDbClient.updateTransactionStatus({
    id,
    createdAt,
    updatedAt,
    transactionStatus,
    securityPaymentKey,
  });

  return {
    success: true,
  };
};
