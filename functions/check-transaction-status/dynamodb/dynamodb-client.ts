import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionData } from "../../../workflows/transaction-workflow/start-transaction-step/helpers/to-transaction-dto";
import { TransactionStatus } from "../../../shared/types/transaction.types";

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

  async updateTransactionStatus(pk: string, sk: string, transactionStatus: TransactionStatus): Promise<void> {
    const updateItemCommand = new UpdateCommand({
      Key: {
        pk,
        sk,
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
