import { server } from "../../../shared/tests";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("health-check endpoint", () => {
  it("GET `local/health-check` without api key returns 403", () => {
    return server.get("local/health-check").expect(403);
  });


  it("GET `local/health-check` with api key returns 200", () => {
    return server.get("local/health-check").set('x-api-key', config.apiKey).expect(200);
  });

  it("GET 'any' returns not found", () => {
    return server.get("any").expect(404);
  });
});
