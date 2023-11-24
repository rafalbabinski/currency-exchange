import sinon from "sinon";
import { expect } from "chai";

import { CurrencyRatesDto } from "../../rates-importer/helpers/to-currency-rates-dto";
import { calculateExchangeRate } from "./calculate-exchange-rate";

const mockNow = new Date();

describe("calculateExchangeRate", () => {
  beforeEach(() => {
    sinon.useFakeTimers(mockNow.getTime());
  });

  afterEach(() => {
    sinon.restore();
  });

  const currencyRates: CurrencyRatesDto = {
    baseCurrency: "USD",
    createdAt: new Date().toISOString(),
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.75,
  };

  it("should calculate the exchange rate correctly (1)", () => {
    const result = calculateExchangeRate({
      startCurrency: "USD",
      endCurrency: "EUR",
      currencyRates,
    });

    expect(result).to.deep.equal(0.85);
  });

  it("should calculate the exchange rate correctly (2)", () => {
    const result = calculateExchangeRate({
      startCurrency: "EUR",
      endCurrency: "USD",
      currencyRates,
    });

    expect(result).to.deep.equal(1 / 0.85);
  });

  it("should throw an error for invalid currencies", () => {
    expect(() => {
      calculateExchangeRate({
        startCurrency: "INVALID",
        endCurrency: "EUR",
        currencyRates,
      });
    }).to.throw("Invalid currencies provided");

    expect(() => {
      calculateExchangeRate({
        startCurrency: "USD",
        endCurrency: "INVALID",
        currencyRates,
      });
    }).to.throw("Invalid currencies provided");
  });

  it("should throw an error for invalid exchange rate values", () => {
    expect(() => {
      calculateExchangeRate({
        startCurrency: "USD",
        endCurrency: "EUR",
        currencyRates: {
          baseCurrency: "USD",
          createdAt: new Date().toISOString(),
          USD: "invalid",
          EUR: 0.85,
        },
      });
    }).to.throw("Invalid exchange rate values");

    expect(() => {
      calculateExchangeRate({
        startCurrency: "USD",
        endCurrency: "EUR",
        currencyRates: {
          baseCurrency: "USD",
          createdAt: new Date().toISOString(),
          USD: 1.0,
          EUR: "invalid",
        },
      });
    }).to.throw("Invalid exchange rate values");
  });
});
