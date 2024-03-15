import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { CurrencyRatesDto } from "../helpers/to-currency-rates-dto";
import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";

export class DynamoDbCurrencyClient {
  private client: DynamoDBDocumentClient;

  constructor(private tableName: string) {
    this.client = createDynamoDBClient();
  }

  async saveCurrencyRates(currencyRates: CurrencyRatesDto): Promise<void> {
    const { createdAt, baseImporterCurrency, ...rates } = currencyRates;

    const ratesItems = Object.keys(rates).map((currencyCode) => ({
      [currencyCode]: rates[currencyCode].toString(),
    }));

    const putItemCommand = new PutCommand({
      Item: {
        pk: `currencyRate#${baseImporterCurrency}`,
        sk: `createdAt#${createdAt}`,
        baseImporterCurrency,
        createdAt,
        ...Object.assign({}, ...ratesItems),
      },
      TableName: this.tableName,
    });

    await this.client.send(putItemCommand);
  }
}
