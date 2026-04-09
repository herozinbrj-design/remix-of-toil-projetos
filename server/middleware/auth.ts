import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
  user?: {
    id: number;
    role: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    req.userId = payload.id;
    req.userRole = payload.role;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

export function generateToken(id: number, role: string): string {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });
}
