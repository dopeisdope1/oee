import type { DefaultSession } from "next-auth";

// Adds `id` to session.user, populated in the session callback in
// src/auth.ts. Keeping this in its own file per Auth.js convention so it's
// picked up as a global module augmentation.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
