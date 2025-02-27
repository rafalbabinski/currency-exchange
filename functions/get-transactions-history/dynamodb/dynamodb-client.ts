import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionData } from "../../../workflows/transaction-workflow/start-transaction-step/helpers/to-transaction-dto";
import { TransactionStatus } from "../../../shared/types/transaction.types";

export class DynamoDbTransactionClient {
  private client: DynamoDBDocumentClient;

  constructor(private tableName: string) {
    this.client = createDynamoDBClient();
  }

  async getTransactions(limit: number) {
    const scanCommand = new ScanCommand({
      FilterExpression: "#transactionStatus = :transactionStatus",
      ExpressionAttributeNames: {
        "#transactionStatus": "transactionStatus",
      },
      ExpressionAttributeValues: {
        ":transactionStatus": TransactionStatus.PaymentSuccess,
      },
      Limit: limit,
      TableName: this.tableName,
    });

    const { Items } = await this.client.send(scanCommand);

    return Items as TransactionData[];
  }
}
