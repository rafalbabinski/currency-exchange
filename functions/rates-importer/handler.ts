import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";
import { awsLambdaResponse } from "../../shared/aws";
import { winstonLogger } from "../../shared/logger";
import { createConfig } from "./config";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { createCurrencyApiClient } from "./api/currency";
import { DynamoDbCurrencyClient } from "./dynamodb/dynamodb-client";
import { toCurrencyRatesDto } from "./helpers/to-currency-rates-dto";

const config = createConfig(process.env);

const lambdaHandler = async () => {
  winstonLogger.info("Pre connection");
  winstonLogger.info(`Config: ${JSON.stringify(config)}`);

  winstonLogger.info("Post connection");

  const currencyApiClient = createCurrencyApiClient();
  const dynamoDbClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable);

  try {
    const rates = await currencyApiClient.getRates();

    const mappedRates = toCurrencyRatesDto(rates);

    winstonLogger.info(JSON.stringify(rates));

    await dynamoDbClient.saveCurrencyRates(mappedRates);

    return awsLambdaResponse(StatusCodes.OK, {
      success: true,
      results: JSON.stringify(rates),
    });
  } catch (error) {
    return awsLambdaResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
      success: false,
    });
  }
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpCorsConfigured)
  .use(queryParser())
  .use(httpErrorHandlerConfigured)
  .handler(lambdaHandler);
