import { PlayerType } from "@/types/enums";

export const updatePlayer = async (userId: string, newType: PlayerType) => {
    try {
        const response = await fetch('/api/player', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                newType: newType
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error updating player');
        }

        return data;
    } catch (error) {
        console.error("Error updating player:", error);
        throw error;
    }
};
