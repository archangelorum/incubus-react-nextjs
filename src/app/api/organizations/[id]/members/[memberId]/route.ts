import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeOrganization } from "../../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../../../utils/response";
import { validateBody, validateParams } from "../../../../utils/validation";
import { organizationIdSchema, updateMemberSchema } from "../../../schema";
import { z } from "zod";

// Schema for member ID parameter
const memberIdSchema = z.object({
  memberId: z.string().uuid({ message: "Invalid member ID format" })
});

/**
 * PUT /api/organizations/[id]/members/[memberId]
 * 
 * Updates a member's role in an organization
 * 
 * @requires Organization ownership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated member
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    // Validate ID parameters
    const validatedOrgParams = validateParams({ id: params.id }, organizationIdSchema);
    if (validatedOrgParams instanceof Response) return validatedOrgParams;
    
    const validatedMemberParams = validateParams({ memberId: params.memberId }, memberIdSchema);
    if (validatedMemberParams instanceof Response) return validatedMemberParams;

    // Validate request body
    const validatedData = await validateBody(req, updateMemberSchema);
    if (validatedData instanceof Response) return validatedData;

    // Authorize access (user must be an owner of the organization)
    const session = await authorizeOrganization(req, params.id, ["owner"]);
    if (session instanceof Response) return session;

    // Check if member exists and belongs to the organization
    const existingMember = await prisma.member.findFirst({
      where: {
        id: params.memberId,
        organizationId: params.id
      },
      include: {
        user: true
      }
    });

    if (!existingMember) {
      return notFoundResponse("Member");
    }

    // Prevent changing the role of the last owner
    if (existingMember.role === "owner" && validatedData.role !== "owner") {
      // Count how many owners the organization has
      const ownersCount = await prisma.member.count({
        where: {
          organizationId: params.id,
          role: "owner"
        }
      });

      if (ownersCount <= 1) {
        return errorResponse(
          "Cannot change the role of the last owner. Transfer ownership to another member first.",
          400
        );
      }
    }

    // Update member's role
    const updatedMember = await prisma.member.update({
      where: { id: params.memberId },
      data: {
        role: validatedData.role
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return successResponse(updatedMember, "Member role updated successfully");
  } catch (error) {
    console.error("Error updating organization member:", error);
    return errorResponse("Failed to update organization member", 500);
  }
}

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * 
 * Removes a member from an organization
 * 
 * @requires Organization ownership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Success message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    // Validate ID parameters
    const validatedOrgParams = validateParams({ id: params.id }, organizationIdSchema);
    if (validatedOrgParams instanceof Response) return validatedOrgParams;
    
    const validatedMemberParams = validateParams({ memberId: params.memberId }, memberIdSchema);
    if (validatedMemberParams instanceof Response) return validatedMemberParams;

    // Authorize access (user must be an owner of the organization)
    const session = await authorizeOrganization(req, params.id, ["owner"]);
    if (session instanceof Response) return session;

    // Check if member exists and belongs to the organization
    const existingMember = await prisma.member.findFirst({
      where: {
        id: params.memberId,
        organizationId: params.id
      }
    });

    if (!existingMember) {
      return notFoundResponse("Member");
    }

    // Prevent removing the last owner
    if (existingMember.role === "owner") {
      // Count how many owners the organization has
      const ownersCount = await prisma.member.count({
        where: {
          organizationId: params.id,
          role: "owner"
        }
      });

      if (ownersCount <= 1) {
        return errorResponse(
          "Cannot remove the last owner. Transfer ownership to another member first.",
          400
        );
      }
    }

    // Remove member from organization
    await prisma.member.delete({
      where: { id: params.memberId }
    });

    return successResponse(null, "Member removed successfully");
  } catch (error) {
    console.error("Error removing organization member:", error);
    return errorResponse("Failed to remove organization member", 500);
  }
}