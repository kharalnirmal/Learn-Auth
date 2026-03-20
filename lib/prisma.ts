// lib/prisma.ts

import { PrismaClient } from "../src/generated/prisma/client";
// We import from src/generated/prisma/client
// Remember — Prisma 7 generates the client INSIDE your project
// not from node_modules like older versions did
// '../src/generated/prisma/client' means:
// go up from lib/ to root, then into src/generated/prisma/client

import { PrismaPg } from "@prisma/adapter-pg";
// PrismaPg is the bridge between Prisma and PostgreSQL
// Analogy: your laptop charger has two ends
// one end plugs into Prisma, other end plugs into PostgreSQL
// PrismaPg is that charger

// Create the adapter — give it your database connection string
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  // process.env.DATABASE_URL = the value from your .env file
  // the ! means "TypeScript, trust me this won't be undefined"
});

// SINGLETON PATTERN
// globalThis = an object that survives hot reloads in development
// When Next.js reloads your code on save, globalThis persists
// Without this pattern:
//   save file → Next.js reloads → new PrismaClient created → repeat
//   after 10 saves = 10 database connections = database crashes
// With this pattern:
//   save file → Next.js reloads → prisma already exists on globalThis → reuse it
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
// ?? = "nullish coalescing operator"
// means: use left side IF it exists, otherwise use right side
// so: use existing connection OR create a brand new one

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
// In development: save client to globalThis so it survives reloads
// In production: skip this — server never hot reloads anyway
