import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authorizeOrganization, authenticateRequest } from "../../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../../../utils/response";
import { validateBody, validateParams } from "../../../../utils/validation";
import { organizationIdSchema } from "../../../schema";
import { z } from "zod";

// Schema for invitation ID parameter
const invitationIdSchema = z.object({
  invitationId: z.string().uuid({ message: "Invalid invitation ID format" })
});

// Schema for updating invitation status
const updateInvitationSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "CANCELLED"], {
    errorMap: () => ({ message: "Status must be ACCEPTED, REJECTED, or CANCELLED" })
  })
});

/**
 * PUT /api/organizations/[id]/invitations/[invitationId]
 * 
 * Updates an invitation status
 * Organization owners/admins can cancel invitations
 * Invited users can accept or reject invitations
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated invitation
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; invitationId: string } }
) {
  try {
    // Validate ID parameters
    const validatedOrgParams = validateParams({ id: params.id }, organizationIdSchema);
    if (validatedOrgParams instanceof Response) return validatedOrgParams;
    
    const validatedInvitationParams = validateParams(
      { invitationId: params.invitationId }, 
      invitationIdSchema
    );
    if (validatedInvitationParams instanceof Response) return validatedInvitationParams;

    // Validate request body
    const validatedData = await validateBody(req, updateInvitationSchema);
    if (validatedData instanceof Response) return validatedData;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Fetch the invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: params.invitationId,
        organizationId: params.id
      },
      include: {
        organization: true
      }
    });

    if (!invitation) {
      return notFoundResponse("Invitation");
    }

    // Check if invitation has expired
    if (invitation.status === "PENDING" && new Date() > invitation.expiresAt) {
      return errorResponse("Invitation has expired", 400);
    }

    // Handle different status updates
    if (validatedData.status === "CANCELLED") {
      // Only organization owners/admins can cancel invitations
      const orgSession = await authorizeOrganization(req, params.id, ["owner", "admin"]);
      if (orgSession instanceof Response) return orgSession;
    } else if (validatedData.status === "ACCEPTED" || validatedData.status === "REJECTED") {
      // Only the invited user can accept/reject invitations
      if (session.user.email !== invitation.email) {
        return errorResponse("You can only respond to invitations sent to your email", 403);
      }
    }

    // Update invitation status
    const updatedInvitation = await prisma.$transaction(async (tx) => {
      const updated = await tx.invitation.update({
        where: { id: params.invitationId },
        data: {
          status: validatedData.status
        }
      });

      // If invitation is accepted, create a new member
      if (validatedData.status === "ACCEPTED") {
        // Create member record
        await tx.member.create({
          data: {
            id: crypto.randomUUID(),
            organizationId: params.id,
            userId: session.user.id,
            role: invitation.role || "member",
            createdAt: new Date()
          }
        });
      }

      return updated;
    });

    return successResponse(
      updatedInvitation, 
      `Invitation ${validatedData.status.toLowerCase()} successfully`
    );
  } catch (error) {
    console.error("Error updating invitation:", error);
    return errorResponse("Failed to update invitation", 500);
  }
}

/**
 * DELETE /api/organizations/[id]/invitations/[invitationId]
 * 
 * Deletes an invitation
 * 
 * @requires Organization ownership or admin role
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Success message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; invitationId: string } }
) {
  try {
    // Validate ID parameters
    const validatedOrgParams = validateParams({ id: params.id }, organizationIdSchema);
    if (validatedOrgParams instanceof Response) return validatedOrgParams;
    
    const validatedInvitationParams = validateParams(
      { invitationId: params.invitationId }, 
      invitationIdSchema
    );
    if (validatedInvitationParams instanceof Response) return validatedInvitationParams;

    // Authorize access (user must be an owner or admin of the organization)
    const session = await authorizeOrganization(req, params.id, ["owner", "admin"]);
    if (session instanceof Response) return session;

    // Check if invitation exists and belongs to the organization
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: params.invitationId,
        organizationId: params.id
      }
    });

    if (!invitation) {
      return notFoundResponse("Invitation");
    }

    // Delete invitation
    await prisma.invitation.delete({
      where: { id: params.invitationId }
    });

    return successResponse(null, "Invitation deleted successfully");
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return errorResponse("Failed to delete invitation", 500);
  }
}