import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";
import { CurrencyRatesData } from "../../rates-importer/helpers/to-currency-rates-dto";

export class DynamoDbCurrencyClient {
  private client: DynamoDBDocumentClient;

  constructor(private tableName: string, private isOffline: boolean) {
    this.client = createDynamoDBClient(this.isOffline);
  }

  async getCurrencyRates(baseImporterCurrency: string) {
    const queryCommand = new QueryCommand({
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames: {
        "#pk": "pk",
      },
      ExpressionAttributeValues: {
        ":pk": `currencyRate#${baseImporterCurrency}`,
      },
      ScanIndexForward: false,
      Limit: 1,
      TableName: this.tableName,
    });

    const { Items } = await this.client.send(queryCommand);

    return Items?.[0] as CurrencyRatesData;
  }
}
