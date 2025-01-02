import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "../prisma/prisma"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import { Adapter } from "next-auth/adapters"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "database"
  },
  providers: [
    Google({
      profile(profile){
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          roleId: 1
        }
      }
    }),
    Discord({
      profile(profile){
        console.log(profile);
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.avatar,
          roleId: 1
        }
      }
    }),
    GitHub({
      profile(profile){
        const roleId = profile.login === "archangelorum" ? 3 : 1; //isAdmin

        return {
          id: profile.id.toString(),
          name: profile.login,
          email: profile.email,
          image: profile.avatar_url,
          roleId: roleId
        };
      }
    }),
  ],
})