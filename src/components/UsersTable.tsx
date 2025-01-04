'use client';

import React, { useState } from 'react';
import { IUser } from '@/interfaces';
import SearchBar from './SearchBar';

// Client Component: Handles user actions (rank up, rank down, delete)
const UsersTable = ({ initialUsers }: { initialUsers: IUser[] }) => {
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>(initialUsers);

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/users`, { 
                method: 'DELETE',
                body: JSON.stringify({
                    id: id
                })
            });
            // Update the state to remove the deleted user
            setFilteredUsers((prevUsers) => prevUsers.filter(user => user.id !== id));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleRoleChange = async (id: string, action: "rankUp" | "rankDown") => {
        try {
            const response = await fetch(`/api/users`, {
                method: 'PATCH',
                body: JSON.stringify({
                    id: id,
                    action: action
                })
            });
            const updatedUser = await response.json();

            setFilteredUsers((prevUsers) =>
                prevUsers.map(user =>
                    user.id === updatedUser.id ? updatedUser : user
                )
            );
        } catch (error) {
            console.error("Error updating user's role:", error);
        }
    };

    const handleSearchChange = async (searchQuery: string) => {
        setFilteredUsers(
            initialUsers.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.includes(searchQuery.toLowerCase())
            )
        );
    }

    // Categorize users based on their roleId
    const usersByRole = {
        admins: filteredUsers.filter(user => user.roleId === 3),
        contentCreators: filteredUsers.filter(user => user.roleId === 2),
        users: filteredUsers.filter(user => user.roleId === 1),
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Admin User Management</h1>

            <SearchBar onChangeEvent={handleSearchChange} />

            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Admins Table */}
                <div className="flex-1 min-w-[300px]">
                    <h2 className="text-2xl font-semibold mb-4">Admins</h2>
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Name</th>
                                <th className="py-2 px-4 border-b">Email</th>
                                <th className="py-2 px-4 border-b">Role Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersByRole.admins.map(user => (
                                <tr key={user.id}>
                                    <td className="py-2 px-4 border-b">{user.name}</td>
                                    <td className="py-2 px-4 border-b">{user.email}</td>
                                    <td className="py-2 px-4 border-b flex justify-evenly">
                                        <button
                                            onClick={() => handleRoleChange(user.id, 'rankDown')}
                                            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                        >
                                            ↓ Rank Down
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Content Creators Table */}
                <div className="flex-1 min-w-[300px]">
                    <h2 className="text-2xl font-semibold mb-4">Content Creators</h2>
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Name</th>
                                <th className="py-2 px-4 border-b">Email</th>
                                <th className="py-2 px-4 border-b">Role Management</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersByRole.contentCreators.map(user => (
                                <tr key={user.id}>
                                    <td className="py-2 px-4 border-b">{user.name}</td>
                                    <td className="py-2 px-4 border-b">{user.email}</td>
                                    <td className="py-2 px-4 border-b text-center space-y-2">
                                        <button
                                            onClick={() => handleRoleChange(user.id, 'rankUp')}
                                            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                        >
                                            ↑ Rank Up
                                        </button>
                                        <button
                                            onClick={() => handleRoleChange(user.id, 'rankDown')}
                                            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                        >
                                            ↓ Rank Down
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Users Table */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Users</h2>
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Email</th>
                            <th className="py-2 px-4 border-b">Role Management</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersByRole.users.map(user => (
                            <tr key={user.id}>
                                <td className="py-2 px-4 border-b">{user.name}</td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b text-center">
                                    <button
                                        onClick={() => handleRoleChange(user.id, 'rankUp')}
                                        className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 align-middle"
                                    >
                                        ↑ Rank Up
                                    </button>
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTable;
