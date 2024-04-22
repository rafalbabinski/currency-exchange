import { expect } from "chai";

import { generatePath, server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { createConfig } from "./../config";
import { TransactionStatus } from "../../../shared/types/transaction.types";

const config = createConfig(process.env);

describe("save-user-data endpoint", () => {
  it("POST `transaction/id/save-user-data` without id returns 404", () => {
    return server.post(generatePath("transaction/save-user-data"))
      .set('x-api-key', config.apiKey)
      .expect(404)
  });

  it("POST `transaction/id/save-user-data` without payload returns 400", () => {
    return server.post(generatePath("transaction/id/save-user-data"))
      .set('x-api-key', config.apiKey)
      .expect(400)
  });


  it("POST `transaction/id/save-user-data` with wrong payload returns 400 - empty object", () => {
    return server.post(generatePath("transaction/id/save-user-data"))
      .set('x-api-key', config.apiKey)
      .send({})
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("VALIDATION.REQUIRED");
        expect(errorMessages).to.have.length(6);
      });
  });

  it("POST `transaction/id/save-user-data` with wrong payload returns 400 - empty keys values", () => {
    return server.post(generatePath("transaction/id/save-user-data"))
      .set('x-api-key', config.apiKey)
      .send({
        firstName: '',
        lastName: '',
        city: '',
        street: '',
        zipCode: '',
        email: '',
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("VALIDATION.EMPTY");
        expect(errorMessages).to.include("VALIDATION.ZIP_CODE");
        expect(errorMessages).to.include("VALIDATION.EMAIL");
        expect(errorMessages).to.have.length(6);
      });
  });

  it("POST `transaction/id/save-user-data` with wrong id returns 404", () => {
    return server.post(generatePath("transaction/id/save-user-data"))
      .set('x-api-key', config.apiKey)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        street: 'Wall Street',
        zipCode: '12345',
        email: 'jdoe@gmail.com',
      })
      .expect(404)
      .then(response => {
        const errorMessages: string = response.body.error

        expect(errorMessages).to.include("ERROR.TRANSACTION.ID_NOT_MATCH");
      });
  });

  it("POST `transaction/id/save-user-data` with correct payload returns 200", async () => {
    const response = await server.post(generatePath("transaction/start"))
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
    
    const transactionId = response.body.transactionId
    
    await server.post(generatePath(`transaction/${transactionId}/save-user-data`))
      .set('x-api-key', config.apiKey)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        street: 'Wall Street',
        zipCode: '12345',
        email: 'jdoe@gmail.com',
      })
      .expect(200)
    
    return server.get(generatePath(`transaction/${transactionId}/status`))
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPayment);
      });
  });
})