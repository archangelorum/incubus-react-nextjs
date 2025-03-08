import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-gray-300 mb-8">You don't have permission to access this page.</p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
} 