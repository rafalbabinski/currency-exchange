import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { StatusCodes } from "http-status-codes";

import { awsLambdaResponse } from "../../shared/aws";
import { createConfig } from "./config";
import { inputOutputLoggerConfigured } from "../../shared/middleware/input-output-logger-configured";
import { queryParser } from "../../shared/middleware/query-parser";
import { httpErrorHandlerConfigured } from "../../shared/middleware/http-error-handler-configured";
import { SQSExtensionConfiguration } from "@aws-sdk/client-sqs";
import { createStepFunctionsClient } from "../../shared/step-functions/step-functions-client-factory";
import { StartExecutionCommand, StartExecutionCommandInput } from "@aws-sdk/client-sfn";

const isOffline = process.env.IS_OFFLINE === "true";

const config = createConfig(process.env);

const stepFunctionsClient = createStepFunctionsClient();

const lambdaHandler = async (event: SQSExtensionConfiguration) => {
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
  .use(queryParser())
  .use(httpErrorHandlerConfigured)
  .handler(lambdaHandler);
