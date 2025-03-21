import { createAuthClient } from "better-auth/react"
import { adminClient, organizationClient, passkeyClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        passkeyClient(),
        adminClient(),
        organizationClient()
    ],
});
