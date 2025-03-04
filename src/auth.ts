import NextAuth from "next-auth"
import authConfig from "@/auth.config"

import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import type { Adapter } from "next-auth/adapters"


export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "database"
  },
  ...authConfig,
})