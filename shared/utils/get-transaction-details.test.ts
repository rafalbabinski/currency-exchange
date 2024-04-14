import { expect } from "chai";

import { TransactionData } from "../../workflows/transaction-workflow/start-transaction-step/helpers/to-transaction-dto";
import { getTransactionDetails } from "./get-transaction-details";
import { TransactionStatus } from "../types/transaction.types";

describe("getTransactionDetails", () => {
  it("should return the transaction with certain fields undefined", () => {
    const transaction: TransactionData = {
      lastName: "Babinski",
      zipCode: "21-400",
      city: "Lukow",
      transactionStatus: TransactionStatus.PaymentSuccess,
      transactionId: "XWVjcRoEZhmx6hasEywh_",
      createdAt: "2024-04-14T16:53:15.410Z",
      firstName: "Rafal",
      securityPaymentKey:
        "8XpV_wiyZeYc8YvCUKrI9UDZxUCXtZuieOwjoM98qkppqgLXKhzfINCWaUm7rShRgPsjbItRreN2jjCfad6Zw-UdC-xv6dOIINK-",
      currencyFromAmount: 100,
      exchangeRate: 0.63,
      currencyToAmount: 63,
      sk: "createdAt#2024-04-14T16:53:15.410Z",
      pk: "transaction#XWVjcRoEZhmx6hasEywh_",
      currencyTo: "PLN",
      currencyFrom: "EUR",
      email: "rafal.babinski@tsh.io",
      taskToken: "537a36ff-8aa8-4605-b8be-b872070fc993",
      updatedAt: "2024-04-14T16:54:22.006Z",
    };

    const result = getTransactionDetails(transaction);

    expect(result.pk).to.be.undefined;
    expect(result.sk).to.be.undefined;
    expect(result.taskToken).to.be.undefined;
    expect(result.securityPaymentKey).to.be.undefined;

    expect(result).to.be.deep.equal({
      lastName: "Babinski",
      zipCode: "21-400",
      city: "Lukow",
      transactionStatus: TransactionStatus.PaymentSuccess,
      transactionId: "XWVjcRoEZhmx6hasEywh_",
      createdAt: "2024-04-14T16:53:15.410Z",
      firstName: "Rafal",
      currencyFromAmount: 100,
      exchangeRate: 0.63,
      currencyToAmount: 63,
      currencyTo: "PLN",
      currencyFrom: "EUR",
      email: "rafal.babinski@tsh.io",
      updatedAt: "2024-04-14T16:54:22.006Z",
    });
  });
});
