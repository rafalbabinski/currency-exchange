import { Context } from "aws-lambda";

import { TransactionStatus } from "../../../shared/types/transaction.types";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { createConfig } from "./config";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

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
