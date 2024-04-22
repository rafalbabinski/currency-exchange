import request from "supertest";

export const server = request("http://localhost:1337/");

export const generatePath = (path: string): string => `local/${path}${path.indexOf("?") === -1 ? "?" : "&"}lang=cimode`;
