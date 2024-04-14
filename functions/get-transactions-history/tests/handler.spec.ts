import { expect } from "chai";

import { server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("get-transactions-history endpoint", () => {
  it("GET `local/transactions-history returns 200", async () => {
    return server.get("local/transactions-history")
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.results).to.have.length.greaterThan(0);
      });
  });
});
