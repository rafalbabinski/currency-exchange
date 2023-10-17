import request from "supertest";

describe("test endpoint", () => {
  const server = request("http://localhost:1337/");

  describe("Test obligatory query parameter", () => {
    it("GET `dev/health-check` returns 200", () => {
      return server.get("dev/health-check").expect(200);
    });

    it("GET 'any' returns not found", () => {
      return server.get("any").expect(404);
    });
  });
});
