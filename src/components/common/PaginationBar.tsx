"use client";

interface PaginationBarProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PaginationBar = ({ currentPage, totalPages, onPageChange }: PaginationBarProps) => {
    return (
        <div className="flex justify-center space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-foreground/10 rounded-md disabled:opacity-50 text-foreground hover:bg-foreground/10"
            >
                Previous
            </button>
            <span className="px-4 py-2 text-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-foreground/10 rounded-md disabled:opacity-50 text-foreground hover:bg-foreground/10"
            >
                Next
            </button>
        </div>
    );
};

export default PaginationBar;