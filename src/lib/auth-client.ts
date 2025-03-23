import { createAuthClient } from "better-auth/react"
import { adminClient, oneTapClient, organizationClient, passkeyClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [
        oneTapClient({
            clientId: "769858400792-q54seavc1b4iu6psqg1mdcr8llif60mf.apps.googleusercontent.com",
        }),
        passkeyClient(),
        adminClient(),
        organizationClient()
    ],
});