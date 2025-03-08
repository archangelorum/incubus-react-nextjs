import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"

import type { NextAuthConfig } from "next-auth"
import Passkey from "next-auth/providers/passkey"
import { prisma } from "./prisma"
import { PlayerType } from "@prisma/client"

export default {
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
        async session({session, user, token}) {
            // Enrich the session with user data
            return {
                ...session,
                user: {
                    ...session.user,
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            };
        },
    },
    experimental: { enableWebAuthn: true },
} satisfies NextAuthConfig