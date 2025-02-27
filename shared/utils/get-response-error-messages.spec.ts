import { expect } from "chai";
import { Response } from "supertest";

import { getResponseErrorMessages } from "./get-response-error-messages";

describe("getResponseErrorMessages", () => {
  it("should return an array of error messages from the response body", () => {
    const mockResponse = {
      body: JSON.stringify({
        description: [{ message: "Error 1" }, { message: "Error 2" }],
      }),
    } as Response;

    const result = getResponseErrorMessages(mockResponse);

    expect(result).to.deep.equal(["Error 1", "Error 2"]);
  });

  it("should handle empty response body", () => {
    const mockResponse = {
      body: JSON.stringify({ description: [] }),
    } as Response;

    const result = getResponseErrorMessages(mockResponse);

    expect(result).to.be.empty;
  });
});
