import axios, { AxiosInstance } from "axios";

import { requestSuccessInterceptor } from "../../../../shared/utils/request-success-interceptor";
import { Token } from "../../../../shared/types/token.types";
import { createConfig } from "../../config";
import { api } from "../api";
import { endpoints } from "./endpoints";
import { RatesParams, RatesResponse } from "./types";

const config = createConfig(process.env);

export const ratesApi = (client: AxiosInstance) => {
  const getRates = async (params: RatesParams): Promise<RatesResponse> => {
    const response = await client.get<RatesResponse>(endpoints.rates, {
      params,
    });

    return response.data;
  };

  return {
    getRates,
  };
};

export const createRatesApiClient = () => {
  const client = axios.create({
    baseURL: api.rates,
  });

  const token: Token = {
    header: "x-api-key",
    value: config.apiKey,
  };

  client.interceptors.request.use((requestConfig) => requestSuccessInterceptor(requestConfig, token));

  return ratesApi(client);
};
