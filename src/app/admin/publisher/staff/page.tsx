import UserTable from '@/components/features/users/UserTable';
import { fetchPublisherStaffServer } from '@/utils/fetch/server/publisher-staff';

export default async function PublisherStaffPage() {
    const page = 1;
    const limit = 10;
    const { staff, totalStaff } = await fetchPublisherStaffServer(page, limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Publisher Staff Management</h1>
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
                    userType="PublisherStaff"
                    showDelete
                    showModify
                />
            </div>
        </div>
    );
} 