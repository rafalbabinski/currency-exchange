import sinon from "sinon";
import { expect } from "chai";

import { TransactionStatus } from "../../../../shared/types/transaction.types";
import { Data, TransactionDto, toTransactionDto } from "./to-transaction-dto";

const mockNow = new Date();

describe("toTransactionDto", () => {
  beforeEach(() => {
    sinon.useFakeTimers(mockNow.getTime());
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a TransactionDto with the correct properties", () => {
    const input: Data = {
      transactionId: "12345",
      taskToken: "6789",
      currencyFrom: "USD",
      currencyFromAmount: 100,
      currencyTo: "EUR",
      currencyToAmount: 85,
      exchangeRate: 0.85,
    };

    const convertedDto = toTransactionDto(input);

    const expectedDto: TransactionDto = {
      transactionId: "12345",
      taskToken: "6789",
      currencyFrom: "USD",
      currencyFromAmount: 100,
      currencyTo: "EUR",
      currencyToAmount: 85,
      exchangeRate: 0.85,
      createdAt: new Date().toISOString(),
      transactionStatus: TransactionStatus.Started,
    };

    expect(convertedDto).to.deep.equal(expectedDto);
  });
});
