import React from 'react';

interface SearchBarProps {
    onChangeEvent: (searchQuery: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onChangeEvent }) => {
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        onChangeEvent(query);
    };
    return (
        <div className="mb-6">
            <form>
                <input
                    type="text"
                    name="search"
                    placeholder="Search by name or email"
                    className="p-2 border border-gray-300 rounded-lg w-full"
                    onChange={handleSearchChange}
                />
            </form>
        </div>
    );
};

export default SearchBar;
