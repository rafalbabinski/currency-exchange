import { expect } from "chai";

import { regExp } from "./reg-exp";

describe("Regular Expressions", () => {
  it("should match valid currency codes", () => {
    const validCodes = ["USD", "EUR", "JPY"];

    validCodes.forEach((code) => {
      expect(new RegExp(regExp.currencyCode).test(code)).to.be.true;
    });
  });

  it("should not match invalid currency codes", () => {
    const invalidCodes = ["usd", "123", "USD1", "ABCD"];

    invalidCodes.forEach((code) => {
      expect(new RegExp(regExp.currencyCode).test(code)).to.be.false;
    });
  });

  it("should match valid zip codes", () => {
    const validZips = ["12345", "12-345", "12 345"];

    validZips.forEach((zip) => {
      expect(new RegExp(regExp.zipCode).test(zip)).to.be.true;
    });
  });

  it("should not match invalid zip codes", () => {
    const invalidZips = ["1234", "123456", "12-3456", "12 34 5"];

    invalidZips.forEach((zip) => {
      expect(new RegExp(regExp.zipCode).test(zip)).to.be.false;
    });
  });
});
