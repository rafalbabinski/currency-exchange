import sinon from "sinon";
import { expect } from "chai";

import { CurrencyRatesData } from "../../rates-importer/helpers/to-currency-rates-dto";
import { calculateExchangeRate } from "./calculate-exchange-rates";

const mockNow = new Date();

const baseImporterCurrency = "USD";
const createdAt = new Date().toISOString();

const currencyRates: CurrencyRatesData = {
  pk: `currencyRate#${baseImporterCurrency}`,
  sk: `createdAt#${createdAt}`,
  baseImporterCurrency,
  createdAt,
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.75,
};

const newCurrencyFrom = "EUR";

describe("calculateExchangeRate", () => {
  beforeEach(() => {
    sinon.useFakeTimers(mockNow.getTime());
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should calculate exchange rates correctly for valid input", () => {
    const result = calculateExchangeRate({
      currencyFrom: newCurrencyFrom,
      currencyRates,
    });

    expect(result).to.be.instanceOf(Object);

    Object.values(result).forEach((exchangeRate) => {
      expect(typeof exchangeRate).to.be.equal("number");
      expect(exchangeRate).to.be.greaterThanOrEqual(0);
    });
  });

  it("should throw an error for invalid base currency", () => {
    const invalidCurrencyFrom = "XYZ";

    expect(() => {
      calculateExchangeRate({
        currencyFrom: invalidCurrencyFrom,
        currencyRates,
      });
    }).to.throw("Invalid new base currency provided");
  });

  it("should throw an error for invalid exchange rate values", () => {
    const invalidCurrencyRates = {
      ...currencyRates,
      USD: 1,
      EUR: "invalid",
      GBP: 0.75,
    };

    expect(() => {
      calculateExchangeRate({
        currencyFrom: newCurrencyFrom,
        currencyRates: invalidCurrencyRates,
      });
    }).to.throw("Invalid exchange rate values");
  });
});
