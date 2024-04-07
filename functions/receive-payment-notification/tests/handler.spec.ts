import { expect } from "chai";

import { server } from "../../../shared/tests";
import { getResponseErrorMessages } from "../../../shared/utils/get-response-error-messages";
import { TransactionStatus } from "../../../shared/types/transaction.types";
import { createConfig } from "./../config";
import { DateTime } from "luxon";
import { PaymentStatus } from "../types";
import { DynamoDbTransactionClient } from "../../check-transaction-status/dynamodb/dynamodb-client";
import { TransactionData } from "../../../workflows/transaction-workflow/start-transaction-step/helpers/to-transaction-dto";

const config = createConfig(process.env);

const dynamoDbClient = new DynamoDbTransactionClient('rb-bootcamp-sls-currency-table-local');


describe("receive-payment-notification endpoint", () => {
  it("POST `local/transaction/id/payment-notification` without id returns 404", () => {
    return server.post("local/transaction/payment-notification")
      .set('x-api-key', config.apiKey)
      .expect(404)
  });

  it("POST `local/transaction/id/payment-notification` without payload returns 400", () => {
    return server.post("local/transaction/id/payment-notification")
      .set('x-api-key', config.apiKey)
      .expect(400)
  });


  it("POST `local/transaction/id/payment-notification` with wrong payload returns 400 - empty object", () => {
    return server.post("local/transaction/id/payment-notification")
      .set('x-api-key', config.apiKey)
      .send({})
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include('status is required');
      });
  });

  it("POST `local/transaction/id/payment-notification` with wrong payload returns 400 - empty keys values", () => {
    return server.post("local/transaction/id/payment-notification")
      .set('x-api-key', config.apiKey)
      .send({
        status: '',
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include("status can't be empty");
      });
  });

  it("POST `local/transaction/id/payment-notification` without key param returns 400", () => {
    return server.post("local/transaction/id/payment-notification")
      .set('x-api-key', config.apiKey)
      .send({
        status: PaymentStatus.Success,
      })
      .expect(400)
      .then(response => {
        const errorMessages = getResponseErrorMessages(response)
        
        expect(errorMessages).to.include('key is required');
      });
  });

  it("POST `local/transaction/id/payment-notification` with wrong id returns 404", () => {
    return server.post("local/transaction/id/payment-notification?key=123")
      .set('x-api-key', config.apiKey)
      .send({
        status: PaymentStatus.Success,
      })
      .expect(404)
      .then(response => {
        const errorMessages: string = response.body.error

        expect(errorMessages).to.include("No transaction with given id");
      });
  });

  it("POST `local/transaction/id/payment-notification` with wrong transaction status returns 409", async () => {
    const response = await server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
    
    const transactionId = response.body.transactionId
    
    return server.post(`local/transaction/${transactionId}/payment-notification?key=123`)
      .set('x-api-key', config.apiKey)
      .send({
        status: PaymentStatus.Success,
      })
      .expect(409)
      .then(response => {
        const errorMessages: string = response.body.error

        expect(errorMessages).to.include("Transaction status is not correct");
      });
  });

  it("POST `local/transaction/id/payment-notification` with wrong security payment key returns 403", async () => {
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
    
    return server.post(`local/transaction/${transactionId}/payment-notification?key=123`)
      .set('x-api-key', config.apiKey)
      .send({
        status: PaymentStatus.Success,
      })
      .expect(403)
      .then(response => {
        const errorMessages: string = response.body.error

        expect(errorMessages).to.include("Transaction key is not correct");
      });
  });

  it("POST `local/transaction/id/payment-notification` with correct payload returns 200 - payment status success", async () => {
    const startTransactionResponse = await server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
    
    const transactionId = startTransactionResponse.body.transactionId

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
    
    await server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPaymentStatus);
      });
    
    const transaction = (await dynamoDbClient.getTransaction(transactionId)) as Required<TransactionData>;
    const { securityPaymentKey } = transaction
        
    await server.post(`local/transaction/${transactionId}/payment-notification?key=${securityPaymentKey}`)
      .set('x-api-key', config.apiKey)
      .send({
        status: PaymentStatus.Success,
      })
      .expect(200)
    
    return server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.PaymentSuccess);
      });
  });

  it("POST `local/transaction/id/payment-notification` with correct payload returns 200 - payment status failure", async () => {
    const startTransactionResponse = await server.post("local/transaction/start")
      .set('x-api-key', config.apiKey)
      .send({
        currencyFrom: "EUR",
        currencyTo: "PLN",
        currencyFromAmount: 100,
      })
      .expect(200)
    
    const transactionId = startTransactionResponse.body.transactionId

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
    
    await server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.WaitingForPaymentStatus);
      });
    
    const transaction = (await dynamoDbClient.getTransaction(transactionId)) as Required<TransactionData>;
    const { securityPaymentKey } = transaction
        
    await server.post(`local/transaction/${transactionId}/payment-notification?key=${securityPaymentKey}`)
      .set('x-api-key', config.apiKey)
      .send({
        status: PaymentStatus.Failure,
      })
      .expect(200)
    
    return server.get(`local/transaction/${transactionId}/status`)
      .set('x-api-key', config.apiKey)
      .expect(200)
      .then(response => {
        expect(response.body.transactionStatus).to.eql(TransactionStatus.PaymentFailure);
      });
  });
})