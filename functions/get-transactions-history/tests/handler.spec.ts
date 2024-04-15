import { expect } from "chai";

import { server } from "../../../shared/tests";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("get-transactions-history endpoint", () => {
  it("GET `local/transactions-history` with wrong query param returns 400", () => {
    return server.get("local/transactions-history?limit=0")
      .set('x-api-key', config.apiKey)
      .expect(400)
      .then(response => {
        expect(JSON.parse(response.body).description[0].message).to.include('Minimum limit is 1');
      });
  });

  it("GET `local/transactions-history` with wrong query param returns 400", () => {
    return server.get("local/transactions-history?limit=101")
      .set('x-api-key', config.apiKey)
      .expect(400)
      .then(response => {
        expect(JSON.parse(response.body).description[0].message).to.include('Maximum limit is 100');
      });
  });

  it("GET `local/transactions-history` returns 200", async () => {
    return server.get("local/transactions-history")
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.results).to.have.length.greaterThan(0);
      });
  });
});
