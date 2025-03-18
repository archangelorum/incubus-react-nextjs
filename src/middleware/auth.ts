import { auth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { prisma } from "@/prisma";

export default auth({
  callbacks: {
    authorized: async ({ req, token }: { req: NextRequest; token?: { sub?: string } }) => {
      // Redirect unauthenticated users
      if (!token?.sub) {
        return false;
      }

      // Get user roles
      const [platformStaff, publisherStaff] = await Promise.all([
        prisma.platformStaff.findUnique({
          where: { userId: token.sub }
        }),
        prisma.publisherStaff.findUnique({
          where: { userId: token.sub }
        })
      ]);

      // Add roles to request headers
      const roles: (PlatformStaffRole | PublisherStaffRole)[] = [];
      if (platformStaff) roles.push(platformStaff.role);
      if (publisherStaff) roles.push(publisherStaff.role);

      const headers = new Headers(req.headers);
      headers.set('x-user-roles', JSON.stringify(roles));

      return NextResponse.next({
        request: { headers }
      });
    }
  },
  pages: {
    signIn: "/auth/login"
  }
});

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"]
};