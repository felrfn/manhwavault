import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ success: false, error: "Missing token" });
  const token = header.replace(/^Bearer\s+/i, "");
  try {
    const payload = verifyJwt<{ sub: string }>(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}

export function authOptional(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (header) {
    try {
      const payload = verifyJwt<{ sub: string }>(
        header.replace(/^Bearer\s+/i, "")
      );
      req.userId = payload.sub;
    } catch {
      // ignore
    }
  }
  next();
}
