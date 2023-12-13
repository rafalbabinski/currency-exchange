import { expect } from "chai";
import { validateCurrencyList } from "./validate-currency-list"; // Replace 'yourModule' with the actual module path

describe("validateCurrencyList function", () => {
  it("should return true for a valid currency list", () => {
    const validCurrencyList = "USD,EUR,GBP";
    const result = validateCurrencyList(validCurrencyList);

    expect(result).to.be.equal(true);
  });

  it("should return false for an empty currency list", () => {
    const emptyCurrencyList = "";
    const result = validateCurrencyList(emptyCurrencyList);

    expect(result).to.be.equal(false);
  });

  it("should return false for a currency list with invalid format", () => {
    const invalidFormatCurrencyList = "USD,EUR,invalid";
    const result = validateCurrencyList(invalidFormatCurrencyList);

    expect(result).to.be.equal(false);
  });

  it("should return false for a currency list with lowercase currencies", () => {
    const lowercaseCurrencyList = "usd,eur,gbp";
    const result = validateCurrencyList(lowercaseCurrencyList);

    expect(result).to.be.equal(false);
  });

  it("should return false for a currency list with spaces", () => {
    const spaceInCurrencyList = "USD, EUR, GBP";
    const result = validateCurrencyList(spaceInCurrencyList);

    expect(result).to.be.equal(false);
  });
});
