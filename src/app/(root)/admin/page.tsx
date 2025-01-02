import { auth, signIn } from "@/auth";
import UsersTable from "@/components/UsersTable";

const AdminPage = async () => {
    const session = await auth();
    
    if (!session || session?.user?.roleId !== 3)
        await signIn();

    return (
        <UsersTable />
    )
};

export default AdminPage;
