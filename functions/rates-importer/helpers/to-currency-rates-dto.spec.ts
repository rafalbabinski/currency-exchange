import sinon from "sinon";
import { expect } from "chai";

import { RatesResponse } from "../api/currency/types";
import { CurrencyRatesDto, toCurrencyRatesDto } from "./to-currency-rates-dto";

const mockNow = new Date();

describe("toCurrencyRatesDto", () => {
  beforeEach(() => {
    sinon.useFakeTimers(mockNow.getTime());
  });

  it("should convert RatesResponse to CurrencyRatesDto", () => {
    const ratesResponse: RatesResponse = {
      currency: "USD",
      rates: [
        { currency: "EUR", rate: 0.85 },
        { currency: "GBP", rate: 0.75 },
      ],
    };

    const expectedDto: CurrencyRatesDto = {
      currencyName: "USD",
      createdAt: new Date().toISOString(),
      EUR: 0.85,
      GBP: 0.75,
    };

    const convertedDto = toCurrencyRatesDto(ratesResponse);

    expect(convertedDto).to.deep.equal(expectedDto);
  });
});