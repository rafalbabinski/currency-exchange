
import { createConfig } from "./../config";
import { generatePath, server } from "../../../shared/tests";

const config = createConfig(process.env);

describe("rates-importer endpoint", () => {
  it("GET `rates-importer` returns 200", () => {
    return server.get(generatePath("rates-importer"))
      .set('x-api-key', config.apiKey)
      .expect(200);
  });
});
