import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionData } from "../../../workflows/transaction-workflow/start-transaction-step/helpers/to-transaction-dto";
import { TransactionStatus } from "../../../shared/types/transaction.types";

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
    transactionStatus,
  }: {
    id: string;
    createdAt: string;
    transactionStatus: TransactionStatus;
  }): Promise<void> {
    const updateItemCommand = new UpdateCommand({
      Key: {
        pk: `transaction#${id}`,
        sk: `createdAt#${createdAt}`,
      },
      UpdateExpression: "set transactionStatus = :transactionStatus",
      ExpressionAttributeValues: {
        ":transactionStatus": transactionStatus,
      },
      TableName: this.tableName,
    });

    await this.client.send(updateItemCommand);
  }
}
