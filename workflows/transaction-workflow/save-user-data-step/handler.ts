import { Context } from "aws-lambda";

import { TransactionStatus } from "../../../shared/types/transaction.types";
import { checkTransactionExpired } from "../../../shared/utils/check-transaction-expired";
import { SaveUserDataStepLambdaPayload } from "./types";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { createConfig } from "./config";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

export const handle = async (event: SaveUserDataStepLambdaPayload, _context: Context) => {
  const { transactionId, taskToken } = event;

  const response = await dynamoDbClient.getTransaction(transactionId);

  if (!response) {
    return "No transaction with given id";
  }

  const createdAt = response.sk.replace("createdAt#", "");
  const updatedAt = new Date().toISOString();

  const hasTransactionExpired = checkTransactionExpired({
    createdAt,
    timeToCompleteTransaction: Number(config.timeToCompleteTransaction),
  });

  if (hasTransactionExpired) {
    const transactionStatus = TransactionStatus.Expired;

    await dynamoDbClient.updateTransactionStatus(response.pk, response.sk, { transactionStatus, updatedAt });

    return {
      success: false,
    };
  }

  const transactionStatus = TransactionStatus.WaitingForPayment;

  await dynamoDbClient.updateTransactionUserData(response.pk, response.sk, {
    ...event.body,
    transactionStatus,
    updatedAt,
    taskToken,
  });

  return {
    success: true,
  };
};
