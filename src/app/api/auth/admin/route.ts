import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * This route handles all admin-related operations from the Better Auth admin plugin
 * It acts as a proxy to the Better Auth admin API
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const hasAdminPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          user: ["list"]
        }
      }
    });

    if (!hasAdminPermission) {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    // Forward to the Better Auth admin API
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    const result = await auth.api.listUsers({
      query: {
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        searchField: (searchParams.get('searchField') as "name" | "email" | undefined) || undefined,
        searchOperator: (searchParams.get('searchOperator') as "contains" | "starts_with" | "ends_with" | undefined) || undefined,
        searchValue: searchParams.get('searchValue') || undefined,
        sortBy: searchParams.get('sortBy') || undefined,
        sortDirection: (searchParams.get('sortDirection') as "asc" | "desc" | undefined) || undefined,
        filterField: searchParams.get('filterField') || undefined,
        filterOperator: (searchParams.get('filterOperator') as "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | undefined) || undefined,
        filterValue: searchParams.get('filterValue') || undefined
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in admin API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const hasAdminPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          user: ["create"]
        }
      }
    });

    if (!hasAdminPermission) {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "createUser":
        const { name, email, password, role, data } = body;
        const newUser = await auth.api.createUser({
          body: {
            name,
            email,
            password,
            role,
            data
          }
        });
        return NextResponse.json(newUser);

      case "setRole":
        const { userId, role: newRole } = body;
        const updatedUser = await auth.api.setRole({
          body: {
            userId,
            role: newRole
          }
        });
        return NextResponse.json(updatedUser);

      case "banUser":
        const { userId: banUserId, banReason, banExpiresIn } = body;
        const bannedUser = await auth.api.banUser({
          body: {
            userId: banUserId,
            banReason,
            banExpiresIn
          }
        });
        return NextResponse.json(bannedUser);

      case "unbanUser":
        const { userId: unbanUserId } = body;
        const unbannedUser = await auth.api.unbanUser({
          body: {
            userId: unbanUserId
          }
        });
        return NextResponse.json(unbannedUser);

      case "listUserSessions":
        const { userId: sessionsUserId } = body;
        const sessions = await auth.api.listUserSessions({
          body: {
            userId: sessionsUserId
          }
        });
        return NextResponse.json(sessions);

      case "revokeUserSession":
        const { sessionToken } = body;
        const revokedSession = await auth.api.revokeUserSession({
          body: {
            sessionToken
          }
        });
        return NextResponse.json(revokedSession);

      case "revokeUserSessions":
        const { userId: revokeUserId } = body;
        const revokedSessions = await auth.api.revokeUserSessions({
          body: {
            userId: revokeUserId
          }
        });
        return NextResponse.json(revokedSessions);

      case "impersonateUser":
        const { userId: impersonateUserId } = body;
        const impersonatedSession = await auth.api.impersonateUser({
          body: {
            userId: impersonateUserId
          }
        });
        return NextResponse.json(impersonatedSession);

      case "stopImpersonating":
        const result = await auth.api.stopImpersonating({
          headers: await headers()
        });
        return NextResponse.json(result);

      case "removeUser":
        const { userId: removeUserId } = body;
        const deletedUser = await auth.api.removeUser({
          body: {
            userId: removeUserId
          }
        });
        return NextResponse.json(deletedUser);

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in admin API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}