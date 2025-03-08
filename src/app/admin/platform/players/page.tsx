import UserTable from '@/components/features/users/UserTable';
import { fetchPlayersServer } from '@/utils/fetch/server/players';

export default async function PlatformPlayersPage() {
    const page = 1;
    const limit = 10;
    const { players, totalPlayers } = await fetchPlayersServer(page, limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Players Management</h1>
                <div className="flex space-x-4">
                    <button className="action-button px-4 py-2 rounded-lg">
                        Export Data
                    </button>
                    <button className="action-button px-4 py-2 rounded-lg">
                        Add Player
                    </button>
                </div>
            </div>

            <div className="card p-6">
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