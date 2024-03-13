import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";

import { awsLambdaResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { SaveUserDataLambdaPayload, saveUserDataLambdaSchema } from "./event.schema";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { errorLambdaResponse } from "../../shared/middleware/error-lambda-response";
import { createStepFunctionsClient } from "../../shared/step-functions/step-functions-client-factory";
import { SendTaskSuccessCommand, SendTaskSuccessInput } from "@aws-sdk/client-sfn";
import { DynamoDbTransactionClient } from "../check-transaction-status/dynamodb/dynamodb-client";
import { createConfig } from "./config";
import { TransactionStatus } from "../../shared/types/transaction.types";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

const lambdaHandler = async (event: SaveUserDataLambdaPayload) => {
  const { id } = event.pathParameters;

  const transaction = await dynamoDbClient.getTransaction(id);

  if (!transaction) {
    return awsLambdaResponse(StatusCodes.NOT_FOUND, {
      error: "No transaction with given id",
    });
  }

  if (transaction.transactionStatus !== TransactionStatus.Started) {
    return awsLambdaResponse(StatusCodes.BAD_REQUEST, {
      error: "Transaction status is not correct",
    });
  }

  const client = createStepFunctionsClient();

  const input: SendTaskSuccessInput = {
    taskToken: transaction.taskToken,
    output: JSON.stringify({
      transactionId: id,
      body: event.body,
    }),
  };

  const command = new SendTaskSuccessCommand(input);

  await client.send(command);

  return awsLambdaResponse(StatusCodes.OK, {
    success: true,
  });
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpCorsConfigured)
  .use(queryParser())
  .use(zodValidator(saveUserDataLambdaSchema))
  .use(httpErrorHandlerConfigured)
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
