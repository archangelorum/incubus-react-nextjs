import UserTable from '@/components/UserTable';
import { fetchPlatformStaffServer } from '@/utils/fetch/server/platform-staff';

export default async function PlatformStaffPage() {
    const page = 1;
    const limit = 10;
    const { staff, totalStaff } = await fetchPlatformStaffServer(page, limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Platform Staff Management</h1>
                <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Export Data
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Add Staff Member
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
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