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
import { DynamoDbCurrencyClient } from "../get-rates/dynamodb/dynamodb-client";
import { StartTransactionLambdaPayload, startTransactionLambdaSchema } from "./event.schema";
import { createConfig } from "./config";
import { createSqsClient } from "../../shared/sqs/sqs-client-factory";
import {
  CreateQueueCommand,
  GetQueueUrlCommand,
  ListQueuesCommand,
  ListQueuesCommandInput,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const dynamoDbCurrencyClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable);

const stepFunctionsClient = createStepFunctionsClient();

const sqsClient = createSqsClient();

const lambdaHandler = async (event: StartTransactionLambdaPayload) => {
  const response = await dynamoDbCurrencyClient.getCurrencyRates(config.baseImporterCurrency);

  if (!response) {
    throw new AppError("No currency rates available");
  }

  const transactionId = nanoid();

  // const command = new CreateQueueCommand({
  //   QueueName: "myqueue",
  //   Attributes: {
  //     DelaySeconds: "60",
  //     MessageRetentionPeriod: "86400",
  //   },
  // });

  // await sqsClient.send(command);

  const command1 = new GetQueueUrlCommand({ QueueName: "myqueue" });

  const response2 = await sqsClient.send(command1);

  console.log("-------------");
  console.log(response2);

  const command2 = new SendMessageCommand({
    QueueUrl: "http://localhost:9324/000000000000/myqueue",
    DelaySeconds: 10,
    MessageAttributes: {
      Input: {
        DataType: "String",
        StringValue: JSON.stringify({
          transactionId,
          body: event.body,
        }),
      },
    },
    MessageBody: "Information about the transaction.",
  });

  const response3 = await sqsClient.send(command2);

  // const input: StartExecutionCommandInput = {
  //   stateMachineArn: isOffline ? config.stateMachineArnOffline : config.stateMachineArn,
  //   input: JSON.stringify({
  //     transactionId,
  //     body: event.body,
  //   }),
  // };

  // const command = new StartExecutionCommand(input);

  // await stepFunctionsClient.send(command);

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
