import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function allowedDiscordIds(): string[] {
  return (process.env.ALLOWED_DISCORD_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // This is the panel's actual gate, independent of Discord OAuth2 itself:
    // completing Discord login proves who you are, not that you're allowed
    // in. A non-empty ALLOWED_DISCORD_IDS is required to let anyone in at
    // all — an empty list is treated as "not configured yet" and refuses
    // everyone, rather than silently granting access to any Discord user.
    async signIn({ account }) {
      const allowed = allowedDiscordIds();
      if (allowed.length === 0) return false;
      if (!account || account.provider !== "discord") return false;
      return allowed.includes(account.providerAccountId);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
