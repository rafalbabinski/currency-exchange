import request from "supertest";

import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("get-rates endpoint", () => {
  const server = request("http://localhost:1337/");

  describe("Test obligatory query parameter", () => {
    it("GET `local/exchange-rates?baseCurrency=PLN` returns 200", () => {
      return server.get("local/exchange-rates?baseCurrency=PLN").set('x-api-key', config.apiKey).expect(200);
    });

    it("GET `local/exchange-rates` returns 400", () => {
      return server.get("local/exchange-rates").set('x-api-key', config.apiKey).expect(400);
    });
  });
});
