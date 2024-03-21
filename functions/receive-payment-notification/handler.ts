import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";

import { awsLambdaResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { DynamoDbTransactionClient } from "../check-transaction-status/dynamodb/dynamodb-client";
import { TransactionStatus } from "../../shared/types/transaction.types";
import { ReceivePaymentNotificationLambdaPayload, receivePaymentNotificationLambdaSchema } from "./event.schema";
import { createConfig } from "./config";
import { PaymentStatus } from "./types";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

const lambdaHandler = async (event: ReceivePaymentNotificationLambdaPayload) => {
  const { id } = event.pathParameters;
  const { key } = event.queryStringParameters;
  const { status } = event.body;

  const response = await dynamoDbClient.getTransaction(id);

  if (!response) {
    return awsLambdaResponse(StatusCodes.NOT_FOUND, {
      error: "No transaction with given id",
    });
  }

  const { createdAt, transactionStatus, securityPaymentKey } = response;

  if (transactionStatus !== TransactionStatus.WaitingForPaymentStatus) {
    return awsLambdaResponse(StatusCodes.BAD_REQUEST, {
      error: "Transaction status is not correct",
    });
  }

  if (key !== securityPaymentKey) {
    return awsLambdaResponse(StatusCodes.FORBIDDEN, {
      error: "Transaction key is not correct",
    });
  }

  const updatedAt = new Date().toISOString();

  if (status === PaymentStatus.Success) {
    const newTransactionStatus = TransactionStatus.PaymentSuccess;

    await dynamoDbClient.updateTransactionStatus({ id, createdAt, updatedAt, transactionStatus: newTransactionStatus });

    return awsLambdaResponse(StatusCodes.OK, {
      success: true,
      transactionStatus: newTransactionStatus,
    });
  }

  if (status === PaymentStatus.Failure) {
    const newTransactionStatus = TransactionStatus.PaymentFailure;

    await dynamoDbClient.updateTransactionStatus({ id, createdAt, updatedAt, transactionStatus: newTransactionStatus });

    return awsLambdaResponse(StatusCodes.OK, {
      success: true,
      transactionStatus: newTransactionStatus,
    });
  }

  return awsLambdaResponse(StatusCodes.OK, {
    success: false,
  });
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpCorsConfigured)
  .use(queryParser())
  .use(zodValidator(receivePaymentNotificationLambdaSchema))
  .use(httpErrorHandlerConfigured)
  .handler(lambdaHandler);
