import { Context } from "aws-lambda";

import { calculateExchangeRate } from "../../../functions/get-rates/helpers/calculate-exchange-rates";
import { DynamoDbCurrencyClient } from "../../../functions/get-rates/dynamodb/dynamodb-client";
import { toTransactionDto } from "./helpers/to-transaction-dto";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { createConfig } from "./config";
import { StartTransactionStepLambdaPayload } from "./types";

const config = createConfig(process.env);

const dynamoDbTransactionClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

const dynamoDbCurrencyClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable);

export const handle = async (event: StartTransactionStepLambdaPayload, _context: Context) => {
  const { currencyFrom, currencyFromAmount, currencyTo } = event.body;

  const currencyRates = await dynamoDbCurrencyClient.getCurrencyRates(currencyFrom);

  const exchangeRates = calculateExchangeRate({
    currencyFrom,
    currencyRates,
  });

  const exchangeRate = exchangeRates[currencyTo];

  const currencyToAmount = Number((exchangeRate * currencyFromAmount).toFixed(2));

  const transaction = { ...event.body, currencyToAmount, exchangeRate };

  const mappedTransaction = toTransactionDto({ transactionId: event.transactionId, ...transaction });

  await dynamoDbTransactionClient.initTransaction(mappedTransaction);
};
