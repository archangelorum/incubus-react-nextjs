import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { passkey } from "better-auth/plugins/passkey"
import { admin, oneTap, organization } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string | "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string | "",
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