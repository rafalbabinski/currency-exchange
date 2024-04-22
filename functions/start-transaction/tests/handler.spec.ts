import { expect } from "chai";

import { generatePath, server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { TransactionStatus } from "../../../shared/types/transaction.types";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("start-transaction endpoint", () => {
  it("POST `transaction/start` without payload returns 400", () => {
    return server.post(generatePath("transaction/start"))
      .set('x-api-key', config.apiKey)
      .expect(400);
  });

  it("POST `transaction/start` with wrong payload returns 400 - empty object", () => {
    return server.post(generatePath("transaction/start"))
      .set('x-api-key', config.apiKey)
      .send({})
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("VALIDATION.REQUIRED");
        expect(errorMessages).to.have.length(3);
      });
  });

  it("POST `transaction/start` with wrong payload returns 400 - wrong currencyFrom code", () => {
    return server.post(generatePath("transaction/start"))
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "PLNX",
        currencyTo: "EUR",
        currencyFromAmount: 100,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("VALIDATION.CURRENCY_CODE.SYNTAX");
      });
  });

  it("POST `transaction/start` with wrong payload returns 400 - wrong currencyTo code", () => {
    return server.post(generatePath("transaction/start"))
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "PLN",
        currencyTo: "EURX",
        currencyFromAmount: 100,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("VALIDATION.CURRENCY_CODE.SYNTAX");
      });
  });

  it("POST `transaction/start` with wrong payload returns 400 - currencyFrom not in scope", () => {
    return server.post(generatePath("transaction/start"))
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "GBP",
        currencyTo: "EUR",
        currencyFromAmount: 100,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("VALIDATION.CURRENCY_CODE.SCOPE");
      });
  });

  it("POST `transaction/start` with wrong payload returns 400 - currencyTo not in scope", () => {
    return server.post(generatePath("transaction/start"))
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "PLN",
        currencyTo: "GBP",
        currencyFromAmount: 100,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("VALIDATION.CURRENCY_CODE.SCOPE");
      });
  });

  it("POST `transaction/start` with correct payload returns 200", async () => {
    const response = await server.post(generatePath("transaction/start"))
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
    
    const transactionId = response.body.transactionId

    return server.get(generatePath(`transaction/${transactionId}/status`))
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.Started);
      });
  });
});