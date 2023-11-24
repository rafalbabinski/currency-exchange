import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { CurrencyRatesDto } from "../helpers/to-currency-rates-dto";
import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";

export class DynamoDbCurrencyClient {
  private client: DynamoDBClient;

  constructor(private tableName: string, private isOffline: boolean) {
    this.client = createDynamoDBClient(this.isOffline);
  }

  async saveCurrencyRates(currencyRates: CurrencyRatesDto): Promise<void> {
    const { createdAt, baseCurrency, ...rates } = currencyRates;

    const ratesItems = Object.keys(rates).map((currencyCode) => ({
      [currencyCode]: rates[currencyCode].toString(),
    }));

    const putItemCommand = new PutCommand({
      Item: {
        createdAt,
        baseCurrency,
        ...Object.assign({}, ...ratesItems),
      },
      TableName: this.tableName,
    });

    await this.client.send(putItemCommand);
  }
}
