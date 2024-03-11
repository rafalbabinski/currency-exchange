import request from "supertest";
import { expect } from "chai";

import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("get-rates endpoint", () => {
  const server = request("http://localhost:1337/");

  describe("Test obligatory query parameter", () => {
    it("GET `local/exchange-rates?currencyFrom=PLN` returns 200", () => {
      return server.get("local/exchange-rates?currencyFrom=PLN")
        .set('x-api-key', config.apiKey)
        .expect(200);
    });

    it("GET `local/exchange-rates` returns 400", () => {
      return server.get("local/exchange-rates")
        .set('x-api-key', config.apiKey)
        .expect(400)
        .then(response => {
          expect(JSON.parse(response.body).description[0].message).to.include('currencyFrom is required');
        });
    });

    it("GET `local/exchange-rates?currencyFrom=ABCD` returns 400", () => {
      return server.get("local/exchange-rates?currencyFrom=ABCD")
        .set('x-api-key', config.apiKey)
        .expect(400)
        .then(response => {
          expect(JSON.parse(response.body).description[0].message).to.include('currencyFrom must be valid 3-letter currency code');
          expect(JSON.parse(response.body).description[1].message).to.include('currencyFrom is not in the exchange scope');
        });
    });
  });
});
