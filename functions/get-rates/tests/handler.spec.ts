import request from "supertest";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("get-rates endpoint", () => {
  const server = request("http://localhost:1337/");

  describe("Test obligatory query parameter", () => {
    it("GET `local/exchange-rates?startCurrency=PLN&endCurrency=EUR` returns 200", () => {
      return server.get("local/exchange-rates?startCurrency=PLN&endCurrency=EUR").set('x-api-key', config.apiKey).expect(200);
    });

    it("GET `local/exchange-rates` returns 400", () => {
      return server.get("local/exchange-rates").set('x-api-key', config.apiKey).expect(400);
    });

    it("GET `local/exchange-rates?startCurrency=PLN`returns 400", () => {
      return server.get("local/exchange-rates?startCurrency=PLN").set('x-api-key', config.apiKey).expect(400);
    });

    it("GET `local/exchange-rates?endCurrency=PLN` returns 400", () => {
      return server.get("local/exchange-rates?endCurrency=PLN").set('x-api-key', config.apiKey).expect(400);
    });
  });
});
