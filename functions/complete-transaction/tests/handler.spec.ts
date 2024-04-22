import { expect } from "chai";
import { DateTime } from "luxon";

import { generatePath, server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { TransactionStatus } from "../../../shared/types/transaction.types";
import { createConfig } from "./../config";

const config = createConfig({
  ...process.env,
  API_GATEWAY_URL: 'http://localhost:1337/local'
});

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

before(() => {
 return server.get(generatePath('rates-importer'))
  .set('x-api-key', config.apiKey)
  .expect(200);
});

describe("complete-transaction endpoint", () => {
  it("POST `transaction/id/payment` without id returns 404", () => {
    return server.post(generatePath('transaction/payment'))
      .set('x-api-key', config.apiKey)
      .expect(404)
  });

  it("POST `transaction/id/payment` without payload returns 400", () => {
    return server.post(generatePath('transaction/id/payment'))
      .set('x-api-key', config.apiKey)
      .expect(400)
  });


  it("POST `transaction/id/payment` with wrong payload returns 400 - empty object", () => {
    return server.post(generatePath('transaction/id/payment'))
      .set('x-api-key', config.apiKey)
      .send({})
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include('VALIDATION.REQUIRED');
        expect(errorMessages).to.have.length(5);
      });
  });

  it("POST `transaction/id/payment` with wrong payload returns 400 - empty keys values", () => {
    return server.post(generatePath('transaction/id/payment'))
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
        
        expect(errorMessages).to.include('VALIDATION.NOT_VALID');
        expect(errorMessages).to.have.length(5);
      });
  });

  it("POST `transaction/id/payment` with wrong transaction id returns 404", () => {
    return server.post(generatePath('transaction/id/payment'))
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

        expect(errorMessages).to.include('ERROR.TRANSACTION.ID_NOT_MATCH');
      });
  });

    it("POST `transaction/id/payment` with wrong transaction status returns 409", async () => {
    const response = await server.post(generatePath('transaction/start'))
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)

    await wait(1000)
    
    const transactionId = response.body.transactionId
    
    await server.post(generatePath(`transaction/${transactionId}/payment`))
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

        expect(errorMessages).to.include('ERROR.TRANSACTION.STATUS_NOT_CORRECT');
      });
  });

  it("POST `transaction/id/payment` with correct payload returns 200", async () => {
    const response = await server.post(generatePath('transaction/start'))
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
   
    await wait(1000)
      
    const transactionId = response.body.transactionId

    await server.get(generatePath(`transaction/${transactionId}/status`))
    .set('x-api-key', config.apiKey)
    .expect(200)
    .then(response => {
      expect(response.body.transactionStatus).to.eql(TransactionStatus.Started);
    });

    await wait(1000)
    
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
    
    await wait(1000)
    
    await server.get(generatePath(`transaction/${transactionId}/status`))
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPayment);
      });
    
    await wait(1000)
    
    await server.post(generatePath(`transaction/${transactionId}/payment`))
      .set('x-api-key', config.apiKey)
      .send({
        cardholderName: "Adam Polak",
        cardNumber: "5310189818233681",
        expirationMonth: DateTime.now().month.toString(),
        expirationYear: DateTime.now().year.toString(),
        ccv: "123"
      })
      .expect(200)
    
    await wait(1000)
    
    return server.get(generatePath(`transaction/${transactionId}/status`))
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPaymentStatus);
      });
  });

  it("POST `transaction/id/payment` with expired card returns 400", async () => {
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
    
    await server.get(generatePath(`transaction/${transactionId}/status`))
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPayment);
      });
  
    
    await server.post(generatePath(`transaction/${transactionId}/payment`))
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