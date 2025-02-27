import { InternalAxiosRequestConfig } from "axios";
import { Token } from "../types/token.types";

export const requestSuccessInterceptor = (
  config: InternalAxiosRequestConfig,
  { header: customHeader, value }: Token,
): InternalAxiosRequestConfig => {
  const { headers } = config;

  if (customHeader) {
    headers[customHeader] = value;
  }

  return config;
};
