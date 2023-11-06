import axios, { AxiosInstance } from "axios";

import { api } from "../api";
import { endpoints } from "./endpoints";
import { createConfig } from "../../config";
import { Token } from "../../../../shared/types/token.types";
import { RatesResponse } from "./types";
import { requestSuccessInterceptor } from "../../../../shared/utils/request-success-interceptor";

const config = createConfig(process.env);

export const currencyApi = (client: AxiosInstance) => {
  const getRates = async (): Promise<RatesResponse> => {
    const response = await client.get<RatesResponse>(endpoints.rates);

    return response.data;
  };

  return {
    getRates,
  };
};

export const createCurrencyApiClient = () => {
  const client = axios.create({
    baseURL: api.currency,
  });

  const token: Token = {
    header: config.currencyApiHeader,
    value: config.currencyApiToken,
  };

  client.interceptors.request.use((requestConfig) => requestSuccessInterceptor(requestConfig, token));

  return currencyApi(client);
};
