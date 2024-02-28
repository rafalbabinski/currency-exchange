import { Context } from "aws-lambda";
import { createConfig } from "./config";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { TransactionStatus } from "../../../shared/types/transaction.types";

interface Event {
  transactionId: string;
  error: {
    Error: string;
    [key: string]: string;
  };
}

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable, isOffline);

export const handle = async (event: Event, _context: Context) => {
  const response = await dynamoDbClient.getTransaction(event.transactionId);

  const updatedAt = new Date().toISOString();

  if (event.error.Error === "States.Timeout") {
    const transactionStatus = TransactionStatus.Expired;

    await dynamoDbClient.updateTransactionStatus(response.pk, response.sk, {
      transactionStatus,
      updatedAt,
      error: null,
    });

    return {
      success: false,
    };
  }

  const transactionStatus = TransactionStatus.Error;

  await dynamoDbClient.updateTransactionStatus(response.pk, response.sk, {
    transactionStatus,
    updatedAt,
    error: JSON.stringify(event.error),
  });

  return {
    success: false,
  };
};
