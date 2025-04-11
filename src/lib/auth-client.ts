import { createAuthClient } from "better-auth/react"
import { adminClient, oneTapClient, organizationClient, passkeyClient } from "better-auth/client/plugins"
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

export const authClient = createAuthClient({
    plugins: [
        oneTapClient({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string | "",
        }),
        passkeyClient(),
        adminClient(),
        organizationClient({
            ac,
            roles: {
                owner,
                admin,
                member,
                publisher
            }
        })
    ],
});