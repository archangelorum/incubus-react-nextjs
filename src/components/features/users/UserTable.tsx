"use client";

import { UserWithDetails } from "@/types/interfaces/player";
import { PlayerType } from "@/types/enums";
import PaginationBar from "../../common/PaginationBar";
import { useState, useMemo } from "react";
import { updatePlayer } from "@/utils/update/client/player";
import { deletePlayer } from "@/utils/delete/client/player";
import SearchBar from "../../common/SearchBar";
import Toast from "../../common/Toast";

interface UserTableProps {
    initialUsers: UserWithDetails[];
    totalUsers: number;
    userType: "Player" | "PlatformStaff" | "PublisherStaff";
    showDelete?: boolean;
    showModify?: boolean;
}

interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

const getTableHeaders = (userType: "Player" | "PlatformStaff" | "PublisherStaff") => {
    switch (userType) {
        case "Player":
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
            );
        case "PlatformStaff":
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
            );
        case "PublisherStaff":
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
            );
    }
};

const getOptions = (userType: "Player" | "PlatformStaff" | "PublisherStaff") => {
    switch (userType) {
        case "Player":
            return Object.keys(PlayerType).map((key) => <option key={key}>{key}</option>);
        case "PlatformStaff":
        case "PublisherStaff":
            return (
                <>
                    <option key="admin">Admin</option>
                    <option key="moderator">Moderator</option>
                </>
            );
        default:
            return null;
    }
};

const handleUpdateUserFormSubmit = async (
    e: React.FormEvent,
    userType: "Player" | "PlatformStaff" | "PublisherStaff",
    userId: string,
    setLoading: React.Dispatch<React.SetStateAction<{ isLoading: boolean; operation: string | null }>>,
    setUsers: React.Dispatch<React.SetStateAction<UserWithDetails[]>>,
    currentUsers: UserWithDetails[],
    setToast: React.Dispatch<React.SetStateAction<ToastState>>
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
                setToast({
                    show: true,
                    message: "User updated successfully",
                    type: "success"
                });
                break;
            default:
                throw new Error("Unsupported user type for update");
        }
    } catch (error) {
        console.error("Error updating user:", error);
        setToast({
            show: true,
            message: error instanceof Error ? error.message : "Error updating user",
            type: "error"
        });
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
    setToast: React.Dispatch<React.SetStateAction<ToastState>>
) => {
    e.preventDefault();
    setLoading({ isLoading: true, operation: "deleting" });
    
    try {
        switch (userType) {
            case "Player":
                await deletePlayer(userId);
                setUsers(currentUsers.filter(user => user.user.id !== userId));
                setToast({
                    show: true,
                    message: "User deleted successfully",
                    type: "success"
                });
                break;
            default:
                throw new Error("Unsupported user type for deletion");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        setToast({
            show: true,
            message: error instanceof Error ? error.message : "Error deleting user",
            type: "error"
        });
    } finally {
        setLoading({ isLoading: false, operation: null });
    }
}

const UserTable = ({ initialUsers, totalUsers, userType, showDelete = true, showModify = true }: UserTableProps) => {
    const [users, setUsers] = useState<UserWithDetails[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "info" });

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
            setToast({ show: true, message: "User deleted successfully", type: "success" });
        } catch (error) {
            setToast({ show: true, message: "Failed to delete user", type: "error" });
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
            setToast({ show: true, message: "User updated successfully", type: "success" });
        } catch (error) {
            setToast({ show: true, message: "Failed to update user", type: "error" });
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <SearchBar onSearch={setSearchTerm} />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {getTableHeaders(userType)}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.user.email}</td>
                                {userType === "Player" && 'type' in user && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">Active</td>
                                    </>
                                )}
                                {userType === "PlatformStaff" && 'role' in user && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">Active</td>
                                    </>
                                )}
                                {userType === "PublisherStaff" && 'role' in user && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">Publisher Name</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">Active</td>
                                    </>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        {showModify && (
                                            <button
                                                onClick={() => handleModify(user.user.id, {})}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                        {showDelete && (
                                            <button
                                                onClick={() => handleDelete(user.user.id)}
                                                className="text-red-600 hover:text-red-900"
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
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default UserTable;
