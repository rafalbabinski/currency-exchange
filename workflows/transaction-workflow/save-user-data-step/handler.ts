import { TransactionStatus } from "../../../shared/types/transaction.types";
import { checkTransactionExpired } from "../../../shared/utils/check-transaction-expired";
import { SaveUserDataStepLambdaPayload } from "./types";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { createConfig } from "./config";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

export const handle = async (event: SaveUserDataStepLambdaPayload) => {
  const { transactionId: id, taskToken } = event;

  const response = await dynamoDbClient.getTransaction(id);

  if (!response) {
    return "No transaction with given id";
  }

  const { createdAt } = response;
  const updatedAt = new Date().toISOString();

  const hasTransactionExpired = checkTransactionExpired({
    createdAt,
    timeToCompleteTransaction: Number(config.timeToCompleteTransaction),
  });

  if (hasTransactionExpired) {
    const transactionStatus = TransactionStatus.Expired;

    await dynamoDbClient.updateTransactionStatus({ id, createdAt, updatedAt, transactionStatus });

    return {
      success: false,
    };
  }

  const transactionStatus = TransactionStatus.WaitingForPayment;

  await dynamoDbClient.updateTransactionUserData({
    id,
    createdAt,
    updatedAt,
    transactionStatus,
    taskToken,
    ...event.body,
  });

  return {
    success: true,
  };
};
