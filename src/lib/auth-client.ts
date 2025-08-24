import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.BETTER_AUTH_URL || "https://your-domain.com"
    : "http://localhost:3000"
})

// Export commonly used auth functions for convenience
export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession
} = authClient;

// Email/password specific functions
export const signInEmail = authClient.signIn.email;
export const signUpEmail = authClient.signUp.email;

// Social auth functions
export const signInSocial = authClient.signIn.social;

