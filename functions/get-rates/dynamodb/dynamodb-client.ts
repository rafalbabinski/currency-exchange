import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { IQueryCommandOutput } from "../../../shared/types/dynamo-db.types";
import { CurrencyRatesDto } from "../../rates-importer/helpers/to-currency-rates-dto";

export class DynamoDbCurrencyClient {
  private client: DynamoDBClient;

  constructor(private tableName: string, private isOffline: boolean) {
    this.client = createDynamoDBClient(this.isOffline);
  }

  async getCurrencyRates(baseCurrency: string) {
    const queryCommand = new QueryCommand({
      KeyConditionExpression: "#baseCurrency = :baseCurrency",
      ExpressionAttributeNames: {
        "#baseCurrency": "baseCurrency",
      },
      ExpressionAttributeValues: {
        ":baseCurrency": baseCurrency,
      },
      ScanIndexForward: false,
      Limit: 1,
      TableName: this.tableName,
    });

    const { Items } = await this.client.send(queryCommand);

    return { Items } as IQueryCommandOutput<CurrencyRatesDto[]>;
  }
}
