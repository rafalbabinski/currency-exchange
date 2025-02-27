import { expect } from "chai";

import { server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { TransactionStatus } from "../../../shared/types/transaction.types";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("start-transaction endpoint", () => {
  it("POST `local/transaction/start` without payload returns 400", () => {
    return server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .expect(400);
  });

  it("POST `local/transaction/start` with wrong payload returns 400 - empty object", () => {
    return server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({})
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include('currencyFrom is required');
        expect(errorMessages).to.include('currencyTo is required');
        expect(errorMessages).to.include('currencyFromAmount is required');

      });
  });

  it("POST `local/transaction/start` with wrong payload returns 400 - wrong currencyFrom code", () => {
    return server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "PLNX",
        currencyTo: "EUR",
        currencyFromAmount: 100,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include('currencyFrom must be valid 3-letter currency code (e.g., PLN, EUR, USD)');
      });
  });

  it("POST `local/transaction/start` with wrong payload returns 400 - wrong currencyTo code", () => {
    return server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "PLN",
        currencyTo: "EURX",
        currencyFromAmount: 100,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include('currencyTo must be valid 3-letter currency code (e.g., PLN, EUR, USD)');
      });
  });

  it("POST `local/transaction/start` with wrong payload returns 400 - currencyFrom not in scope", () => {
    return server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "GBP",
        currencyTo: "EUR",
        currencyFromAmount: 100,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include(`currencyFrom is not in the exchange scope, available currencies: ${config.currencyScope}`);
      });
  });

  it("POST `local/transaction/start` with wrong payload returns 400 - currencyTo not in scope", () => {
    return server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "PLN",
        currencyTo: "GBP",
        currencyFromAmount: 100,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include(`currencyTo is not in the exchange scope, available currencies: ${config.currencyScope}`);
      });
  });

  it("POST `local/transaction/start` with correct payload returns 200", async () => {
    const response = await server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
    
    const transactionId = response.body.transactionId

    return server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.Started);
      });
  });
});