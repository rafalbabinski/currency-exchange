import { MiddlewareObj } from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createErrorResponse } from "../aws";

export const errorLambdaResponse: MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> = {
  onError: async (request) => {
    const { error } = request;

    return createErrorResponse(error);
  },
};
