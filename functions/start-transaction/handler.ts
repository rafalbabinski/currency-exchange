import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { nanoid } from "nanoid";
import { StatusCodes } from "http-status-codes";
import { GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";

import { awsLambdaResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { errorLambdaResponse } from "../../shared/middleware/error-lambda-response";
import { TransactionStatus } from "../../shared/types/transaction.types";
import { AppError } from "../../shared/errors/app.error";
import { translate } from "../../shared/i18n/i18n-client-factory";
import { i18n } from "../../shared/middleware/i18n";
import { DynamoDbCurrencyClient } from "../get-rates/dynamodb/dynamodb-client";
import { StartTransactionLambdaPayload, startTransactionLambdaSchema } from "./event.schema";
import { createConfig } from "./config";
import { createSqsClient } from "../../shared/sqs/sqs-client-factory";

const config = createConfig(process.env);

const dynamoDbCurrencyClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable);

const sqsClient = createSqsClient();

const lambdaHandler = async (event: StartTransactionLambdaPayload) => {
  const response = await dynamoDbCurrencyClient.getCurrencyRates(config.baseImporterCurrency);

  if (!response) {
    throw new AppError(translate("ERROR.RATES.NOT_AVAILABLE"));
  }

  const transactionId = nanoid();

  const sqsGetQueueCommand = new GetQueueUrlCommand({ QueueName: config.queueName });

  const { QueueUrl } = await sqsClient.send(sqsGetQueueCommand);

  const sqsSendQueueMessageCommand = new SendMessageCommand({
    QueueUrl,
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

  await sqsClient.send(sqsSendQueueMessageCommand);

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
  .use(i18n)
  .use({
    before: (request) => zodValidator(startTransactionLambdaSchema(config)).before(request),
  })
  .use(httpErrorHandlerConfigured)
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
