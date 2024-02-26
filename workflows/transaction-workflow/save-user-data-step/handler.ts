import { Context } from "aws-lambda";
import { SaveUserDataStepLambdaPayload } from "./handler.types";
import { createConfig } from "./config";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { DateTime } from "luxon";
import { TransactionStatus } from "../../../shared/types/transaction.types";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable, isOffline);

export const handle = async (event: SaveUserDataStepLambdaPayload, _context: Context) => {
  const { transactionId } = event;

  const response = await dynamoDbClient.getTransaction(transactionId);

  if (!response) {
    return "No transaction with given id";
  }

  const createdAt = response.sk.replace("transaction#", "");
  const createdAtDate = DateTime.fromISO(createdAt);

  const transactionDeadline = createdAtDate.plus(Number(config.transactionDeadline));
  const currentDate = DateTime.now();

  const isLaterThanDeadline = currentDate > transactionDeadline;

  if (isLaterThanDeadline) {
    const newStatus = TransactionStatus.expired;

    await dynamoDbClient.updateTransactionStatus(response.pk, response.sk, newStatus);
  }

  await dynamoDbClient.updateTransactionUserData(response.pk, response.sk, event.body);

  return {
    success: true,
  };
};
