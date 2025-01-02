import { prisma } from "../../prisma/prisma";

interface User {
    id: string;
    name: string;
    email: string;
    roleId: number;
}

// Fetch users from API or database
async function fetchUsers(): Promise<User[]> {
    const response = await fetch('http://localhost:3000/api/users', {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return await response.json();
}

const handleDelete = async (id: string) => {
    try {
        await prisma.user.delete({
            where: { id },
        });

        console.log(`User with id ${id} deleted successfully.`);
    } catch (error) {
        console.error("Error deleting user:", error);
    }
};

const handleRoleChange = async (id: string, action: "rankUp" | "rankDown") => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        
        if (!user) throw new Error("User not found");

        let newRoleId = user.roleId;

        // Rank up (increment roleId) or Rank down (decrement roleId)
        if (action === "rankUp" && newRoleId < 3) {
            newRoleId += 1;
        } else if (action === "rankDown" && newRoleId > 1) {
            newRoleId -= 1;
        }

        await prisma.user.update({
            where: { id },
            data: { roleId: newRoleId },
        });

        console.log(`User's role updated successfully.`);
    } catch (error) {
        console.error("Error updating user's role:", error);
    }
};

const UsersTable = async () => {
    const allUsers = await fetchUsers();

    const users = allUsers.filter(user => user.roleId === 1);
    const contentCreators = allUsers.filter(user => user.roleId === 2);
    const admins = allUsers.filter(user => user.roleId === 3);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Admin User Management</h1>

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
                            {admins.map(user => (
                                <tr key={user.id}>
                                    <td className="py-2 px-4 border-b">{user.name}</td>
                                    <td className="py-2 px-4 border-b">{user.email}</td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex gap-4">
                                            <form action={async () => {
                                                "use server";
                                                await handleRoleChange(user.id, "rankDown");
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                                >
                                                    ↓ Rank Down
                                                </button>
                                            </form>
                                        </div>
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
                            {contentCreators.map(user => (
                                <tr key={user.id}>
                                    <td className="py-2 px-4 border-b">{user.name}</td>
                                    <td className="py-2 px-4 border-b">{user.email}</td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex gap-4">
                                            <form action={async () => {
                                            "use server";
                                            await handleRoleChange(user.id, "rankUp");
                                        }}>
                                            <button
                                                type="submit"
                                                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                            >
                                                ↑ Rank Up
                                            </button>
                                            </form>
                                            <form action={async () => {
                                            "use server";
                                            await handleRoleChange(user.id, "rankDown");
                                        }}>
                                            <button
                                                type="submit"
                                                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                            >
                                                ↓ Rank Down
                                            </button>
                                            </form>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <form action={async () => {
                                            "use server";
                                            await handleDelete(user.id);
                                        }}>
                                            <button type="submit" className="mt-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                                                Delete
                                            </button>
                                        </form>
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
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="py-2 px-4 border-b">{user.name}</td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex gap-4">
                                        <form action={async () => {
                                            "use server";
                                            await handleRoleChange(user.id, "rankUp");
                                        }}>
                                            <button
                                                type="submit"
                                                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                            >
                                                ↑ Rank Up
                                            </button>
                                        </form>
                                    </div>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <form action={async () => {
                                        "use server";
                                        await handleDelete(user.id);
                                    }}>
                                        <button type="submit" className="mt-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                                            Delete
                                        </button>
                                    </form>
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
