import "next-auth";

declare module "next-auth" {
  interface User {
    roleId: number
  }

  interface Session {
    user: User;
  }
}