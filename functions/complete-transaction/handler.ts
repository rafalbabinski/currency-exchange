import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { SendTaskSuccessCommand, SendTaskSuccessInput } from "@aws-sdk/client-sfn";
import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import { isAxiosError } from "axios";

import { awsLambdaResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { CompleteTransactionLambdaPayload, completeTransactionLambdaSchema } from "./event.schema";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { errorLambdaResponse } from "../../shared/middleware/error-lambda-response";
import { createStepFunctionsClient } from "../../shared/step-functions/step-functions-client-factory";
import { DynamoDbTransactionClient } from "../check-transaction-status/dynamodb/dynamodb-client";
import { TransactionStatus } from "../../shared/types/transaction.types";
import { translate } from "../../shared/i18n/i18n-client-factory";
import { i18n } from "../../shared/middleware/i18n";
import { createConfig } from "./config";
import { createPaymentApiClient } from "./api/payment";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const paymentApiClient = createPaymentApiClient();

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

const stepFunctionsClient = createStepFunctionsClient();

const lambdaHandler = async (event: CompleteTransactionLambdaPayload) => {
  const { id } = event.pathParameters;
  const { cardNumber, cardholderName, ccv, expirationMonth, expirationYear } = event.body;

  const transaction = await dynamoDbClient.getTransaction(id);

  if (!transaction) {
    return awsLambdaResponse(StatusCodes.NOT_FOUND, {
      error: translate("ERROR.TRANSACTION.ID_NOT_MATCH"),
    });
  }

  if (transaction.transactionStatus !== TransactionStatus.WaitingForPayment) {
    return awsLambdaResponse(StatusCodes.CONFLICT, {
      error: translate("ERROR.TRANSACTION.STATUS_NOT_CORRECT"),
    });
  }

  const statusBaseUrl = isOffline ? "http://localhost:1337/local" : config.apiGatewayUrl;

  const securityPaymentKey = nanoid(100);

  try {
    await paymentApiClient.processPayment({
      number: cardNumber,
      owner: cardholderName,
      ccv,
      amount: transaction.currencyFromAmount,
      currency: transaction.currencyFrom,
      month: Number(expirationMonth),
      year: Number(expirationYear),
      transactionId: id,
      statusUrl: `${statusBaseUrl}/transaction/${id}/payment-notification?key=${securityPaymentKey}`,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      return awsLambdaResponse(StatusCodes.BAD_REQUEST, {
        error: error.response?.data,
      });
    }
  }

  const input: SendTaskSuccessInput = {
    taskToken: transaction.taskToken,
    output: JSON.stringify({
      transactionId: id,
      securityPaymentKey,
    }),
  };

  const command = new SendTaskSuccessCommand(input);

  stepFunctionsClient.send(command);

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
    before: (request) => zodValidator(completeTransactionLambdaSchema()).before(request),
  })
  .use(httpErrorHandlerConfigured)
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
