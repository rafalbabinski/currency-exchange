import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionDto } from "../helpers/to-transaction-dto";

export class DynamoDbTransactionClient {
  private client: DynamoDBClient;

  constructor(private tableName: string, private isOffline: boolean) {
    this.client = createDynamoDBClient(this.isOffline);
  }

  async initTransaction(transaction: TransactionDto): Promise<void> {
    const putItemCommand = new PutCommand({
      Item: {
        ...transaction,
      },
      TableName: this.tableName,
    });

    await this.client.send(putItemCommand);
  }
}
