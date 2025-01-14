import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";

import { awsLambdaResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { queryParser } from "../../shared/middleware/query-parser";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { errorLambdaResponse } from "../../shared/middleware/error-lambda-response";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { getTransactionDetails } from "../../shared/utils/get-transaction-details";
import { createConfig } from "./config";
import { GetTransactionsHistoryLambdaPayload, getTransactionsHistoryLambdaSchema } from "./event.schema";

const DEFAULT_LIMIT = 20;

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

const lambdaHandler = async (event: GetTransactionsHistoryLambdaPayload) => {
  const { limit = DEFAULT_LIMIT } = event.queryStringParameters;

  const response = await dynamoDbClient.getTransactions(limit);

  return awsLambdaResponse(StatusCodes.OK, {
    success: true,
    results: response.map((transaction) => getTransactionDetails(transaction)),
  });
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpCorsConfigured)
  .use(queryParser())
  .use(zodValidator(getTransactionsHistoryLambdaSchema))
  .use(httpErrorHandlerConfigured)
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
