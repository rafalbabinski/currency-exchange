import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";
import { CurrencyRatesDto } from "../../rates-importer/helpers/to-currency-rates-dto";

export class DynamoDbCurrencyClient {
  private client: DynamoDBClient;

  constructor(private tableName: string, private isOffline: boolean) {
    this.client = createDynamoDBClient(this.isOffline);
  }

  async getCurrencyRates(currencyFrom: string) {
    const queryCommand = new QueryCommand({
      KeyConditionExpression: "#currencyFrom = :currencyFrom",
      ExpressionAttributeNames: {
        "#currencyFrom": "currencyFrom",
      },
      ExpressionAttributeValues: {
        ":currencyFrom": currencyFrom,
      },
      ScanIndexForward: false,
      Limit: 1,
      TableName: this.tableName,
    });

    const { Items } = await this.client.send(queryCommand);

    return Items?.[0] as CurrencyRatesDto;
  }
}
