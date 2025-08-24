import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Convex client for syncing users
const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || "http://localhost:3210");

// Utility function to sync user to Convex
export async function syncUserToConvex(user: {
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
    throw error;
  }
}