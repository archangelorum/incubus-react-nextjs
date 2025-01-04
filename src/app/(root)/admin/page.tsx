import { auth, signIn } from "@/auth";
import { prisma } from "../../../../prisma/prisma";
import UsersTable from "@/components/UsersTable";
import { IUser } from "@/interfaces";

const AdminPage = async () => {
    const session = await auth();

    if (!session || session?.user?.roleId !== 3)
        await signIn();

    try {
        // Fetch users from the database
        const users = await prisma.user.findMany();
        return <UsersTable initialUsers={users as IUser[]} />;
    } catch (error) {
        console.error("Error fetching users:", error);
        return <div>Error loading users.</div>;
    }
};

export default AdminPage;
