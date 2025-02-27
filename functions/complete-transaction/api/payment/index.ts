import axios, { AxiosInstance } from "axios";

import { requestSuccessInterceptor } from "../../../../shared/utils/request-success-interceptor";
import { Token } from "../../../../shared/types/token.types";
import { createConfig } from "../../config";
import { api } from "../api";
import { endpoints } from "./endpoints";
import { ProcessPaymentPayload, ProcessPaymentResponse } from "./types";

const config = createConfig(process.env);

export const paymentApi = (client: AxiosInstance) => {
  const processPayment = async (payload: ProcessPaymentPayload): Promise<ProcessPaymentResponse> => {
    const response = await client.post<ProcessPaymentResponse>(endpoints.payment, payload);

    return response.data;
  };

  return {
    processPayment,
  };
};

export const createPaymentApiClient = () => {
  const client = axios.create({
    baseURL: api.payment,
  });

  const token: Token = {
    header: config.paymentApiHeader,
    value: config.paymentApiToken,
  };

  client.interceptors.request.use((requestConfig) => requestSuccessInterceptor(requestConfig, token));

  return paymentApi(client);
};
