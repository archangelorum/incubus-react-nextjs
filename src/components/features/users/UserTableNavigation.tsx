import { PlatformStaffRole, PlayerType, PublisherStaffRole } from "@/types/enums";
import Link from "next/link";

// Define types for the component props
interface UserTableNavigationProps {
    role: PlayerType | PlatformStaffRole | PublisherStaffRole;
}

const UserTableNavigation: React.FC<UserTableNavigationProps> = ({ role }) => {
    return (
        <div className="mb-6 flex space-x-4">
            {/* Render navigation links based on role */}
            {(role in PlatformStaffRole) && (
                <Link href="/admin/players" className="text-blue-500">
                    Players
                </Link>
            )}

            {(role in PlatformStaffRole) && (
                <Link href="/admin/platform-staff" className="text-blue-500">
                    Platform
                </Link>
            )}

            {(role in PublisherStaffRole) && (
                <Link href="/admin/publisher-staff" className="text-blue-500">
                    Publisher
                </Link>
            )}

            {/* Default if role is unrecognized */}
            {!role && (
                <p className="text-red-500">Unauthorized access</p>
            )}
        </div>
    );
};

export default UserTableNavigation;