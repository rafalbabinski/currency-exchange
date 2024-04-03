import { expect } from "chai";
import { DateTime } from "luxon";

import { server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { TransactionStatus } from "../../../shared/types/transaction.types";
import { createConfig } from "./../config";

const config = createConfig({
  ...process.env,
  API_GATEWAY_URL: 'http://localhost:1337/local'
});

describe("complete-transaction endpoint", () => {
  it("POST `local/transaction/id/payment` without id returns 404", () => {
    return server.post("local/transaction/payment")
      .set('x-api-key', config.apiKey)
      .expect(404)
  });

  it("POST `local/transaction/id/payment` without payload returns 400", () => {
    return server.post("local/transaction/id/payment")
      .set('x-api-key', config.apiKey)
      .expect(400)
  });


  it("POST `local/transaction/id/payment` with wrong payload returns 400 - empty object", () => {
    return server.post("local/transaction/id/payment")
      .set('x-api-key', config.apiKey)
      .send({})
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include('cardholderName is required');
        expect(errorMessages).to.include('cardNumber is required');
        expect(errorMessages).to.include('expirationMonth is required');
        expect(errorMessages).to.include('expirationYear is required');
        expect(errorMessages).to.include('ccv is required');
      });
  });

  it("POST `local/transaction/id/payment` with wrong payload returns 400 - empty keys values", () => {
    return server.post("local/transaction/id/payment")
      .set('x-api-key', config.apiKey)
      .send({
        cardholderName: '',
        cardNumber: '',
        expirationMonth: '',
        expirationYear: '',
        ccv: '',
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("cardholderName is not valid");
        expect(errorMessages).to.include("cardNumber is not valid");
        expect(errorMessages).to.include("expirationMonth is not valid");
        expect(errorMessages).to.include("expirationYear is not valid");
        expect(errorMessages).to.include("ccv is not valid");
      });
  });

  it("POST `local/transaction/id/payment` with wrong transaction id returns 404", () => {
    return server.post("local/transaction/id/payment")
      .set('x-api-key', config.apiKey)
      .send({
        cardholderName: "Adam Polak",
        cardNumber: "5310189818233681",
        expirationMonth: "3",
        expirationYear: "2024",
        ccv: "123"
      })
      .expect(404)
      .then(response => {
        const errorMessages: string = response.body.error

        expect(errorMessages).to.include("No transaction with given id");
      });
  });

    it("POST `local/transaction/id/payment` with wrong transaction status returns 409", async () => {
    const response = await server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
    
    const transactionId = response.body.transactionId
  
    
    await server.post(`local/transaction/${transactionId}/payment`)
      .set('x-api-key', config.apiKey)
      .send({
        cardholderName: "Adam Polak",
        cardNumber: "5310189818233681",
        expirationMonth: DateTime.now().month.toString(),
        expirationYear: DateTime.now().year.toString(),
        ccv: "123"
      })
      .expect(409)
      .then(response => {
        const errorMessages: string = response.body.error

        expect(errorMessages).to.include("Transaction status is not correct");
      });
  });

  it("POST `local/transaction/id/payment` with correct payload returns 200", async () => {
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
    
    await server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPayment);
      });
  
    
    await server.post(`local/transaction/${transactionId}/payment`)
      .set('x-api-key', config.apiKey)
      .send({
        cardholderName: "Adam Polak",
        cardNumber: "5310189818233681",
        expirationMonth: DateTime.now().month.toString(),
        expirationYear: DateTime.now().year.toString(),
        ccv: "123"
      })
      .expect(200)
    
    return server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPaymentStatus);
      });
  });

  it("POST `local/transaction/id/payment` with expired card returns 400", async () => {
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
    
    await server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPayment);
      });
  
    
    await server.post(`local/transaction/${transactionId}/payment`)
      .set('x-api-key', config.apiKey)
      .send({
        cardholderName: "Adam Polak",
        cardNumber: "5310189818233681",
        expirationMonth: "3",
        expirationYear: "2024",
        ccv: "123"
      })
      .expect(400)
      .then(response => {
        const errorMessages: string = response.body.error

        expect(errorMessages).to.include("Expired card");
      });
  });
})