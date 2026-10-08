import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

const clientId = process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || "";
const clientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || "";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId,
      clientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as any;
        const githubId = String(githubProfile.id);

        await prisma.user.upsert({
          where: { githubId },
          update: {
            username: githubProfile.login,
            name: githubProfile.name || githubProfile.login,
            email: githubProfile.email || user.email,
            avatarUrl: githubProfile.avatar_url || user.image,
            bio: githubProfile.bio || null,
          },
          create: {
            githubId,
            username: githubProfile.login,
            name: githubProfile.name || githubProfile.login,
            email: githubProfile.email || user.email,
            avatarUrl: githubProfile.avatar_url || user.image,
            bio: githubProfile.bio || null,
          },
        });
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      if (account?.provider === "github" && profile) {
        const githubProfile = profile as any;
        const githubId = String(githubProfile.id);

        const dbUser = await prisma.user.findUnique({
          where: { githubId },
          select: { id: true },
        });

        if (dbUser) {
          token.userId = dbUser.id;
        }
      } else if (token.sub && !token.userId) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: token.sub },
              { githubId: token.sub },
            ],
          },
          select: { id: true },
        });

        if (dbUser) {
          token.userId = dbUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = String(token.userId || token.sub || "");
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
