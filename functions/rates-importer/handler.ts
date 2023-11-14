import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { awsLambdaResponse, createErrorResponse } from "../../shared/aws";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { HttpError } from "../../shared/errors/http.error";
import { winstonLogger } from "../../shared/logger";
import { createConfig } from "./config";
import { createCurrencyApiClient } from "./api/currency";
import { DynamoDbCurrencyClient } from "./dynamodb/dynamodb-client";
import { toCurrencyRatesDto } from "./helpers/to-currency-rates-dto";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const currencyApiClient = createCurrencyApiClient();

const lambdaHandler = async () => {
  const dynamoDbClient = new DynamoDbCurrencyClient(config.dynamoDBCurrencyTable, isOffline);

  try {
    const rates = await currencyApiClient.getRates();

    const mappedRates = toCurrencyRatesDto(rates);

    winstonLogger.info("Currency rates:", rates);

    try {
      await dynamoDbClient.saveCurrencyRates(mappedRates);
    } catch (error) {
      if (error instanceof Error) {
        return createErrorResponse(new HttpError(`Failed to save currency rates: ${error.message}`, 500));
      }
    }

    await dynamoDbClient.saveCurrencyRates(mappedRates);

    return awsLambdaResponse(StatusCodes.OK, {
      success: true,
      results: mappedRates,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return createErrorResponse(new HttpError(`Failed to fetch currency rates: ${error.message}`, 500));
    }

    return createErrorResponse(error);
  }
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  .use(httpCorsConfigured)
  .use(httpErrorHandlerConfigured)
  .handler(lambdaHandler);
