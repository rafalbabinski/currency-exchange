import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { CurrencyRatesDto } from "../helpers/to-currency-rates-dto";

export class DynamoDbCurrencyClient {
  private client: DynamoDBClient;

  constructor(private tableName: string) {
    this.client = new DynamoDBClient();
  }

  async saveCurrencyRates(currencyRates: CurrencyRatesDto): Promise<void> {
    const { createdAt, currencyName, ...rates } = currencyRates;

    const ratesItems = Object.keys(rates).map((currencyCode) => ({
      [currencyCode]: {
        N: rates[currencyCode].toString(),
      },
    }));

    const putItemCommand = new PutItemCommand({
      Item: {
        createdAt: {
          S: createdAt,
        },
        currencyName: {
          S: currencyName,
        },
        ...Object.assign({}, ...ratesItems),
      },
      TableName: this.tableName,
    });

    await this.client.send(putItemCommand);
  }
}
