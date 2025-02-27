import sinon from "sinon";
import { expect } from "chai";
import { DateTime } from "luxon";

import { checkTransactionExpired } from "./check-transaction-expired";

const mockNow = DateTime.local(2024, 1, 28, 20).toJSDate();
const timeToCompleteTransaction = 3 * 60 * 60 * 1000;

describe("checkTransactionExpired", () => {
  beforeEach(() => {
    sinon.useFakeTimers(mockNow.getTime());
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return true if the transaction is expired", () => {
    const createdAt = DateTime.local(2024, 1, 28, 10).toISOTime() as string;

    const result = checkTransactionExpired({ createdAt, timeToCompleteTransaction });

    expect(result).to.be.equal(true);
  });

  it("should return false if the transaction is not expired", () => {
    const createdAt = DateTime.local(2024, 1, 28, 19).toISOTime() as string;

    const result = checkTransactionExpired({ createdAt, timeToCompleteTransaction });

    expect(result).to.be.equal(false);
  });

  it("should throw an error if the createdAt date format is invalid", () => {
    const invalidCreatedAt = "invalid-date-format";

    try {
      checkTransactionExpired({ createdAt: invalidCreatedAt, timeToCompleteTransaction });

      expect.fail("Expected an error to be thrown");
    } catch (error) {
      expect((error as Error).message).to.equal("Invalid createdAt date format");
    }
  });
});
