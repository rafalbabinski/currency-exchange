import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { awsLambdaResponse } from "../../shared/aws";
import { errorLambdaResponse } from "../../shared/middleware/error-lambda-response";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { winstonLogger } from "../../shared/logger";
import { createConfig } from "./config";
import { createCurrencyApiClient } from "./api/currency";
import { DynamoDbCurrencyClient } from "./dynamodb/dynamodb-client";
import { toCurrencyRatesDto } from "./helpers/to-currency-rates-dto";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const currencyApiClient = createCurrencyApiClient();

const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
  const dynamoDbClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable, isOffline);

  const rates = await currencyApiClient.getRates();

  const mappedRates = toCurrencyRatesDto(rates);

  winstonLogger.info("Currency rates:", rates);

  await dynamoDbClient.saveCurrencyRates(mappedRates);

  return awsLambdaResponse(StatusCodes.OK, {
    success: true,
    results: mappedRates,
  });
};

export const handle = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpCorsConfigured)
  .use(httpErrorHandlerConfigured)
  .use(errorLambdaResponse)
  .handler(lambdaHandler);
