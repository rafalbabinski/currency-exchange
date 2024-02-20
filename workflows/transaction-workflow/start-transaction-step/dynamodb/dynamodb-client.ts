import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionDto } from "../helpers/to-transaction-dto";

export class DynamoDbTransactionClient {
  private client: DynamoDBDocumentClient;

  constructor(private tableName: string, private isOffline: boolean) {
    this.client = createDynamoDBClient(this.isOffline);
  }

  async initTransaction({ transactionId, createdAt, ...transaction }: TransactionDto): Promise<void> {
    const putItemCommand = new PutCommand({
      Item: {
        pk: `transaction#${transactionId}`,
        sk: `transaction#${createdAt}`,
        ...transaction,
      },
      TableName: this.tableName,
    });

    await this.client.send(putItemCommand);
  }
}
