import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { nanoid } from "nanoid";
import { StatusCodes } from "http-status-codes";
import { StartExecutionCommand, StartExecutionCommandInput } from "@aws-sdk/client-sfn";
import { awsLambdaResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { errorLambdaResponse } from "../../shared/middleware/error-lambda-response";
import { createStepFunctionsClient } from "../../shared/step-functions/step-functions-client-factory";
import { TransactionStatus } from "../../shared/types/transaction.types";
import { AppError } from "../../shared/errors/app.error";
import { StartTransactionLambdaPayload, startTransactionLambdaSchema } from "./event.schema";
import { createConfig } from "./config";
import { DynamoDbCurrencyClient } from "../get-rates/dynamodb/dynamodb-client";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const dynamoDbCurrencyClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable);

const lambdaHandler = async (event: StartTransactionLambdaPayload) => {
  const response = await dynamoDbCurrencyClient.getCurrencyRates(config.baseImporterCurrency);

  if (!response) {
    throw new AppError("No currency rates available");
  }

  const client = createStepFunctionsClient();

  const transactionId = nanoid();

  const input: StartExecutionCommandInput = {
    stateMachineArn: isOffline ? config.stateMachineArnOffline : config.stateMachineArn,
    input: JSON.stringify({
      body: {
        transactionId,
        ...event.body,
      },
    }),
  };

  const command = new StartExecutionCommand(input);

  await client.send(command);

  return awsLambdaResponse(StatusCodes.OK, {
    success: true,
    transactionId,
    status: TransactionStatus.Pending,
    ...event.body,
  });
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpCorsConfigured)
  .use(zodValidator(startTransactionLambdaSchema(config)))
  .use(httpErrorHandlerConfigured)
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
