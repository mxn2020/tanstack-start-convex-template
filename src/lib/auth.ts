import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { reactStartCookies } from "better-auth/react-start";
import { PrismaClient } from "@prisma/client";

// Create fresh Prisma client to avoid cached plan issues
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // Neon uses PostgreSQL
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // GitHub OAuth can be added later
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
  },
  plugins: [
    reactStartCookies(), // make sure this is the last plugin in the array
  ],
});