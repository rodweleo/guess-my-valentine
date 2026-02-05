import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(
  payload: object | string | Buffer<ArrayBufferLike>,
  expiresIn: string = "48h"
) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
}
