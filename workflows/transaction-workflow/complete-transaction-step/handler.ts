import { Context } from "aws-lambda";
import { createConfig } from "./config";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { TransactionStatus } from "../../../shared/types/transaction.types";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable, isOffline);

export const handle = async (event: { [key: string]: any }, _context: Context) => {
  const { transactionId } = event;

  const response = await dynamoDbClient.getTransaction(transactionId);

  if (!response) {
    return "No transaction with given id";
  }

  const updatedAt = new Date().toISOString();

  await dynamoDbClient.updateTransactionStatus(response.pk, response.sk, {
    transactionStatus: TransactionStatus.WaitingForPaymentStatus,
    updatedAt,
  });

  return {
    success: true,
  };
};
