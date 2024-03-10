import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionData } from "../../start-transaction-step/helpers/to-transaction-dto";
import { TransactionStatus } from "../../../../shared/types/transaction.types";
import { SaveUserDataLambdaPayload } from "../../../../functions/save-user-data/event.schema";

export class DynamoDbTransactionClient {
  private client: DynamoDBDocumentClient;

  constructor(private tableName: string, private isOffline: boolean) {
    this.client = createDynamoDBClient(this.isOffline);
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

  async updateTransactionStatus(
    pk: string,
    sk: string,
    { transactionStatus, updatedAt }: { transactionStatus: TransactionStatus; updatedAt: string },
  ): Promise<void> {
    const updateItemCommand = new UpdateCommand({
      Key: {
        pk,
        sk,
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

  async updateTransactionUserData(
    pk: string,
    sk: string,
    {
      firstName,
      lastName,
      city,
      zipCode,
      email,
      transactionStatus,
      updatedAt,
      taskToken,
    }: SaveUserDataLambdaPayload["body"] & {
      transactionStatus: TransactionStatus;
      updatedAt: string;
      taskToken: string;
    },
  ): Promise<void> {
    const updateItemCommand = new UpdateCommand({
      Key: {
        pk,
        sk,
      },
      UpdateExpression:
        "set firstName = :firstName, lastName = :lastName, city = :city, zipCode = :zipCode, email = :email, transactionStatus = :transactionStatus, updatedAt = :updatedAt, taskToken = :taskToken",
      ExpressionAttributeValues: {
        ":firstName": firstName,
        ":lastName": lastName,
        ":city": city,
        ":zipCode": zipCode,
        ":email": email,
        ":transactionStatus": transactionStatus,
        ":updatedAt": updatedAt,
        ":taskToken": taskToken,
      },
      TableName: this.tableName,
    });

    await this.client.send(updateItemCommand);
  }
}
