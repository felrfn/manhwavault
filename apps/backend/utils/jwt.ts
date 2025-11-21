import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function signJwt(payload: object, opts?: jwt.SignOptions) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d", ...opts });
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}
