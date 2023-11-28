import { MiddlewareObj } from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { awsLambdaResponse } from "../aws";

export const errorLambdaResponse: MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> = {
  onError: async (request) => {
    const { error } = request;

    if (error?.message) {
      return awsLambdaResponse(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }

    return awsLambdaResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Unknown error");
  },
};
