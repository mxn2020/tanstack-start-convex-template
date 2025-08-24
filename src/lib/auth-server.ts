import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { reactStartCookies } from "better-auth/react-start";
import { PrismaClient } from "@prisma/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Create fresh Prisma client to avoid cached plan issues
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Convex client for syncing users
const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || "http://localhost:3210");

// Sync user to Convex helper
async function syncUserToConvex(user: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  try {
    await convex.mutation(api.users.createOrUpdateUser, {
      authUserId: user.id,
      email: user.email,
      name: user.name || undefined,
      avatar: user.image || undefined,
    });
    console.log(`✅ User synced to Convex: ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to sync user to Convex:`, error);
    // Don't throw error to avoid breaking auth flow
  }
}

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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Sync user to Convex after creation (covers all signup methods)
          await syncUserToConvex({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          });
        },
      },
      update: {
        after: async (user) => {
          // Sync user updates to Convex (profile changes, etc.)
          await syncUserToConvex({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          });
        },
      },
    },
  },
  plugins: [
    reactStartCookies(), // make sure this is the last plugin in the array
  ],
});