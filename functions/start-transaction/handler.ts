import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";
import { awsLambdaResponse } from "../../shared/aws";
import { createConfig } from "./config";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { StartTransactionLambdaPayload, startTransactionLambdaSchema } from "./event.schema";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { toTransactionDto } from "./helpers/to-transaction-dto";
import { calculateExchangeRate } from "../get-rates/helpers/calculate-exchange-rates";
import { DynamoDbCurrencyClient } from "../get-rates/dynamodb/dynamodb-client";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const dynamoDbTransactionClient = new DynamoDbTransactionClient(config.dynamoDBTransactionTable, isOffline);

const dynamoDbCurrencyClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable, isOffline);

const lambdaHandler = async (event: StartTransactionLambdaPayload) => {
  const { baseCurrency, baseCurrencyAmount, endCurrency } = event.body;

  const currencyRates = await dynamoDbCurrencyClient.getCurrencyRates(baseCurrency);

  const exchangeRates = calculateExchangeRate({
    baseCurrency,
    currencyRates,
  });

  const exchangeRate = exchangeRates[endCurrency];

  const endCurrencyAmount = exchangeRate * baseCurrencyAmount;

  const transaction = { ...event.body, endCurrencyAmount, exchangeRate };

  const mappedTransaction = toTransactionDto(transaction);

  await dynamoDbTransactionClient.initTransaction(mappedTransaction);

  return awsLambdaResponse(StatusCodes.OK, {
    success: true,
    ...mappedTransaction,
  });
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpCorsConfigured)
  .use(queryParser())
  .use(zodValidator(startTransactionLambdaSchema))
  .use(httpErrorHandlerConfigured)
  .handler(lambdaHandler);
