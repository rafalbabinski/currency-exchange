import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";

import { awsLambdaResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { CompleteTransactionLambdaPayload, completeTransactionLambdaSchema } from "./event.schema";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { createStepFunctionsClient } from "../../shared/step-functions/step-functions-client-factory";
import { DynamoDbTransactionClient } from "../check-transaction-status/dynamodb/dynamodb-client";
import { SendTaskSuccessCommand, SendTaskSuccessInput } from "@aws-sdk/client-sfn";
import { TransactionStatus } from "../../shared/types/transaction.types";
import { createConfig } from "./config";
import { createPaymentApiClient } from "./api/payment";

const config = createConfig(process.env);

const paymentApiClient = createPaymentApiClient();

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

const lambdaHandler = async (event: CompleteTransactionLambdaPayload) => {
  const { id } = event.pathParameters;
  const { cardNumber, cardholderName, ccv, expirationMonth, expirationYear } = event.body;

  const transaction = await dynamoDbClient.getTransaction(id);

  if (!transaction) {
    return awsLambdaResponse(StatusCodes.NOT_FOUND, {
      error: "No transaction with given id",
    });
  }

  if (transaction.transactionStatus !== TransactionStatus.WaitingForPayment) {
    return awsLambdaResponse(StatusCodes.BAD_REQUEST, {
      error: "Transaction status is not correct",
    });
  }

  await paymentApiClient.processPayment({
    number: cardNumber,
    owner: cardholderName,
    ccv,
    amount: transaction.currencyFromAmount,
    currency: transaction.currencyFrom,
    month: Number(expirationMonth),
    year: Number(expirationYear),
    transactionId: id,
    statusUrl: "http://localhost:3000/test",
  });

  const client = createStepFunctionsClient();

  const input: SendTaskSuccessInput = {
    taskToken: transaction.taskToken,
    output: JSON.stringify({
      transactionId: id,
    }),
  };

  const command = new SendTaskSuccessCommand(input);

  client.send(command);

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
  .use(zodValidator(completeTransactionLambdaSchema))
  .use(httpErrorHandlerConfigured)
  .handler(lambdaHandler);
