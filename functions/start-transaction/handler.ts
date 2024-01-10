/* eslint-disable no-console */
import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";
import { awsLambdaResponse } from "../../shared/aws";
// import { winstonLogger } from "../../shared/logger";
import { createConfig } from "./config";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { StartTransactionLambdaPayload, startTransactionLambdaSchema } from "./event.schema";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { DynamoDbCurrencyClient } from "./dynamodb/dynamodb-client";
import { createRatesApiClient } from "./api/rates";
import { toTransactionDto } from "./helpers/to-transaction-dto";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const ratesApiClient = createRatesApiClient(isOffline, config.stage, config.getRatesLambdaURL);

const dynamoDbClient = new DynamoDbCurrencyClient(config.dynamoDBTransactionTable, isOffline);

const lambdaHandler = async (event: StartTransactionLambdaPayload) => {
  const { baseCurrency, baseCurrencyAmount, endCurrency } = event.body;

  const rates = await ratesApiClient.getRates({
    baseCurrency,
  });

  const rate = rates.results[endCurrency];

  const endCurrencyAmount = rate * baseCurrencyAmount;

  const transaction = { ...event.body, endCurrencyAmount, rate };

  const mappedTransaction = toTransactionDto(transaction);

  await dynamoDbClient.initTransaction(mappedTransaction);

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
