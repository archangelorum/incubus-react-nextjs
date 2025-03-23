import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { passkey } from "better-auth/plugins/passkey"
import { admin, oneTap, organization } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: "769858400792-q54seavc1b4iu6psqg1mdcr8llif60mf.apps.googleusercontent.com",
      clientSecret: "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",
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    oneTap(),
    passkey(),
    admin(),
    organization()
  ],
  debug: process.env.NODE_ENV === "development",
});