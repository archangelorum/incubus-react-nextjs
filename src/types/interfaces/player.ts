// types/player.ts
import { PlayerType } from "@/types/enums";

export interface BaseUser {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}

export interface UserWithRole extends BaseUser {
    roleId: number;
}

export interface PlayerWithUser {
    type: PlayerType;
    user: BaseUser;
}

export interface StaffWithUser {
    role: "Admin" | "Moderator";
    user: BaseUser;
}

export type UserWithDetails = PlayerWithUser | StaffWithUser;

export interface UserResponse {
    success: boolean;
    error?: string;
    users: UserWithDetails[];
    totalUsers: number;
    page: number;
    limit: number;
}

export interface UserActionResponse {
    success: boolean;
    error?: string;
    user?: UserWithDetails;
}
