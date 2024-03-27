import { TransactionData } from "../../../workflows/transaction-workflow/start-transaction-step/helpers/to-transaction-dto";

export const toHtmlData = (transaction: Required<TransactionData>) => {
  const {
    firstName,
    lastName,
    city,
    zipCode,
    email,
    transactionId,
    createdAt,
    currencyFrom,
    currencyFromAmount,
    currencyTo,
    currencyToAmount,
    exchangeRate,
  } = transaction;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Transaction Confirmation</title>
    </head>
    <body>
        <h2>Transaction Confirmation</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Zip Code:</strong> ${zipCode}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p><strong>Date:</strong> ${createdAt}</p>
        <p><strong>From Currency:</strong> ${currencyFrom}</p>
        <p><strong>From Amount:</strong> ${currencyFromAmount}</p>
        <p><strong>To Currency:</strong> ${currencyTo}</p>
        <p><strong>To Amount:</strong> ${currencyToAmount}</p>
        <p><strong>Exchange Rate:</strong> ${exchangeRate}</p>
    </body>
    </html>
    `;
};
