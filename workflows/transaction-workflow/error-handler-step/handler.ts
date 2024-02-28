import { Context } from "aws-lambda";
import { createConfig } from "./config";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { TransactionStatus } from "../../../shared/types/transaction.types";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable, isOffline);

export const handle = async (event: { [key: string]: any }, _context: Context) => {
  if (event.error.Error === "States.Timeout") {
    const newStatus = TransactionStatus.expired;

    await dynamoDbClient.updateTransactionStatus(
      `transaction#${event.transactionId}`,
      `updatedAt${new Date().toISOString()}`,
      newStatus,
    );
  }
  console.log("--------------------------------");
  console.log("Error name:", event.error);
  console.log("--------------------------------");

  console.log("Error cause:", event.cause);

  console.log("--------------------------------");

  console.log("Context:", _context);

  console.log("Event:", event);
};
