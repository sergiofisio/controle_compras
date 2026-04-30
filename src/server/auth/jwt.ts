import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "dev-secret";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, secret, { expiresIn: "8h" });
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, secret) as SessionPayload;
}
