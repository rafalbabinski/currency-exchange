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
import { DynamoDbTransactionClient } from "./dynamodb/dynamodb-client";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { errorLambdaResponse } from "../../shared/middleware/error-lambda-response";
import { TransactionStatus } from "../../shared/types/transaction.types";
import { checkTransactionExpired } from "../../shared/utils/check-transaction-expired";
import { TransactionData } from "../../workflows/transaction-workflow/start-transaction-step/helpers/to-transaction-dto";
import { createConfig } from "./config";
import { CheckTransactionStatusLambdaPayload, checkTransactionStatusLambdaSchema } from "./event.schema";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient(config.dynamoDBCurrencyTable);

const lambdaHandler = async (event: CheckTransactionStatusLambdaPayload) => {
  const { id } = event.pathParameters;

  const response = await dynamoDbClient.getTransaction(id);

  if (!response) {
    return awsLambdaResponse(StatusCodes.NOT_FOUND, {
      error: "No transaction with given id",
    });
  }

  const transactionDetails: Partial<TransactionData> = {
    currencyFrom: response.currencyFrom,
    currencyFromAmount: response.currencyFromAmount,
    currencyTo: response.currencyTo,
    currencyToAmount: response.currencyToAmount,
    exchangeRate: response.exchangeRate,
  };

  if (response.transactionStatus !== "started") {
    return awsLambdaResponse(StatusCodes.OK, {
      success: true,
      transactionStatus: response.transactionStatus,
      transactionDetails,
    });
  }

  const createdAt = response.sk.replace("transaction#", "");

  const hasTransactionExpired = checkTransactionExpired({
    createdAt,
    timeToCompleteTransaction: Number(config.timeToCompleteTransaction),
  });

  if (hasTransactionExpired) {
    const transactionStatus = TransactionStatus.Expired;
    const updatedAt = new Date().toISOString();

    await dynamoDbClient.updateTransactionStatus(response.pk, response.sk, { transactionStatus, updatedAt });

    return awsLambdaResponse(StatusCodes.OK, { success: true, transactionStatus, transactionDetails });
  }

  return awsLambdaResponse(StatusCodes.OK, {
    success: true,
    transactionStatus: response.transactionStatus,
    transactionDetails,
  });
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
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
