import { Context } from "aws-lambda";

export const handle = async (event: { [key: string]: any }, _context: Context) => {
  return event;
};
