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
import { TransactionStatus } from "../../shared/types/transaction.types";
import { i18next } from "../../shared/i18n/i18n-client-factory";
import { i18n } from "../../shared/middleware/i18n";
import { createConfig } from "./config";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

const stepFunctionsClient = createStepFunctionsClient();

const lambdaHandler = async (event: SaveUserDataLambdaPayload) => {
  const { id } = event.pathParameters;

  const transaction = await dynamoDbClient.getTransaction(id);

  if (!transaction) {
    return awsLambdaResponse(StatusCodes.NOT_FOUND, {
      error: i18next.t("ERROR.TRANSACTION.ID_NOT_MATCH"),
    });
  }

  if (transaction.transactionStatus !== TransactionStatus.Started) {
    return awsLambdaResponse(StatusCodes.CONFLICT, {
      error: i18next.t("ERROR.TRANSACTION.STATUS_NOT_CORRECT"),
    });
  }

  const input: SendTaskSuccessInput = {
    taskToken: transaction.taskToken,
    output: JSON.stringify({
      transactionId: id,
      body: event.body,
    }),
  };

  const command = new SendTaskSuccessCommand(input);

  await stepFunctionsClient.send(command);

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
  .use(i18n)
  .use({
    before: (request) => zodValidator(saveUserDataLambdaSchema()).before(request),
  })
  .use(httpErrorHandlerConfigured)
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
