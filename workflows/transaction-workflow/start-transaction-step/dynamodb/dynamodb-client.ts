import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionDto } from "../helpers/to-transaction-dto";

export class DynamoDbTransactionClient {
  private client: DynamoDBDocumentClient;

  constructor(private tableName: string) {
    this.client = createDynamoDBClient();
  }

  async initTransaction(transaction: TransactionDto): Promise<void> {
    const { transactionId, createdAt } = transaction;

    const putItemCommand = new PutCommand({
      Item: {
        pk: `transaction#${transactionId}`,
        sk: `createdAt#${createdAt}`,
        ...transaction,
      },
      TableName: this.tableName,
    });

    await this.client.send(putItemCommand);
  }
}
