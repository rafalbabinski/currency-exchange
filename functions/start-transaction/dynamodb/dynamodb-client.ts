import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";
import { TransactionDto } from "../helpers/to-transaction-dto";

export class DynamoDbTransactionClient {
  private client: DynamoDBClient;

  constructor(private tableName: string, private isOffline: boolean) {
    this.client = createDynamoDBClient(this.isOffline);
  }

  async initTransaction({ id, createdAt, ...transaction }: TransactionDto): Promise<void> {
    const putItemCommand = new PutCommand({
      Item: {
        pk: `transaction#${id}`,
        sk: `transaction#${createdAt}`,
        ...transaction,
      },
      TableName: this.tableName,
    });

    await this.client.send(putItemCommand);
  }
}
