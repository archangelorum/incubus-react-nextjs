import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/prisma";
import { passkey } from "better-auth/plugins/passkey"
import { admin, organization } from "better-auth/plugins";


export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile: (profile: any) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }),
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      profile: (profile: any) => ({
        id: profile.id,
        name: profile.username,
        email: profile.email,
        image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
      }),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      profile: (profile: any) => ({
        id: profile.id.toString(),
        name: profile.login,
        email: profile.email,
        image: profile.avatar_url,
      }),
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    passkey(),
    admin(),
    organization()
  ],
  debug: process.env.NODE_ENV === "development",
});