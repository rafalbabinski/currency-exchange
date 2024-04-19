import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { MiddlewareObj } from "@middy/core";

import { i18nClient, i18next } from "../i18n/i18n-client-factory";

export const i18n: MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> = {
  before: async ({ event }) => {
    const queryParams = event.queryStringParameters || {};

    if (queryParams.lang) {
      await i18nClient();

      await i18next.changeLanguage(queryParams.lang);
    }
  },
};
