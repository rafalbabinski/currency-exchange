import { Response } from "supertest";

export const getResponseErrorMessages = (response: Response): string[] =>
  JSON.parse(response.body).description.map(({ message }: { message: string }) => message);
