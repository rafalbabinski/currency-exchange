import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";
import { addSeconds, isAfter } from "date-fns";

import { awsLambdaResponse } from "../../shared/aws";
import { createConfig } from "./config";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { CheckTransactionStatusLambdaPayload, checkTransactionStatusLambdaSchema } from "./event.schema";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { TransactionStatus } from "../../shared/types/transaction.types";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable, isOffline);

const lambdaHandler = async (event: CheckTransactionStatusLambdaPayload) => {
  const { id } = event.queryStringParameters;

  const response = await dynamoDbClient.getTransaction(id);

  if (!response) {
    return awsLambdaResponse(StatusCodes.OK, "No transaction with given id.");
  }

  if (response.status !== "started") {
    return awsLambdaResponse(StatusCodes.OK, { status: response.status });
  }

  const createdAt = response.sk.replace("transaction#", "");
  const createdAtDate = new Date(createdAt);

  const transactionDeadline = addSeconds(createdAtDate, Number(config.transactionDeadline));
  const currentDate = new Date();

  const isLaterThanDeadline = isAfter(currentDate, transactionDeadline);

  if (isLaterThanDeadline) {
    return awsLambdaResponse(StatusCodes.OK, { status: response.status });
  }

  const newStatus: TransactionStatus = "expired";

  await dynamoDbClient.updateTransactionStatus(id, newStatus);

  return awsLambdaResponse(StatusCodes.OK, { status: newStatus });
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpCorsConfigured)
  .use(queryParser())
  .use(zodValidator(checkTransactionStatusLambdaSchema))
  .use(httpErrorHandlerConfigured)
  .handler(lambdaHandler);
