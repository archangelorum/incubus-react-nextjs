import UserTable from '@/components/features/users/UserTable';
import { fetchPlatformStaffServer } from '@/utils/fetch/server/platform-staff';

export default async function PlatformStaffPage() {
    const page = 1;
    const limit = 10;
    const { staff, totalStaff } = await fetchPlatformStaffServer(page, limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Platform Staff Management</h1>
                <div className="flex space-x-4">
                    <button className="action-button px-4 py-2 rounded-lg">
                        Export Data
                    </button>
                    <button className="action-button px-4 py-2 rounded-lg">
                        Add Staff Member
                    </button>
                </div>
            </div>

            <div className="card p-6">
                <UserTable
                    initialUsers={staff}
                    totalUsers={totalStaff}
                    userType="PlatformStaff"
                    showDelete
                    showModify
                />
            </div>
        </div>
    );
} 