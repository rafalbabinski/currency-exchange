
import { createConfig } from "./../config";
import { server } from "../../../shared/tests";

const config = createConfig(process.env);

describe("rates-importer endpoint", () => {
  it("GET `local/rates-importer` returns 200", () => {
    return server.get("local/rates-importer")
      .set('x-api-key', config.apiKey)
      .expect(200);
  });
});
