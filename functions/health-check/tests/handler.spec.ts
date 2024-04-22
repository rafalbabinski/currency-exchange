import { generatePath, server } from "../../../shared/tests";
import { createConfig } from "./../config";

const config = createConfig(process.env);

describe("health-check endpoint", () => {
  it("GET `health-check` without api key returns 403", () => {
    return server.get(generatePath("health-check")).expect(403);
  });


  it("GET `health-check` with api key returns 200", () => {
    return server.get(generatePath("health-check")).set('x-api-key', config.apiKey).expect(200);
  });

  it("GET 'any' returns not found", () => {
    return server.get(generatePath("any")).expect(404);
  });
});
