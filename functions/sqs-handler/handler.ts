import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";
import { awsLambdaResponse } from "../../shared/aws";
import { winstonLogger } from "../../shared/logger";
import { createConfig } from "./config";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { sqsHandlerLambdaSchema } from "./event.schema";
import { zodValidator } from "../../shared/middleware/zod-validator";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpCorsConfigured } from "../../shared/middleware/http-cors-configured";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { SQSExtensionConfiguration } from "@aws-sdk/client-sqs";
import { createStepFunctionsClient } from "../../shared/step-functions/step-functions-client-factory";
import { StartExecutionCommand, StartExecutionCommandInput } from "@aws-sdk/client-sfn";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const stepFunctionsClient = createStepFunctionsClient();

const lambdaHandler = async (event: SQSExtensionConfiguration) => {
  winstonLogger.info("Pre connection");
  winstonLogger.info(`Config: ${JSON.stringify(config)}`);

  const input: StartExecutionCommandInput = {
    stateMachineArn: isOffline ? config.stateMachineArnOffline : config.stateMachineArn,
    input: event.Records?.[0].messageAttributes.Input.stringValue,
  };

  const command = new StartExecutionCommand(input);

  await stepFunctionsClient.send(command);

  return awsLambdaResponse(StatusCodes.OK, {
    success: true,
  });
};

export const handle = middy()
  .use(jsonBodyParser())
  .use(inputOutputLoggerConfigured())
  // .use(httpEventNormalizer())
  // .use(httpHeaderNormalizer())
  // .use(httpCorsConfigured)
  .use(queryParser())
  // .use(zodValidator(sqsHandlerLambdaSchema))
  .use(httpErrorHandlerConfigured)
  .handler(lambdaHandler);
