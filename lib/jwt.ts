// lib/jwt.ts

import jwt from "jsonwebtoken";
// jwt is the jsonwebtoken package we installed
// it has two main jobs:
// 1. sign()   = create a new token
// 2. verify() = check if a token is real and not expired

// TYPE DEFINITION
// This describes exactly what data lives INSIDE our tokens
// Think of it like a form — these are all the fields on the form
export type JwtPayload = {
  userId: string;
  // the user's unique ID from the database
  // e.g., "clx4k2m0j0000abc123"

  email: string;
  // the user's email address
  // e.g., "john@example.com"

  role: "ADMIN" | "USER" | "GUEST";
  // the | symbol means "OR"
  // so this means: role can be "ADMIN" OR "USER" OR "GUEST"
  // TypeScript will error if you try role = "SUPERUSER"

  tokenVersion: number;
  // must match the tokenVersion stored in the database
  // if they don't match = token is invalidated = user kicked out
  // this is how "logout all devices" works
};

// Read secrets from .env file
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
// These are the "keys" used to sign tokens
// Anyone who has these strings can create valid tokens
// That's why they live in .env and never in your code

// ─── SIGN FUNCTIONS ────────────────────────────────────────
// SIGN = create a brand new token
// Like a stamp machine — you feed in data, get back a stamped token

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  // payload  = the data to put inside the token
  // JWT_SECRET = the key used to sign it
  // expiresIn: '15m' = token dies after 15 minutes
  // returns a string like "eyJhbGci..."
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  // uses a DIFFERENT secret than access token — intentional
  // expiresIn: '7d' = token lives for 7 days
  // longer lived because it's used to silently get new access tokens
}

// ─── VERIFY FUNCTIONS ──────────────────────────────────────
// VERIFY = check if a token is genuine and not expired
// Like a bouncer checking a wristband
// if valid   → returns the payload data inside the token
// if invalid → THROWS an error (we catch this in proxy.ts)

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
  // jwt.verify() either returns payload OR throws an error
  // "as JwtPayload" tells TypeScript the shape of the returned data
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}
