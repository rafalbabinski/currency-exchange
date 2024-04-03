import { expect } from "chai";

import { server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("get-rates endpoint", () => {
  it("GET `local/exchange-rates?currencyFrom=PLN` with correct query params returns 200", async () => {
    await server.get("local/rates-importer")
      .set('x-api-key', config.apiKey)
      .expect(200);

    return server.get("local/exchange-rates?currencyFrom=PLN")
      .set('x-api-key', config.apiKey)
      .expect(200);
  });

  it("GET `local/exchange-rates` without query params returns 400", () => {
    return server.get("local/exchange-rates")
      .set('x-api-key', config.apiKey)
      .expect(400)
      .then(response => {
        expect(JSON.parse(response.body).description[0].message).to.include('currencyFrom is required');
      });
  });

  it("GET `local/exchange-rates?currencyFrom=ABCD` with wrong query params returns 400", () => {
    return server.get("local/exchange-rates?currencyFrom=ABCD")
      .set('x-api-key', config.apiKey)
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)

        expect(errorMessages).to.include('currencyFrom must be valid 3-letter currency code');
        expect(errorMessages).to.include('currencyFrom is not in the exchange scope');
      });
  });
});
