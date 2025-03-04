import UserTable from '@/components/features/users/UserTable';
import { fetchPlayersServer } from '@/utils/fetch/server/players';

export default async function PlatformPlayersPage() {
    const page = 1;
    const limit = 10;
    const { players, totalPlayers } = await fetchPlayersServer(page, limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Players Management</h1>
                <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Export Data
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Add Player
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <UserTable
                    initialUsers={players}
                    totalUsers={totalPlayers}
                    userType="Player"
                    showDelete
                    showModify
                />
            </div>
        </div>
    );
} 