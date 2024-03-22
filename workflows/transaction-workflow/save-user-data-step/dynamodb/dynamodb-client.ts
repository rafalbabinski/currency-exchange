import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionData } from "../../start-transaction-step/helpers/to-transaction-dto";
import { TransactionStatus } from "../../../../shared/types/transaction.types";
import { SaveUserDataLambdaPayload } from "../../../../functions/save-user-data/event.schema";

export class DynamoDbTransactionClient {
  private client: DynamoDBDocumentClient;

  constructor(private tableName: string) {
    this.client = createDynamoDBClient();
  }

  async getTransaction(id: string) {
    const queryCommand = new QueryCommand({
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames: {
        "#pk": "pk",
      },
      ExpressionAttributeValues: {
        ":pk": `transaction#${id}`,
      },
      ScanIndexForward: false,
      Limit: 1,
      TableName: this.tableName,
    });

    const { Items } = await this.client.send(queryCommand);

    return Items?.[0] as TransactionData;
  }

  async updateTransactionStatus({
    id,
    createdAt,
    updatedAt,
    transactionStatus,
  }: {
    id: string;
    createdAt: string;
    updatedAt: string;
    transactionStatus: TransactionStatus;
  }): Promise<void> {
    const updateItemCommand = new UpdateCommand({
      Key: {
        pk: `transaction#${id}`,
        sk: `createdAt#${createdAt}`,
      },
      UpdateExpression: "set transactionStatus = :transactionStatus, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":transactionStatus": transactionStatus,
        ":updatedAt": updatedAt,
      },
      TableName: this.tableName,
    });

    await this.client.send(updateItemCommand);
  }

  async updateTransactionUserData({
    id,
    createdAt,
    updatedAt,
    firstName,
    lastName,
    city,
    zipCode,
    email,
    transactionStatus,
  }: SaveUserDataLambdaPayload["body"] & {
    id: string;
    createdAt: string;
    updatedAt: string;
    transactionStatus: TransactionStatus;
  }): Promise<void> {
    const updateItemCommand = new UpdateCommand({
      Key: {
        pk: `transaction#${id}`,
        sk: `createdAt#${createdAt}`,
      },
      UpdateExpression:
        "set firstName = :firstName, lastName = :lastName, city = :city, zipCode = :zipCode, email = :email, transactionStatus = :transactionStatus, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":firstName": firstName,
        ":lastName": lastName,
        ":city": city,
        ":zipCode": zipCode,
        ":email": email,
        ":transactionStatus": transactionStatus,
        ":updatedAt": updatedAt,
      },
      TableName: this.tableName,
    });

    await this.client.send(updateItemCommand);
  }
}
