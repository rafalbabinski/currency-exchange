import { expect } from "chai";

import { server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { createConfig } from "./../config";
import { TransactionStatus } from "../../../shared/types/transaction.types";

const config = createConfig(process.env);

describe("save-user-data endpoint", () => {
  it("POST `local/transaction/id/save-user-data` without id returns 404", () => {
    return server.post("local/transaction/save-user-data")
      .set('x-api-key', config.apiKey)
      .expect(404)
  });

  it("POST `local/transaction/id/save-user-data` without payload returns 400", () => {
    return server.post("local/transaction/id/save-user-data")
      .set('x-api-key', config.apiKey)
      .expect(400)
  });


  it("POST `local/transaction/id/save-user-data` with wrong payload returns 400 - empty object", () => {
    return server.post("local/transaction/id/save-user-data")
      .set('x-api-key', config.apiKey)
      .send({})
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include('firstName is required');
        expect(errorMessages).to.include('lastName is required');
        expect(errorMessages).to.include('city is required');
        expect(errorMessages).to.include('street is required');
        expect(errorMessages).to.include('zipCode is required');
        expect(errorMessages).to.include('email is required');
      });
  });

  it("POST `local/transaction/id/save-user-data` with wrong payload returns 400 - empty keys values", () => {
    return server.post("local/transaction/id/save-user-data")
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
        
        expect(errorMessages).to.include("firstName can't be empty");
        expect(errorMessages).to.include("lastName can't be empty");
        expect(errorMessages).to.include("city can't be empty");
        expect(errorMessages).to.include("street can't be empty");
        expect(errorMessages).to.include("zipCode must be in one of the following formats: XX-XXX, XXXXX, XX XXX");
        expect(errorMessages).to.include("email must be a valid email");
      });
  });

  it("POST `local/transaction/id/save-user-data` with wrong id returns 404", () => {
    return server.post("local/transaction/id/save-user-data")
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

        expect(errorMessages).to.include("No transaction with given id");
      });
  });

  it("POST `local/transaction/id/save-user-data` with correct payload returns 200", async () => {
    const response = await server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
    
    const transactionId = response.body.transactionId
    
    await server.post(`local/transaction/${transactionId}/save-user-data`)
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
    
    return server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPayment);
      });
  });
})