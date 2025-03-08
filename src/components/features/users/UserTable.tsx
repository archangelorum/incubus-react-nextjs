"use client";

import { UserWithDetails } from "@/types/interfaces/player";
import { PlayerType } from "@/types/enums";
import PaginationBar from "../../common/PaginationBar";
import { useState, useMemo } from "react";
import { updatePlayer } from "@/utils/update/client/player";
import { deletePlayer } from "@/utils/delete/client/player";
import SearchBar from "../../common/SearchBar";
import { toast } from "sonner";

interface UserTableProps {
    initialUsers: UserWithDetails[];
    totalUsers: number;
    userType: "Player" | "PlatformStaff" | "PublisherStaff";
    showDelete?: boolean;
    showModify?: boolean;
}

const getTableHeaders = (userType: "Player" | "PlatformStaff" | "PublisherStaff") => {
    switch (userType) {
        case "Player":
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Actions</th>
                </>
            );
        case "PlatformStaff":
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Actions</th>
                </>
            );
        case "PublisherStaff":
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Publisher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider table-header">Actions</th>
                </>
            );
    }
};

const handleUpdateUserFormSubmit = async (
    e: React.FormEvent,
    userType: "Player" | "PlatformStaff" | "PublisherStaff",
    userId: string,
    setLoading: React.Dispatch<React.SetStateAction<{ isLoading: boolean; operation: string | null }>>,
    setUsers: React.Dispatch<React.SetStateAction<UserWithDetails[]>>,
    currentUsers: UserWithDetails[],
) => {
    e.preventDefault();
    setLoading({ isLoading: true, operation: "updating" });
    
    try {
        const formData = new FormData(e.target as HTMLFormElement);
        const selectedValue = formData.get("dropDownList");

        if (!selectedValue) {
            throw new Error("No value selected");
        }

        switch (userType) {
            case "Player":
                const updatedPlayer = await updatePlayer(userId, selectedValue as PlayerType);
                setUsers(currentUsers.map(user => 
                    'type' in user && user.user.id === userId 
                        ? { ...user, type: selectedValue as PlayerType }
                        : user
                ));
                toast.success("User updated successfully");
                break;
            default:
                toast.error("Unsupported user type for update");
        }
    } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Failed to update user");
    } finally {
        setLoading({ isLoading: false, operation: null });
    }
};

const handleDeleteUserFormSubmit = async (
    e: React.FormEvent,
    userType: "Player" | "PlatformStaff" | "PublisherStaff",
    userId: string,
    setLoading: React.Dispatch<React.SetStateAction<{ isLoading: boolean; operation: string | null }>>,
    setUsers: React.Dispatch<React.SetStateAction<UserWithDetails[]>>,
    currentUsers: UserWithDetails[],
) => {
    e.preventDefault();
    setLoading({ isLoading: true, operation: "deleting" });
    
    try {
        switch (userType) {
            case "Player":
                await deletePlayer(userId);
                setUsers(currentUsers.filter(user => user.user.id !== userId));
                toast.success("User deleted successfully");
                break;
            default:
                throw new Error("Unsupported user type for deletion");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
    } finally {
        setLoading({ isLoading: false, operation: null });
    }
}

const UserTable = ({ initialUsers, totalUsers, userType, showDelete = true, showModify = true }: UserTableProps) => {
    const [users, setUsers] = useState<UserWithDetails[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleDelete = async (userId: string) => {
        try {
            await deletePlayer(userId);
            setUsers(users.filter(user => user.user.id !== userId));
            toast.success("User deleted successfully");
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleModify = async (userId: string, updatedData: Partial<UserWithDetails>) => {
        try {
            const user = users.find(u => u.user.id === userId);
            if (!user || !('type' in user)) {
                throw new Error('Invalid user type');
            }
            const updatedUser = await updatePlayer(userId, user.type);
            setUsers(users.map(u => u.user.id === userId ? updatedUser : u));
            toast.success("User updated successfully");
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <SearchBar onSearch={setSearchTerm} />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-foreground/10">
                    <thead className="bg-background">
                        <tr>
                            {getTableHeaders(userType)}
                        </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-foreground/10">
                        {filteredUsers.map((user) => (
                            <tr key={user.user.id} className="table-row">
                                <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.user.email}</td>
                                {userType === "Player" && 'type' in user && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">Active</td>
                                    </>
                                )}
                                {userType === "PlatformStaff" && 'role' in user && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">Active</td>
                                    </>
                                )}
                                {userType === "PublisherStaff" && 'role' in user && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">Publisher Name</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">Active</td>
                                    </>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        {showModify && (
                                            <button
                                                onClick={() => handleModify(user.user.id, {})}
                                                className="action-button px-3 py-1 rounded-md text-sm"
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                        {showDelete && (
                                            <button
                                                onClick={() => handleDelete(user.user.id)}
                                                className="destructive-button px-3 py-1 rounded-md text-sm"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationBar
                currentPage={currentPage}
                totalPages={Math.ceil(totalUsers / 10)}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default UserTable;
