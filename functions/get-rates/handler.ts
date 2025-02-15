import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import { StatusCodes } from "http-status-codes";

import { awsLambdaResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { errorLambdaResponse } from "../../shared/middleware/error-lambda-response";
import { queryParser } from "../../shared/middleware/query-parser";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { AppError } from "../../shared/errors/app.error";
import { calculateExchangeRate } from "./helpers/calculate-exchange-rates";
import { createConfig } from "./config";
import { DynamoDbCurrencyClient } from "./dynamodb/dynamodb-client";
import { GetRatesLambdaPayload, getRatesLambdaSchema } from "./event.schema";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable);

const lambdaHandler = async (event: GetRatesLambdaPayload) => {
  const response = await dynamoDbClient.getCurrencyRates(config.baseImporterCurrency);

  if (!response) {
    throw new AppError("No currency rates available");
  }

  const exchangeRates = calculateExchangeRate({
    currencyFrom: event.queryStringParameters.currencyFrom,
    currencyRates: response,
  });

  return awsLambdaResponse(StatusCodes.OK, {
    success: true,
    results: exchangeRates,
  });
};

export const handle = middy()
  .use(inputOutputLoggerConfigured())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpCorsConfigured)
  .use(queryParser())
  .use(zodValidator(getRatesLambdaSchema(config)))
  .use(httpErrorHandlerConfigured)
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
