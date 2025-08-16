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
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID || "",
        clientSecret: process.env.APPLE_CLIENT_SECRET,
      },
      twitter: {
        clientId: process.env.TWITTER_CLIENT_ID || "",
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
      },
  },
  trustedOrigins: ["https://appleid.apple.com"],
  plugins: [
    reactStartCookies(), // make sure this is the last plugin in the array
  ],
  // Note: We'll implement user sync via manual calls for now
  // Better Auth hooks may need different implementation
});