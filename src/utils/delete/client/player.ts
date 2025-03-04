export const deletePlayer = async (userId: string) => {
    try {
        const response = await fetch('/api/player', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error deleting player');
        }

        return data;
    } catch (error) {
        console.error("Error deleting player:", error);
        throw error;
    }
};