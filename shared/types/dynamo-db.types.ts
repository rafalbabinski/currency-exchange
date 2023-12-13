import { QueryCommandOutput } from "@aws-sdk/lib-dynamodb";

export type IQueryCommandOutput<T> = Omit<QueryCommandOutput, "Items"> & {
  Items?: T;
};
