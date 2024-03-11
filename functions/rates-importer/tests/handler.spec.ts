import request from "supertest";
import { expect } from "chai";

import { createConfig } from "./../config";
import { createDynamoDBClient } from "../../../shared/dynamodb/dynamodb-client-factory";

const config = createConfig(process.env);

const dynamoDb = createDynamoDBClient(true)

describe("rates-importer endpoint", () => {
  const server = request("http://localhost:1337/");

  describe("Test obligatory query parameter", () => {
    it("GET `local/rates-importer` returns 200", () => {
      return server.get("local/rates-importer")
        .set('x-api-key', config.apiKey)
        .expect(200);
    });
  });
});
