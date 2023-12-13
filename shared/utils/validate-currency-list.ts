import { regExp } from "./reg-exp";

export const validateCurrencyList = (currencyList: string) => {
  const currencyArray = currencyList.split(",");

  return currencyArray.length > 0 && currencyArray.every((currency) => new RegExp(regExp.currencyCode).test(currency));
};
