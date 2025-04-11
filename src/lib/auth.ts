import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { passkey } from "better-auth/plugins/passkey"
import { admin as adminPlugin, oneTap, organization } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendOrganizationInvitation } from "@/lib/email";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, ownerAc, memberAc } from 'better-auth/plugins/organization/access';

// Define custom statements for organization access control
const statement = {
  ...defaultStatements,
  // Add game publisher specific permissions
  game: ["create", "update", "delete", "publish"],
  gameItem: ["create", "update", "delete"],
} as const;

// Create access control with our statements
const ac = createAccessControl(statement);

// Define roles with permissions
const owner = ac.newRole({
  ...ownerAc.statements,
  game: ["create", "update", "delete", "publish"],
  gameItem: ["create", "update", "delete"],
});

const admin = ac.newRole({
  ...adminAc.statements,
  game: ["create", "update", "publish"],
  gameItem: ["create", "update"],
});

const member = ac.newRole({
  ...memberAc.statements,
  game: ["create"],
  gameItem: ["create"],
});

// Create a publisher role with specific permissions
const publisher = ac.newRole({
  organization: ["update"],
  member: ["create"],
  invitation: ["create", "cancel"],
  game: ["create", "update", "publish"],
  gameItem: ["create", "update"],
});

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
    adminPlugin(),
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
        publisher
      },
      // Configure organization creation
      organizationCreation: {
        disabled: false,
        beforeCreate: async ({ organization, user }) => {
          // Add custom metadata for game publishers
          return {
            data: {
              ...organization,
              metadata: JSON.stringify({
                type: "publisher",
                verified: false,
                royaltyPercentage: 10.0
              })
            }
          };
        },
        afterCreate: async ({ organization, member, user }) => {
          // Create a publisher record in the database after organization creation
          await prisma.publisher.create({
            data: {
              name: organization.name,
              slug: organization.slug || organization.name.toLowerCase().replace(/\s+/g, '-'),
              organizationId: organization.id,
              description: "",
              isVerified: false,
              royaltyPercentage: 10.0
            }
          });
        }
      },
      // Configure invitation email
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/organizations/accept-invitation/${data.id}`;
        await sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name || "",
          invitedByEmail: data.inviter.user.email || "",
          teamName: data.organization.name,
          inviteLink
        });
      }
    })
  ],
  debug: process.env.NODE_ENV === "development",
});