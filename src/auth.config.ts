import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Passkey from "next-auth/providers/passkey";

import { NextAuthConfig } from "next-auth";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { prisma } from "@/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      }
    }),
    Discord({
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.avatar,
        }
      }
    }),
    GitHub({
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      }
    }),
    Passkey,
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.sub = user.id;

        const [platformStaff, publisherStaff] = await Promise.all([
          prisma.platformStaff.findUnique({
            where: { userId: user.id }
          }),
          prisma.publisherStaff.findUnique({
            where: { userId: user.id }
          })
        ]);

        token.roles = [
          ...(platformStaff ? [platformStaff.role] : []),
          ...(publisherStaff ? [publisherStaff.role] : [])
        ] as (PlatformStaffRole | PublisherStaffRole)[];
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.roles = token?.roles || [];
      return session;
    }
  },
  pages: {
    signIn: "/auth/login"
  },
  experimental: { enableWebAuthn: true },
} satisfies NextAuthConfig;