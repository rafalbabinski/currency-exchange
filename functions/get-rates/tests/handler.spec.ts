import { expect } from "chai";

import { generatePath, server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("get-rates endpoint", () => {
  it("GET `exchange-rates?currencyFrom=PLN` with correct query param returns 200", async () => {
    await server.get(generatePath('rates-importer'))
      .set('x-api-key', config.apiKey)
      .expect(200);

    return server.get(generatePath('exchange-rates?currencyFrom=PLN'))
      .set('x-api-key', config.apiKey)
      .expect(200);
  });

  it("GET `exchange-rates` without query param returns 400", () => {
    return server.get(generatePath('exchange-rates'))
      .set('x-api-key', config.apiKey)
      .expect(400)
      .then(response => {
        expect(JSON.parse(response.body).description[0].message).to.include('VALIDATION.REQUIRED');
      });
  });

  it("GET `exchange-rates?currencyFrom=ABCD` with wrong query param returns 400", () => {
    return server.get(generatePath('exchange-rates?currencyFrom=ABCD'))
      .set('x-api-key', config.apiKey)
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)

        expect(errorMessages).to.include('VALIDATION.CURRENCY_CODE.SYNTAX');
        expect(errorMessages).to.include('VALIDATION.CURRENCY_CODE.SCOPE');
      });
  });
});
